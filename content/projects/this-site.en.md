---
title: This site itself
date: 2026-09-30
summary: A personal landing page grown from Markdown: drop a .md in the repo, push, and a new link plus its own SEO page appear. Bilingual out of the box.
tags: [open source, Cloudflare, Markdown, SEO]
cover: 🌱
pin: true
---
Every row on the homepage is a Markdown file in `content/` — one for Chinese, one for English.

After you push to GitHub, Cloudflare builds the site automatically. Each post gets its own page with a title, description, canonical URL, language alternates and structured data, and it is added to the sitemap and the RSS feed so that search engines can find it.
