---
title: uva.xyz：由 Markdown 长出来的个人落地页
date: 2026-09-30
updated: 2026-10-04
summary: uva.xyz 是一个由 Markdown 长出来的开源个人落地页：推送一个 .md，就自动多一行链接和独立的 SEO 页面，支持中英双语与 AI 辅助发布。
tags: [开源, Markdown, SEO, Cloudflare, 双语]
cover: /images/uva-cover.jpg
live: https://uva.xyz
repo: https://github.com/ashfog/uva-site
pin: true
---
uva.xyz 就是你现在看到的这个网站：一个**由 Markdown 长出来的个人落地页**，完整开源。往仓库里放一个 `.md` 文件，推送之后，首页会自动多出一行链接，同时生成它自己的独立页面。

![uva.xyz 首页：葡萄串标志、标语和自我介绍](/images/uva-home.jpg)

## 发布只需要一个文件

每篇内容写两个 Markdown 文件，名字相同，只差语言后缀：

- `my-post.zh.md`：中文版，网址是 `/p/my-post/`；
- `my-post.en.md`：英文版，网址是 `/en/p/my-post/`。

推送到 GitHub 之后，Cloudflare 会自动构建并上线，首页就会多出一行。文章放进哪个文件夹，就归到哪个分区：`projects`、`writing` 或 `links`。

## 每篇文章都是一个独立的 SEO 页面

构建时会为每篇文章、每种语言生成一个静态页面，并自动写好：

- 唯一的标题与描述、规范网址；
- 中英文页面互相指向的 hreflang；
- Open Graph 与 Twitter 分享卡片；
- 文章与面包屑的结构化数据；
- sitemap、RSS、robots.txt、给 AI 读的 llms.txt，以及 404 页面。

每次构建结尾还会自动检查：重复网址、日期格式错误、失效的内部链接和图片、缺失的标题与描述……**只要有错误，构建就会失败，线上继续保持上一个正常版本**。

## 让 AI 帮你写、帮你发

仓库根目录有一份给大模型读的 `SKILL.md`（以及 `AGENTS.md`、`CLAUDE.md`），写清了文件怎么命名、front matter 怎么写、SEO 与润色规则，以及发布流程。让 ChatGPT、Claude 这类工具读完它，就可以按这份规范润色文章、写成中英双语，再提交到 GitHub。

## 一些小细节

- 一栏式排版，浅色和深色两套主题；
- 葡萄串标志会朝鼠标倾斜，点一下会散开；
- 每条内容前的小圆点会随时间从青绿慢慢变紫，大约 45 天熟透；
- 鼠标移到列表上，会出现带封面和摘要的预览卡片；
- 键盘输入 `wine`，页面会切换成红酒色。

## 技术与部署

没有前端框架：整个站点由一个 Node 构建脚本和 `marked` 生成，部署在 Cloudflare 上，推送到 GitHub 就会自动更新。许可证是 MIT。

## 源码

仓库在 [github.com/ashfog/uva-site](https://github.com/ashfog/uva-site)。fork 之后只需要三步：改 `site.config.json`，改 `about.zh.md` 和 `about.en.md`，再往 `content/` 里放你自己的文章。
