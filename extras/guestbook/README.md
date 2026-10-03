# 留言板（暂未启用）
Cloudflare Pages Function + D1 的访客留言后端，目前主页没有接入。要启用时：把 `guestbook.js` 放回 `functions/api/`，
`schema.sql` 用 `wrangler d1 execute` 执行，`wrangler.example.toml` 里的 D1 绑定并入 Pages 项目，再在首页加一个表单即可。
