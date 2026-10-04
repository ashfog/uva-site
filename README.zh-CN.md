# uva-site 🍇

[English](README.md) · **简体中文**

> 一个**开源的个人落地页套件**：改一份配置、往 `content/` 放 Markdown，推送到 GitHub 后网站自动更新，每篇文章都有独立的 SEO 页面。
>
> 在线示例：[uva.xyz](https://uva.xyz)

## 特性

- **中英双语**：每种语言有独立网址（`/p/…` 和 `/en/p/…`），页面右上角可切换。
- **一篇一个 Markdown 文件（每种语言各一个）**：推送后首页自动多一行，并生成它自己的页面。
- **构建时生成完整 SEO**：canonical、hreflang、Open Graph、Twitter 卡片、结构化数据、sitemap、RSS、robots.txt、`llms.txt`、404 页面。
- **安全发布**：每次构建结尾都会自检，有错误就让构建失败，线上继续保持上一个正常版本。
- **AI 友好**：附带 `SKILL.md`，教 ChatGPT、Claude 等助手如何写作、润色并发布到这个仓库。
- **安静的设计**：一栏式、浅色深色两套主题、会跟着鼠标的葡萄标志、悬停预览卡片、会随时间从青绿变紫的成熟度圆点。
- **没有前端框架**：一个 Node 构建脚本加 [`marked`](https://github.com/markedjs/marked)，可免费部署在 Cloudflare。

## 工作原理

```
写 content/writing/my-post.zh.md + my-post.en.md  →  git push  →  Cloudflare 自动构建
   →  首页多一行  +  两个独立页面（/p/my-post/ 和 /en/p/my-post/）
   +  sitemap、RSS、llms.txt 同步更新
```

> 自动发布的前提：在 Cloudflare 里**导入这个 GitHub 仓库**（见[部署](#部署到-cloudflare)）。手动上传的站点不会自动更新。

## 快速开始

1. **使用这个模板**（或 fork）并克隆到本地。
2. 改 `site.config.json`：`siteUrl`（你的域名，**必填**）、名字、邮箱、社交链接，以及 `zh` / `en` 两份文案（标题、描述、问候、标语、经历）。
3. 改 `about.zh.md` 和 `about.en.md`：各一段自我介绍。
4. 把示例文章换成你自己的，放进 `content/`。

```bash
npm install
npm run dev        # 构建并在 http://localhost:8787 预览（404 处理与线上一致）
npm run check      # 只构建并自检；有错误会失败
npm run new -- writing my-post "中文标题" "English title"   # 一次生成中、英两个草稿
```

需要 Node.js 20 或更高版本。

### `site.config.json` 字段

| 字段 | 含义 |
|---|---|
| `siteUrl` | 正式网址，如 `https://example.com`，用于 canonical、sitemap 和分享卡片，**必填**。 |
| `siteName`、`name` | 站点名（标题、RSS）和你的名字（结构化数据里的作者）。 |
| `defaultLang` | `zh` 或 `en`，决定 `/` 使用哪种语言；另一种在 `/zh/` 或 `/en/` 下。 |
| `email`、`socials`、`booking` | 介绍下方的链接；值留空就不显示。 |
| `github` | GitHub 用户名，填写后显示贡献热力图。 |
| `askAI` | `true` 时增加“Ask Claude / Ask ChatGPT”链接。 |
| `avatar` | 头像图片路径或网址；留空则使用葡萄标志。 |
| `repo` | 页脚“fork this kit”链接指向的仓库。 |
| `seo.ogImage` | 默认分享图（1200×630），用于没有图片封面的页面。 |
| `seo.twitter` | 你的 X 账号，如 `@name`，用于分享卡片。 |
| `seo.verify` | `google`、`bing`、`baidu`、`yandex` 的站点验证码。 |
| `seo.indexNowKey` | 可选的 [IndexNow](https://www.indexnow.org/) 密钥；Cloudflare 生产构建时会通知 Bing/Yandex。 |
| `zh`、`en` | 每种语言各自的 `title`、`description`、`hi`（问候）、`tagline`（两行标语）和 `journey`（经历）。 |
| `sections` | 可选，给自建分区命名，如 `{ "photos": { "zh": "摄影", "en": "Photos" } }`。 |

## 写文章

一篇内容 = **两个文件**，同名、只差语言后缀：

```
content/writing/my-post.zh.md   →  https://你的域名/p/my-post/
content/writing/my-post.en.md   →  https://你的域名/en/p/my-post/
```

```md
---
title: 标题                    # 中文 ≤32 字，英文 ≤60 字符
date: 2026-10-01               # 必填，YYYY-MM-DD
updated: 2026-10-05            # 可选，修订后才写
summary: 一两句话概括          # 中文 40–100 字，英文 80–155 字符；就是搜索结果里的描述，每篇都要不同
tags: [标签1, 标签2]
cover: 🍇                      # emoji，或 /images/a.jpg（图片放 public/images/，会作为分享图）
live: https://…                # 可选：Live 链接
repo: https://github.com/…     # 可选：Source 链接
url: https://…                 # 写了就是外链收藏：不生成页面
section: projects              # 文件夹不是想要的分区时才写
pin: true                      # 置顶
draft: true                    # 草稿，不发布
slug: custom-slug              # 自定义网址（默认用文件名）
---
正文（Markdown）。不要写 # 一级标题——页面已有 h1，正文从 ## 开始。
```

- **文件夹决定分区**：`projects`、`writing` 或 `links`；新建文件夹即新分区。
- 只写了一种语言也行：另一种语言的首页会链接到这一版，并标注 `EN` / `中`。
- 语言切换会跳到对应的页面。第一次访问**不会**被强制跳转（对搜索引擎友好），手动切换过的访客会被记住偏好。

## SEO

| 项目 | 说明 |
|---|---|
| 独立页面 | 每篇文章、每种语言一个静态 HTML 页，首页也是预先渲染好的完整 HTML，不依赖 JS 就能被抓取。 |
| 标题 / 描述 | 每页唯一；缺失、过长、过短、重复都会提示。 |
| canonical | 每页一个绝对地址。 |
| hreflang | 中/英互指加 `x-default`，构建时校验“互相指回”。 |
| Open Graph / Twitter | `og:*`、`article:*`、`twitter:*`；图片封面会作为分享图，否则用 `/og-default.png`（1200×630）。 |
| 结构化数据 | 文章：`BlogPosting` + `BreadcrumbList`；首页：`WebSite` + `Person` + `CollectionPage/ItemList`。 |
| `sitemap.xml` | 含 `lastmod` 与 hreflang 互指。 |
| `robots.txt`、404 | 允许抓取并指向 sitemap；`404.html` 为 `noindex`。 |
| RSS | `/rss.xml`、`/en/rss.xml`，每个页面都能自动发现。 |
| `llms.txt` | 给 AI 抓取与引用用的站点索引。 |
| 语义结构 | 每页唯一 h1；正文标题自动降一级并带锚点；面包屑、`<time datetime>`、“继续阅读”内链、图片懒加载。 |
| 图标与响应头 | `favicon.ico/.svg`、`apple-touch-icon.png`，以及 `_headers` 里的安全头。 |
| 站点验证与 IndexNow | 可选，用 `seo.verify` 和 `seo.indexNowKey` 配置。 |

### 构建时自检

每次构建结尾都会自检，**有错误就让构建失败，线上继续保持上一个正常版本**：重复网址 · 日期格式错误 · 外链 `url` 缺 `http(s)://` · 内部链接/图片不存在 · `<title>`/`<h1>`/canonical 数量不对 · JSON-LD 不合法 · hreflang 没有互相指回 · sitemap 里的地址不存在。

只给建议、不阻止发布的：标题与摘要长度、正文偏短、缺 summary、图片没写 alt、网址含中文、标题或描述重复。

本地运行 `npm run check`；`.github/workflows/check.yml` 会在每次推送和 PR 时再跑一遍。

### 上线之后

1. 确认 `siteUrl` 是你的正式域名。
2. 把站点添加到 [Google Search Console](https://search.google.com/search-console)，提交 `https://你的域名/sitemap.xml`。
3. 在 [Bing Webmaster Tools](https://www.bing.com/webmasters) 同样提交（可从 Google 导入）。面向国内可再提交 [百度搜索资源平台](https://ziyuan.baidu.com)。
4. 用 [富媒体结果测试](https://search.google.com/test/rich-results) 抽查一篇文章的结构化数据。

## 让 AI 帮你发布

仓库根目录有给 AI 助手读的说明：

- `SKILL.md`：文件布局、front matter、SEO 写作规则、润色规则和发布流程（Claude Skills 格式）。
- `AGENTS.md`（OpenAI Codex、Cursor 等）、`CLAUDE.md`（Claude Code）、`.github/copilot-instructions.md`（Copilot）都指向 `SKILL.md`。
- [`docs/ai-prompts.zh-CN.md`](docs/ai-prompts.zh-CN.md)：可以直接复制给没有仓库权限的聊天助手的提示词。（[English](docs/ai-prompts.md)）

## 部署到 Cloudflare

一次性设置：

1. **把仓库推到 GitHub**（公开仓库，例如 `your-name/uva-site`）。
2. Cloudflare 控制台 → **Workers 和 Pages → Create application → Continue with GitHub**（导入仓库），选择它。
3. 构建设置：
   - **Build command**：`npm run build`
   - **Deploy command**：`npx wrangler deploy`（默认值）
   - **生产分支**：`main`
   - 项目名必须与 `wrangler.jsonc` 里的 `name`（`uva-site`）一致，不一致就改其中一个。
4. 首次部署成功后，先访问 `https://<项目名>.<你的子域>.workers.dev` 检查，再到 **Settings → Domains & Routes → Add → Custom domain** 绑定你的域名。
5. 之后每次推送到 `main` 都会自动重新部署。构建失败时线上保持上一个版本，原因在构建日志里以 `✗` 开头的行。

常见问题：构建提示 Node 版本不对时，添加构建变量 `NODE_VERSION=22`（仓库里已有 `.node-version`）；提示域名“已被使用”时，先从旧项目里移除它。

## 项目结构

```
.
├── content/                # 你的文章：<分区>/<slug>.zh.md + <slug>.en.md
├── public/                 # 原样复制：favicon、og-default.png、images/
├── src/                    # index.html（首页）和 post.html（文章页）模板
├── build.mjs               # 全部构建逻辑：页面、SEO 文件、自检
├── scripts/new.mjs         # npm run new
├── site.config.json        # 全站设置
├── about.zh.md · about.en.md
├── wrangler.jsonc          # Cloudflare 配置（静态目录、404 页面）
├── SKILL.md · AGENTS.md · CLAUDE.md · .github/copilot-instructions.md   # 给 AI 助手
├── docs/                   # AI 提示词指南（英文 / 简体中文）
├── extras/guestbook/       # 暂未启用的留言板后端
└── .github/workflows/check.yml
```

## 彩蛋

戳葡萄标志 · 键盘输入 `wine` · 切走标签页看标题。

## 留言板

已做好 Cloudflare Functions + D1 的留言板后端，放在 `extras/guestbook/`，目前没有接入首页。

## 许可证

[MIT](LICENSE)
