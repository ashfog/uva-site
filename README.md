# uva-site 🍇

**English** · [简体中文](README.zh-CN.md)

> An open-source personal landing page kit. Edit one config file, drop Markdown into `content/`, push to GitHub — and your site updates itself, with a standalone SEO page for every post.
>
> Live example: [uva.xyz](https://uva.xyz)

## Features

- **Bilingual (中文 / English)** — every language has its own URLs (`/p/…` and `/en/p/…`), with a language switch in the corner.
- **One Markdown file per post and language** — push it, and a new row appears on the homepage together with its own page.
- **Complete SEO, generated at build time** — canonical URLs, hreflang, Open Graph, Twitter cards, structured data, sitemap, RSS, robots.txt, `llms.txt`, 404 page.
- **Safe publishing** — every build ends with an audit; any error fails the build and the live site keeps serving the last good version.
- **AI-ready** — a `SKILL.md` that teaches ChatGPT, Claude and other assistants how to write, polish and publish posts to this repo.
- **Quiet design** — a single column, light and dark themes, a grape mark that follows your cursor, hover preview cards, and dots that slowly turn from green to purple as an entry ages.
- **No front-end framework** — one Node build script and [`marked`](https://github.com/markedjs/marked). Free to host on Cloudflare.

## How it works

```
write content/writing/my-post.zh.md + my-post.en.md  →  git push  →  Cloudflare builds
   →  a new homepage row  +  two standalone pages (/p/my-post/ and /en/p/my-post/)
   +  sitemap, RSS and llms.txt updated
```

> Auto-publishing requires connecting this GitHub repository to Cloudflare (see [Deploy](#deploy-to-cloudflare)). A site you uploaded manually will not update by itself.

## Quick start

1. **Use this template** (or fork it) and clone it.
2. Edit `site.config.json`: set `siteUrl` (your domain — **required**), your name, e-mail, social links, and the `zh` / `en` copy (title, description, greeting, tagline, journey).
3. Edit `about.en.md` and `about.zh.md`: a short introduction in each language.
4. Add your posts under `content/` and delete the samples.

```bash
npm install
npm run dev        # build and serve at http://localhost:8787 (same 404 handling as production)
npm run check      # build + audit only; fails on errors
npm run new -- writing my-post "中文标题" "English title"   # scaffold a zh + en pair (as drafts)
```

Needs Node.js 20 or newer.

### `site.config.json`

| Key | Meaning |
|---|---|
| `siteUrl` | Your production URL, e.g. `https://example.com`. Used for canonical links, sitemap and share cards. **Required.** |
| `siteName`, `name` | Site name (titles, RSS) and your name (author in structured data). |
| `defaultLang` | `zh` or `en` — the language served at `/`. The other one lives under `/zh/` or `/en/`. |
| `email`, `socials`, `booking` | The links under your introduction. Leave a value empty to hide it. |
| `github` | Your GitHub username — shows a contribution heatmap when set. |
| `askAI` | `true` adds “Ask Claude / Ask ChatGPT about me” links. |
| `avatar` | Path or URL of a photo; empty uses the grape mark. |
| `repo` | Link for the “fork this kit” footer item. |
| `seo.ogImage` | Default share image (1200×630) for pages without an image cover. |
| `seo.twitter` | Your X handle, e.g. `@name`, for share cards. |
| `seo.verify` | Verification codes for `google`, `bing`, `baidu`, `yandex`. |
| `seo.indexNowKey` | Optional [IndexNow](https://www.indexnow.org/) key; production builds on Cloudflare then notify Bing/Yandex. |
| `zh`, `en` | Per-language `title`, `description`, `hi` (greeting), `tagline` (two lines) and `journey` (timeline). |
| `sections` | Optional names for your own sections, e.g. `{ "photos": { "zh": "摄影", "en": "Photos" } }`. |

## Writing posts

A post is **two files** with the same name and a language suffix:

```
content/writing/my-post.zh.md   →  https://your-domain/p/my-post/
content/writing/my-post.en.md   →  https://your-domain/en/p/my-post/
```

```md
---
title: Post title              # ≤ 60 characters (zh ≤ 32)
date: 2026-10-01               # required, YYYY-MM-DD
updated: 2026-10-05            # optional, when you revise the post
summary: One or two sentences  # 80–155 characters (zh 40–100); becomes the search-result description — unique per post
tags: [tag1, tag2]
cover: 🍇                      # an emoji, or /images/a.jpg (put images in public/images/); an image is used as the share image
live: https://…                # optional "Live" link
repo: https://github.com/…     # optional "Source" link
url: https://…                 # makes it an external bookmark: no page is generated
section: projects              # only when the folder is not the section you want
pin: true                      # pin to the top of its section
draft: true                    # not published
slug: custom-slug              # override the URL (defaults to the file name)
---
Body in Markdown. Don't write a `#` title — the page already has an h1; start at `##`.
```

- The **folder decides the section**: `projects`, `writing` or `links`. A new folder becomes a new section.
- A post written in only one language still works: the other language's homepage links to it and marks it `EN` / `中`.
- The language switch moves between the matching pages. First-time visitors are **never** redirected (good for search engines); visitors who switched manually are remembered.

## SEO

| What | Details |
|---|---|
| Standalone pages | A static HTML page per post and language, and a fully pre-rendered homepage — no JavaScript needed to be crawled. |
| Title / description | Unique per page; missing, too long, too short or duplicated values are reported. |
| Canonical | One absolute URL per page. |
| hreflang | zh ↔ en alternates plus `x-default`; the build verifies they point back at each other. |
| Open Graph / Twitter | `og:*`, `article:*`, `twitter:*`. An image cover is used as the share image, otherwise `/og-default.png` (1200×630). |
| Structured data | Posts: `BlogPosting` + `BreadcrumbList`. Home: `WebSite` + `Person` + `CollectionPage/ItemList`. |
| `sitemap.xml` | With `lastmod` and hreflang alternates. |
| `robots.txt`, 404 | Crawling allowed, sitemap referenced; `404.html` is `noindex`. |
| RSS | `/rss.xml` and `/en/rss.xml`, auto-discoverable from every page. |
| `llms.txt` | A site index for AI crawlers and assistants. |
| Semantics | One h1 per page, headings in posts are demoted one level and get anchors, breadcrumbs, `<time datetime>`, “keep reading” links, lazy-loaded images. |
| Icons & headers | `favicon.ico/.svg`, `apple-touch-icon.png`, security headers in `_headers`. |
| Verification & IndexNow | Optional, via `seo.verify` and `seo.indexNowKey`. |

### Build-time audit

Every build ends with a self-check. **Errors fail the build, and the live site keeps serving the previous good version:** duplicate URLs · malformed dates · external `url` without `http(s)://` · broken internal links or images · wrong number of `<title>` / `<h1>` / canonical · invalid JSON-LD · hreflang pairs that don't point back · sitemap entries that don't exist.

Reported as advice without blocking a deploy: title and summary length, thin articles, missing summary, images without alt text, non-English URLs, duplicated titles or descriptions.

`npm run check` runs it locally; `.github/workflows/check.yml` runs it on every push and pull request.

### After you go live

1. Make sure `siteUrl` is your real domain.
2. Add the site to [Google Search Console](https://search.google.com/search-console) and submit `https://your-domain/sitemap.xml`.
3. Do the same in [Bing Webmaster Tools](https://www.bing.com/webmasters) (you can import from Google). For China, also consider [Baidu Search Resource Platform](https://ziyuan.baidu.com).
4. Spot-check a post in the [Rich Results Test](https://search.google.com/test/rich-results).

## Publish with AI

The repository root carries instructions that AI assistants can read:

- `SKILL.md` — file layout, front matter, SEO writing rules, polishing rules and the publishing workflow (Claude Skills format).
- `AGENTS.md` (OpenAI Codex, Cursor, …), `CLAUDE.md` (Claude Code) and `.github/copilot-instructions.md` (Copilot) all point to `SKILL.md`.
- [`docs/ai-prompts.md`](docs/ai-prompts.md) — ready-to-paste prompts for chat assistants that have no access to your repository. ([简体中文](docs/ai-prompts.zh-CN.md))

## Deploy to Cloudflare

One-time setup:

1. **Push the repository to GitHub** (public, e.g. `your-name/uva-site`).
2. In the Cloudflare dashboard open **Workers & Pages → Create application → Continue with GitHub** (import a repository) and select it.
3. Build settings:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy` (the default)
   - **Production branch:** `main`
   - The project name must match `name` in `wrangler.jsonc` (`uva-site`) — change one of them if they differ.
4. After the first deploy, check `https://<project>.<your-subdomain>.workers.dev`, then add your domain under **Settings → Domains & Routes → Add → Custom domain**.
5. From now on every push to `main` redeploys automatically. If a build fails, the previous version stays live; the reason is in the build log, on lines starting with `✗`.

Troubleshooting: if the build complains about the Node version, add the build variable `NODE_VERSION=22` (a `.node-version` file is included). If a domain is “already in use”, remove it from the old project first.

## Project structure

```
.
├── content/                # your posts: <section>/<slug>.zh.md + <slug>.en.md
├── public/                 # copied as-is: favicons, og-default.png, images/
├── src/                    # index.html (home) and post.html (post) templates
├── build.mjs               # the whole build: pages, SEO files, audit
├── scripts/new.mjs         # npm run new
├── site.config.json        # site-wide settings
├── about.zh.md · about.en.md
├── wrangler.jsonc          # Cloudflare config (assets directory, 404 page)
├── SKILL.md · AGENTS.md · CLAUDE.md · .github/copilot-instructions.md   # for AI assistants
├── docs/                   # AI prompt guides (en / zh-CN)
├── extras/guestbook/       # a guestbook backend that is not enabled (yet)
└── .github/workflows/check.yml
```

## Easter eggs

Poke the grape mark · type `wine` on the keyboard · switch tabs and watch the page title.

## Guestbook

A Cloudflare Functions + D1 guestbook backend exists in `extras/guestbook/`; it is not wired into the homepage at the moment.

## License

[MIT](LICENSE)
