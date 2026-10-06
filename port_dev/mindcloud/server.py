#!/usr/bin/env python3
"""
Mind Cloud — a tiny self-contained backend for Sadie's live idea feed.

No external dependencies (stdlib only) so it runs anywhere Python 3 does.
Ideas persist to data/ideas.json. Swap this file for a real server-side
stack later without changing public/mindcloud.html or public/add.html —
they only talk to /api/ideas and /api/login.

CHANGE THE PIN BELOW before this is ever exposed publicly.
"""

import json
import mimetypes
import os
import secrets
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

PIN = "4131"
PORT = 4000
MAX_AGE_DAYS = 30  # ideas older than this are moved out of the live feed

ROOT = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(ROOT, "public")
DATA_FILE = os.path.join(ROOT, "data", "ideas.json")
ARCHIVE_FILE = os.path.join(ROOT, "data", "archive.json")
SESSION_COOKIE = "mc_session"
TYPING_TTL_SECONDS = 3  # how long a single "still typing" ping lasts before auto-expiring

_sessions = set()
_typing_until = 0.0  # epoch seconds; viewers see "typing" while time.time() < this


def load_json_list(path):
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)


def save_json_list(path, items):
    with open(path, "w") as f:
        json.dump(items, f, indent=2)


def load_ideas():
    return load_json_list(DATA_FILE)


def save_ideas(ideas):
    save_json_list(DATA_FILE, ideas)


def _created_at_epoch(idea):
    # createdAt is always written as "%Y-%m-%dT%H:%M:%S.000Z" by this server;
    # tolerate a bare seconds-precision ISO string too, just in case.
    raw = idea.get("createdAt", "")
    for fmt in ("%Y-%m-%dT%H:%M:%S.%fZ", "%Y-%m-%dT%H:%M:%SZ"):
        try:
            return datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc).timestamp()
        except ValueError:
            continue
    return time.time()  # unparseable — treat as "just now" rather than crash


def archive_old_ideas():
    """Move ideas older than MAX_AGE_DAYS out of ideas.json into archive.json.
    Runs on every /api/ideas GET, so the live feed self-cleans without a
    separate cron/scheduler process."""
    ideas = load_ideas()
    cutoff = time.time() - MAX_AGE_DAYS * 86400
    fresh, stale = [], []
    for idea in ideas:
        (stale if _created_at_epoch(idea) < cutoff else fresh).append(idea)

    if stale:
        archive = load_json_list(ARCHIVE_FILE)
        archive.extend(stale)
        save_json_list(ARCHIVE_FILE, archive)
        save_ideas(fresh)

    return fresh


def parse_cookies(header):
    cookies = {}
    if not header:
        return cookies
    for part in header.split(";"):
        if "=" in part:
            k, v = part.strip().split("=", 1)
            cookies[k] = v
    return cookies


class Handler(BaseHTTPRequestHandler):
    server_version = "MindCloud/1.0"

    def log_message(self, fmt, *args):
        pass  # keep the terminal quiet

    # ---------- helpers ----------

    def _send_json(self, status, payload, extra_headers=None):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        for k, v in (extra_headers or {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def _is_authed(self):
        cookies = parse_cookies(self.headers.get("Cookie"))
        token = cookies.get(SESSION_COOKIE)
        return token is not None and token in _sessions

    def _read_json_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except Exception:
            return {}

    def _serve_static(self, rel_path):
        if rel_path in ("", "/"):
            rel_path = "mindcloud.html"
        rel_path = rel_path.lstrip("/")
        full_path = os.path.normpath(os.path.join(PUBLIC_DIR, rel_path))
        if not full_path.startswith(PUBLIC_DIR) or not os.path.isfile(full_path):
            self.send_error(404, "Not found")
            return
        content_type, _ = mimetypes.guess_type(full_path)
        with open(full_path, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", content_type or "application/octet-stream")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    # ---------- routes ----------

    def do_GET(self):
        path = urlparse(self.path).path

        if path == "/api/ideas":
            self._send_json(200, {"ideas": archive_old_ideas()})
            return

        if path == "/api/typing":
            self._send_json(200, {"typing": time.time() < _typing_until})
            return

        self._serve_static(path)

    def do_POST(self):
        global _typing_until
        path = urlparse(self.path).path

        if path == "/api/login":
            data = self._read_json_body()
            if str(data.get("pin", "")) == PIN:
                token = secrets.token_hex(16)
                _sessions.add(token)
                cookie = f"{SESSION_COOKIE}={token}; Path=/; HttpOnly; Max-Age=2592000; SameSite=Lax"
                self._send_json(200, {"ok": True}, {"Set-Cookie": cookie})
            else:
                self._send_json(401, {"ok": False, "error": "wrong pin"})
            return

        if path == "/api/typing":
            if not self._is_authed():
                self._send_json(401, {"ok": False, "error": "not authenticated"})
                return
            data = self._read_json_body()
            is_typing = data.get("typing", True)
            _typing_until = (time.time() + TYPING_TTL_SECONDS) if is_typing else 0.0
            self._send_json(200, {"ok": True})
            return

        if path == "/api/ideas":
            if not self._is_authed():
                self._send_json(401, {"ok": False, "error": "not authenticated"})
                return
            data = self._read_json_body()
            title = (data.get("title") or "").strip()
            if not title:
                self._send_json(400, {"ok": False, "error": "title required"})
                return
            idea = {
                "id": secrets.token_hex(8),
                "title": title[:120],
                "description": (data.get("description") or "").strip()[:600],
                "link": (data.get("link") or "").strip()[:300],
                "createdAt": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
            }
            ideas = load_ideas()
            ideas.append(idea)
            save_ideas(ideas)
            _typing_until = 0.0  # crisp cut to the pop-in instead of waiting out the TTL
            self._send_json(200, {"ok": True, "idea": idea})
            return

        self.send_error(404, "Not found")


if __name__ == "__main__":
    if PIN == "0000":
        print("⚠️  Using the default PIN (0000). Change PIN in server.py before this is ever public.")
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Mind Cloud running at http://localhost:{PORT}/")
    print(f"Add ideas at        http://localhost:{PORT}/add.html")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
