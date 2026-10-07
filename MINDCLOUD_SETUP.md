# Mind Cloud — going live on sadiegold.co (one-time setup, ~10 min)

The backend is `functions/api/[[path]].js`. Cloudflare Pages runs it automatically
on the same domain once it's in the GitHub repo. It needs two things from the
Cloudflare dashboard:

## 1. Create the database
1. Cloudflare dashboard → **Storage & Databases → D1** → **Create database** → name it `mindcloud`.
2. Open it → **Console** tab → paste the whole of
   `~/dev/port_dev_source/mindcloud-local/setup.sql` → **Execute**.
   This creates the tables and loads your 11 existing notes.

## 2. Connect it to the site
Dashboard → **Workers & Pages** → your sadiegold.co project → **Settings**:
1. **Bindings** → Add → **D1 database** → variable name `DB` → pick `mindcloud`.
2. **Variables and Secrets** → Add → type **Secret** → name `MINDCLOUD_PIN` →
   value = your NEW PIN. Use 6+ digits, and NOT 4131 — that one was publicly
   readable on the old site (in mindcloud/server.py).
3. Do both for **Production** (and Preview if you use preview deploys).

## 3. Deploy
Commit/push the repo (including the `functions/` folder and `_redirects`).
Settings changes only apply to deploys made AFTER them, so push (or hit
**Retry deployment**) after steps 1–2.

## Using it
- View: https://sadiegold.co/mindcloud/
- Add (phone, anywhere): https://sadiegold.co/mindcloud/add — enter the PIN once;
  that device stays logged in for 30 days. Save it to your home screen.
- New notes pop into the cloud live (the page checks every 2s); viewers see
  "thinking..." while you type.
- 5 wrong PINs from one place locks that place out for 15 minutes.
- To change the PIN: edit the `MINDCLOUD_PIN` secret and redeploy — this also
  logs out every device.
- Remove a note: D1 → mindcloud → Console → `DELETE FROM ideas WHERE title = 'knitting';`
- Remove the 8 sample notes now instead of letting them expire Oct 25:
  `DELETE FROM ideas WHERE id LIKE 'test-%';`
