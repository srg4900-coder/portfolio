#!/usr/bin/env python3
"""
Local dev server for port_dev — identical to `python3 -m http.server`
except every response carries Cache-Control: no-store.

WHY THIS EXISTS: plain http.server lets the browser's normal HTTP cache
kick in, which is invisible 99% of the time but occasionally serves a
stale CSS/JS file after an edit (a hard-refresh "fixes" it, but it's a
confusing thing to hit mid-development). This removes that entirely —
every file is always re-fetched fresh. There's no reason to ever want
caching while actively editing the site, so this is just the default.

Usage: python3 serve.py [port]   (defaults to 8811, matches .claude/launch.json)
"""

import os
import sys
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# SimpleHTTPRequestHandler serves relative to the process's CWD, not this
# script's location — chdir explicitly so it serves this project's files
# regardless of what directory the launcher started the process from.
os.chdir(os.path.dirname(os.path.abspath(__file__)))


# Mind Cloud's live data lives in its own backend (mindcloud/server.py, port
# 4000). mindcloud.html fetches same-origin /api/*, so when it's loaded from
# this server those requests are forwarded there instead of 404ing.
MINDCLOUD_API = 'http://127.0.0.1:4000'


class NoCacheHandler(SimpleHTTPRequestHandler):
    def _proxy_api(self):
        length = int(self.headers.get('Content-Length') or 0)
        body = self.rfile.read(length) if length else None
        req = urllib.request.Request(MINDCLOUD_API + self.path, data=body, method=self.command)
        for h in ('Content-Type', 'Cookie'):
            if self.headers.get(h):
                req.add_header(h, self.headers[h])
        try:
            resp = urllib.request.urlopen(req, timeout=5)
        except urllib.error.HTTPError as e:
            resp = e
        except OSError:
            self.send_error(502, 'Mind Cloud backend not running (python3 mindcloud/server.py)')
            return
        data = resp.read()
        self.send_response(resp.code)
        for h in ('Content-Type', 'Set-Cookie'):
            for v in resp.headers.get_all(h) or []:
                self.send_header(h, v)
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path.startswith('/api/'):
            return self._proxy_api()
        super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/'):
            return self._proxy_api()
        self.send_error(405)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # keep the terminal quiet


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8811
    server = ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler)
    print(f'Serving (no-cache) at http://localhost:{port}/')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
