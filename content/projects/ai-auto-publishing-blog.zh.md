---
title: AI 自动化发布博客 ASHFOG
date: 2026-08-15
updated: 2026-10-03
summary: ASHFOG 是一个内置 AI 发布工作台的博客：给 AI 一个主题并授权，它就能调研、写作、校验，提交到 GitHub 并交给 Cloudflare 部署。
tags: [Astro, AI, 自动化, Cloudflare]
cover: /images/ashfog-cover.jpg
live: https://ashfog.com
repo: https://github.com/ashfog/blog
---
ASHFOG（[ashfog.com](https://ashfog.com)）是一个独立的科技与文化博客，同时也是一套**随仓库一起提供的 AI 发布工作台**：你只要给兼容的 AI 平台一个主题，并授权它发布，写作、检查和上线都可以自动完成。

![ASHFOG 首页：名为 The Reading Room 的 3D 卡片轮播，每张卡片是一篇文章](/images/ashfog-home.jpg)

## 一个会自己发布文章的博客

整个流程是这样的：

1. 你给 AI 一个**主题**，也可以附上参考资料，并明确授权它发布；
2. 工作台读取站点的配置；
3. 围绕主题做调研；
4. 用你指定的语言（没有指定就用配置里的默认语言）写出**一篇 Markdown 文章**；
5. 对整个 Astro 站点做完整校验；
6. 提交到 GitHub；
7. 交给 Cloudflare Pages 部署上线。

提交之后，网站会自动更新，不需要手动构建，也不需要手动上传。

## 首页：The Reading Room

首页是一圈可以拖动的 3D 卡片，叫 “The Reading Room”：拖动浏览，点击阅读。每张卡片对应一篇文章，带有分类、标题和日期；顶部有文章、话题、关于三个入口，以及搜索和明暗主题切换。首页的标语是 “Not everything worth seeing is visible”，截图里的文章多集中在模型、智能体和开源方向。

## 主题系统

站点内置两套主题，主题清单会声明名称、版本、支持的明暗模式和浏览器主题色：

- **ashfog-editorial**：保留最初的 ASHFOG 视觉体系；
- **ashfog-humanist**：暖调的雾橙色，衬线大标题，以话题为主的导航，插画风格的卡片，可筛选的文章库和长文阅读布局。

无障碍、文章渲染、响应式、发布、搜索、RSS 和 SEO 这些能力放在公共代码里，所以换主题时不会丢失。

## 搜索、RSS 与 SEO

站点自带站内搜索、RSS 和 Sitemap，SEO 逻辑同样在公共代码里。部署之后，把 Sitemap 索引地址提交到 Google Search Console 即可（ashfog.com 的是 `https://ashfog.com/sitemap-index.xml`）；如果你 fork 了它，记得把域名换成你自己的。

## 源码

项目是开源的，仓库在 [github.com/ashfog/blog](https://github.com/ashfog/blog)，里面既有 ASHFOG 这个站点，也有可以复用的 AI 发布工作台。fork 之后换上你自己的域名和配置，就能得到一个可以由 AI 自动发布文章的博客。
