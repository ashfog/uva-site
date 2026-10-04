# Guestbook (not enabled) · 留言板（暂未启用）

**English** — A Cloudflare Pages/Workers Function + D1 guestbook backend that is currently not wired into the homepage. To enable it: put `guestbook.js` back under `functions/api/`, run `schema.sql` with `wrangler d1 execute`, merge the D1 binding from `wrangler.example.toml` into your project, then add a form to the homepage.

**简体中文** — 基于 Cloudflare Function + D1 的访客留言后端，目前主页没有接入。要启用时：把 `guestbook.js` 放回 `functions/api/`，用 `wrangler d1 execute` 执行 `schema.sql`，把 `wrangler.example.toml` 里的 D1 绑定并入你的项目，再在首页加一个表单即可。
