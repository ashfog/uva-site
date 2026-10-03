---
title: 这个网站本身
date: 2026-09-30
summary: 由 Markdown 长出来的个人落地页：往仓库里放一个 .md，推送后自动多一行链接和一个独立的 SEO 页面，支持中英双语。
tags: [开源, Cloudflare, Markdown, SEO]
cover: 🌱
pin: true
---
主页的每一行，都是仓库 `content/` 里的一个 Markdown 文件；中文版和英文版各写一个。

推送到 GitHub 之后，Cloudflare 会自动构建：生成这篇文章自己的页面，带有标题、描述、规范网址、多语言标记、结构化数据，并写进 sitemap 和 RSS，方便搜索引擎找到它。
