---
name: uva-publish
description: Write, polish, translate and publish bilingual (Chinese/English) Markdown posts for the uva-site personal landing page. Use whenever the user wants to add, edit, polish or translate an article, project or bookmark on their site, or asks to publish content to the GitHub repo so a new homepage link and a standalone SEO page are generated automatically.
---

# uva-site publishing skill

This repository is a static personal landing page. **Every Markdown file under `content/` becomes a row on the homepage and its own SEO page.** Pushing to GitHub triggers Cloudflare Pages to rebuild; nothing else is needed.

## 1. File layout (one post = two files)

```
content/<section>/<slug>.zh.md    # Chinese version  → https://<site>/p/<slug>/
content/<section>/<slug>.en.md    # English version  → https://<site>/en/p/<slug>/
```

- `<section>`: `projects` (things the user built) · `writing` (articles/essays) · `links` (external bookmarks). A new folder name creates a new section.
- `<slug>`: lowercase English words joined by `-` (`my-first-post`). It becomes the URL — keep it short, meaningful and **never change it after publishing**.
- If only one language is requested, write only that file; the other language's homepage links to it with an `EN`/`中` badge.
- A file without a language suffix (`<slug>.md`) is used for both languages.

## 2. Front matter (all values on one line)

```md
---
title: Post title                 # zh ≤ 32 chars, en ≤ 60 chars
date: 2026-10-01                  # YYYY-MM-DD, required (the real publish date)
updated: 2026-10-05               # optional, only when the post is meaningfully revised
summary: One or two sentences.    # zh 40–100 chars, en 80–155 chars; becomes <meta description> — write it by hand, unique per post
tags: [tag1, tag2]                # 2–5 short tags
cover: 🍇                         # an emoji, or /images/xxx.jpg (file in public/images/); used as the share image if it is an image
live: https://…                   # optional "Live" link (projects)
repo: https://github.com/…        # optional "Source" link (projects)
url: https://…                    # makes it an EXTERNAL bookmark: no page is generated, the row links out
section: projects                 # only if the folder is not the section you want
pin: true                         # pin to the top of its section
draft: true                       # not published
slug: custom-slug                 # only to override the filename
---
Body in Markdown…
```

The two language files of one post share `date`, `cover`, `live`, `repo`, `pin`, `section` (Chinese file wins). `title`, `summary`, `tags` are per language.

## 3. Writing for search engines (SEO rules)

- One topic per post; the first paragraph answers what the post is about. Articles: Chinese ≥ 200 chars / English ≥ 60 words.
- Do **not** put a `#` title in the body (the page already has the `<h1>` from `title`). Use `##` and `###` for sections.
- Images: `![meaningful alt text](/images/name.jpg)` — always write alt text. Put image files in `public/images/`.
- Link to other pages of the site with absolute paths (`/p/other-slug/`, `/en/p/other-slug/`). Never invent a link.
- `title` and `summary` must differ between posts and between languages (translate, don't copy).

## 4. Polishing rules (when the user asks you to polish or translate)

1. Keep the author's meaning, facts and voice. Improve clarity, flow, grammar and structure only.
2. **Never invent** facts, numbers, quotes, links, dates, experiences or credentials. If something is missing, ask or leave it out.
3. Keep code blocks, commands, URLs and product names exactly as written.
4. Chinese: full-width punctuation (，。：；？！), a space between Chinese and Latin letters/digits, natural written Chinese. English: plain, concrete, active voice.
5. Translate for meaning, not word by word; the two versions should each read as native text.
6. Tell the user briefly what you changed and anything you could not verify.

## 5. Publish workflow

1. Confirm with the user: topic, section, language(s), and that they want it published now (unless they already said so).
2. Create the files above. `npm run new -- <section> <slug> "中文标题" "English title"` scaffolds a pair (with `draft: true`).
3. If you can run commands: `npm install` then `npm run check` — it must end with `全部检查通过` or only warnings; fix every `✗` error before continuing.
4. Publish to GitHub, using whatever access you have:
   - **Git/CLI:** `git add content public && git commit -m "content: add <slug> (zh/en)" && git push` to `main` (open a PR instead if the user wants to review first).
   - **GitHub connector/API/MCP:** create or update the files at the same paths on the `main` branch with the same commit message.
   - **No repository access:** reply with each file in its own fenced block, headed by its exact path, and tell the user to paste them via GitHub → *Add file → Create new file*.
5. Tell the user: the build takes 1–2 minutes, then the post is live at `/p/<slug>/` (Chinese) and `/en/p/<slug>/` (English), listed on the homepage, in `sitemap.xml`, the RSS feeds and `llms.txt`.

## 6. Do not

- Edit `build.mjs`, `src/`, `.github/` or `site.config.json` unless the user explicitly asks.
- Delete or rename existing posts/slugs without being asked (it breaks live URLs).
- Commit secrets, tokens or personal data that the user has not asked to publish.
- Publish `draft: true` content, or content the user has not approved.

## 7. Checklist before you publish

- [ ] zh + en files named `<slug>.zh.md` / `<slug>.en.md`, slug is lowercase-hyphen English
- [ ] `title`, `date`, `summary`, `tags` present in each file; summary lengths in range
- [ ] no `#` H1 in the body; images have alt text
- [ ] nothing invented; links verified
- [ ] `npm run check` passes (if you can run it)
