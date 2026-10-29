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

  PORTFOLIO ORDERS (company links, managed at /admin/; see js/order.js):
    GET    /api/order/<key>    public — { order: [slugs] } for ?for=<key>
    GET    /api/orders         PIN session required — every saved link
    PUT    /api/orders/<key>   PIN session required — save { label, order }
    DELETE /api/orders/<key>   PIN session required — remove a link
  Stored in the same D1 database; the portfolio_orders table creates
  itself on first save, so there's no extra dashboard setup.

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
  const parts = params.path || [];
  const route = parts.join('/');
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
    if (parts[0] === 'order' && parts.length === 2 && method === 'GET') return getOrder(env, parts[1]);
    if (route === 'orders' && method === 'GET') return listOrders(request, env);
    if (parts[0] === 'orders' && parts.length === 2 && method === 'PUT') return saveOrder(request, env, parts[1]);
    if (parts[0] === 'orders' && parts.length === 2 && method === 'DELETE') return deleteOrder(request, env, parts[1]);
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

// ---------- portfolio orders ----------

const ORDER_KEY = /^[a-z0-9-]{1,48}$/;   // the ?for= part of a company link
const PROJECT_SLUG = /^[a-z0-9-]{1,64}$/;

async function ensureOrdersTable(env) {
  await env.DB.prepare(
    'CREATE TABLE IF NOT EXISTS portfolio_orders (key TEXT PRIMARY KEY, label TEXT NOT NULL, project_order TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)'
  ).run();
}

async function getOrder(env, key) {
  if (!ORDER_KEY.test(key)) return json(404, { ok: false, error: 'not found' });
  let row = null;
  try {
    row = await env.DB.prepare('SELECT project_order FROM portfolio_orders WHERE key = ?').bind(key).first();
  } catch {
    // table doesn't exist yet (nothing saved): same as an unknown link
  }
  if (!row) return json(404, { ok: false, error: 'not found' });
  return json(200, { ok: true, order: JSON.parse(row.project_order) });
}

async function listOrders(request, env) {
  if (!(await isAuthed(request, env))) return json(401, { ok: false, error: 'not authenticated' });
  await ensureOrdersTable(env);
  const { results } = await env.DB
    .prepare('SELECT key, label, project_order, updated_at AS updatedAt FROM portfolio_orders ORDER BY updated_at DESC')
    .all();
  return json(200, {
    ok: true,
    orders: results.map(r => ({ key: r.key, label: r.label, order: JSON.parse(r.project_order), updatedAt: r.updatedAt })),
  });
}

async function saveOrder(request, env, key) {
  if (!(await isAuthed(request, env))) return json(401, { ok: false, error: 'not authenticated' });
  if (!ORDER_KEY.test(key)) return json(400, { ok: false, error: 'link name: lowercase letters, numbers and dashes only' });
  const data = await readJson(request);
  const label = String(data.label || '').trim().slice(0, 80) || key;
  const order = Array.isArray(data.order) ? data.order.map(String).filter(s => PROJECT_SLUG.test(s)).slice(0, 50) : [];
  if (!order.length) return json(400, { ok: false, error: 'pick at least one project' });
  await ensureOrdersTable(env);
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO portfolio_orders (key, label, project_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?) ' +
    'ON CONFLICT(key) DO UPDATE SET label = excluded.label, project_order = excluded.project_order, updated_at = excluded.updated_at'
  ).bind(key, label, JSON.stringify(order), now, now).run();
  return json(200, { ok: true, key, label, order });
}

async function deleteOrder(request, env, key) {
  if (!(await isAuthed(request, env))) return json(401, { ok: false, error: 'not authenticated' });
  await ensureOrdersTable(env);
  await env.DB.prepare('DELETE FROM portfolio_orders WHERE key = ?').bind(key).run();
  return json(200, { ok: true });
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
