# Agent instructions

This repo is a Markdown-driven bilingual personal landing page (Cloudflare Pages). **Read [`SKILL.md`](SKILL.md) before touching anything under `content/`** — it defines the file layout, front matter, SEO writing rules, polishing rules and the publish workflow.

Quick facts
- One post = `content/<section>/<slug>.zh.md` + `<slug>.en.md`; pushing to `main` publishes it automatically.
- Commands: `npm install` · `npm run check` (build + SEO/link audit, must pass) · `npm run new -- <section> <slug> "中文标题" "English title"`.
- Don't modify `build.mjs`, `src/`, `.github/` or `site.config.json` unless asked. Never delete or rename published slugs.
