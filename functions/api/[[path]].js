/*
  MIND CLOUD BACKEND — Cloudflare Pages Function
  ----------------------------------------------
  Replaces mindcloud/server.py for the live site. Cloudflare Pages runs
  any file under /functions as server code on the SAME domain, so this
  one catch-all file answers every /api/* request on sadiegold.co:

    GET  /api/ideas    public — ideas from the last 30 days
    POST /api/ideas    PIN session required — add an idea
    GET  /api/typing   public — is Sadie typing right now?
    POST /api/typing   PIN session required — "I'm typing" ping
    POST /api/login    exchange the PIN for a 30-day session cookie
    GET  /api/login    { ok } if the current cookie is still valid

  Cloudflare dashboard setup this needs (see MINDCLOUD_SETUP.md):
    - a D1 database bound to this Pages project as  DB
    - an encrypted environment variable              MINDCLOUD_PIN

  The PIN never appears in code or in the repo. Sessions are stateless
  signed cookies (HMAC keyed by the PIN), so changing the PIN in the
  dashboard instantly logs out every existing session. Wrong PINs are
  rate-limited per IP so a short PIN can't simply be brute-forced.
*/

const MAX_AGE_DAYS = 30;
const SESSION_DAYS = 30;
const TYPING_TTL_MS = 3000;
const MAX_FAILS = 5;                 // wrong PINs allowed per IP...
const LOCKOUT_MS = 15 * 60 * 1000;   // ...per this window, then locked out for it
const COOKIE = 'mc_session';

export async function onRequest(context) {
  const { request, env, params } = context;
  if (!env.DB || !env.MINDCLOUD_PIN) {
    return json(500, { ok: false, error: 'mind cloud backend not configured' });
  }
  const route = (params.path || []).join('/');
  const method = request.method;

  try {
    if (route === 'ideas' && method === 'GET') return getIdeas(env);
    if (route === 'ideas' && method === 'POST') return addIdea(request, env);
    if (route === 'typing' && method === 'GET') return getTyping(env);
    if (route === 'typing' && method === 'POST') return setTyping(request, env);
    if (route === 'login' && method === 'POST') return login(request, env);
    if (route === 'login' && method === 'GET') {
      return json(200, { ok: await isAuthed(request, env) });
    }
    return json(404, { ok: false, error: 'not found' });
  } catch (err) {
    return json(500, { ok: false, error: 'server error' });
  }
}

// ---------- routes ----------

async function getIdeas(env) {
  const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86400000).toISOString();
  const { results } = await env.DB
    .prepare('SELECT id, title, description, link, created_at AS createdAt FROM ideas WHERE created_at >= ? ORDER BY created_at')
    .bind(cutoff)
    .all();
  return json(200, { ideas: results });
}

async function addIdea(request, env) {
  if (!(await isAuthed(request, env))) return json(401, { ok: false, error: 'not authenticated' });
  const data = await readJson(request);
  const title = String(data.title || '').trim();
  if (!title) return json(400, { ok: false, error: 'title required' });

  const idea = {
    id: randomHex(8),
    title: title.slice(0, 120),
    description: String(data.description || '').trim().slice(0, 600),
    link: String(data.link || '').trim().slice(0, 300),
    createdAt: new Date().toISOString(),
  };
  await env.DB.batch([
    env.DB.prepare('INSERT INTO ideas (id, title, description, link, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(idea.id, idea.title, idea.description, idea.link, idea.createdAt),
    // crisp cut to the pop-in instead of waiting out the typing TTL
    env.DB.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES ('typing_until', 0)"),
  ]);
  return json(200, { ok: true, idea });
}

async function getTyping(env) {
  const row = await env.DB.prepare("SELECT value FROM kv WHERE key = 'typing_until'").first();
  return json(200, { typing: !!row && Date.now() < row.value });
}

async function setTyping(request, env) {
  if (!(await isAuthed(request, env))) return json(401, { ok: false, error: 'not authenticated' });
  const data = await readJson(request);
  const until = data.typing === false ? 0 : Date.now() + TYPING_TTL_MS;
  await env.DB.prepare("INSERT OR REPLACE INTO kv (key, value) VALUES ('typing_until', ?)").bind(until).run();
  return json(200, { ok: true });
}

async function login(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const failKey = 'fail:' + ip;
  const now = Date.now();

  const row = await env.DB.prepare('SELECT value, extra FROM kv WHERE key = ?').bind(failKey).first();
  const windowStart = row ? row.extra : 0;
  const fails = row && now - windowStart < LOCKOUT_MS ? row.value : 0;
  if (fails >= MAX_FAILS) {
    return json(429, { ok: false, error: 'too many tries — wait 15 minutes' });
  }

  const data = await readJson(request);
  if (!timingSafeEqual(String(data.pin || ''), String(env.MINDCLOUD_PIN))) {
    await env.DB.prepare('INSERT OR REPLACE INTO kv (key, value, extra) VALUES (?, ?, ?)')
      .bind(failKey, fails + 1, fails === 0 ? now : windowStart).run();
    return json(401, { ok: false, error: 'wrong pin' });
  }

  await env.DB.prepare('DELETE FROM kv WHERE key = ?').bind(failKey).run();
  const exp = now + SESSION_DAYS * 86400000;
  const token = exp + '.' + (await sign(String(exp), env.MINDCLOUD_PIN));
  const cookie = `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
  return json(200, { ok: true }, { 'Set-Cookie': cookie });
}

// ---------- helpers ----------

async function isAuthed(request, env) {
  const match = (request.headers.get('Cookie') || '').match(new RegExp(COOKIE + '=([^;]+)'));
  if (!match) return false;
  const [exp, sig] = match[1].split('.');
  if (!exp || !sig || Date.now() > Number(exp)) return false;
  return timingSafeEqual(sig, await sign(exp, env.MINDCLOUD_PIN));
}

async function sign(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode('mindcloud:' + secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function randomHex(bytes) {
  return [...crypto.getRandomValues(new Uint8Array(bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
}

async function readJson(request) {
  try { return await request.json(); } catch { return {}; }
}

function json(status, payload, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
  });
}
