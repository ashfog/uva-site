# uva-site 🍇

一个**开源的个人落地页套件**：改一份配置、往 `content/` 放 Markdown，推送到 GitHub 后网站自动更新。
**中英双语 · 每篇文章一个独立 SEO 页面 · 全套 SEO · AI 可读的发布技能**。

一栏式、大留白、明暗两套主题；葡萄标志会跟着鼠标探头、点一下会散开；悬停预览小窗；会随时间变紫的成熟度圆点。

## 工作原理

```
写 content/writing/xxx.zh.md + xxx.en.md  →  git push  →  Cloudflare Pages 自动构建
   →  首页多一行 + 两个独立页面（/p/xxx/ 和 /en/p/xxx/）+ sitemap / RSS / llms.txt 同步更新
```

> 自动发布的前提：在 Cloudflare 里**导入这个 GitHub 仓库**（见“部署”）。手动上传的站点不会自动更新。

## 三步改成你的
1. 改 `site.config.json`：`siteUrl`（你的域名，**必填**）、名字、邮箱、社交链接、`zh` / `en` 两份文案（标题、描述、问候、标语、经历）。
2. 改 `about.zh.md` 和 `about.en.md`：各一段自我介绍。
3. 在 `content/<分区>/` 下放 `.md`，推送即发布。

## 写文章（双语）
一篇内容 = **两个文件**，同名、只差语言后缀：

```
content/writing/my-post.zh.md   →  https://你的域名/p/my-post/
content/writing/my-post.en.md   →  https://你的域名/en/p/my-post/
```

快速创建一对草稿：`npm run new -- writing my-post "中文标题" "English title"`（默认 `draft: true`，写完删掉那行才会发布）。

```md
---
title: 标题                    # 中文 ≤32 字，英文 ≤60 字符
date: 2026-10-01               # 必填，YYYY-MM-DD
updated: 2026-10-05            # 可选，修订后才写
summary: 一两句话概括          # 中文 40–100 字，英文 80–155 字符；就是搜索结果里的描述，每篇都要不同
tags: [标签1, 标签2]
cover: 🍇                      # emoji，或 /images/a.jpg（图片放 public/images/，会作为分享图）
live: https://…                # 可选：Live 链接（项目）
repo: https://github.com/…     # 可选：Source 链接（项目）
url: https://…                 # 写了就是外链收藏：不生成页面，首页直接跳出去
section: projects              # 想放进别的分区时才写
pin: true                      # 置顶
draft: true                    # 草稿，不发布
slug: custom-slug              # 想自定义网址时才写（默认用文件名）
---
正文（Markdown）。不要写 # 一级标题——页面已有 h1，正文从 ## 开始。
```

- 分区由文件夹决定：`projects` 项目 · `writing` 写作 · `links` 收藏；新建文件夹即新分区（名称在配置的 `sections` 里写 `{ "photos": { "zh": "摄影", "en": "Photos" } }`）。
- 只写了一种语言也行：另一种语言的首页会链接到这一版并标注 `EN` / `中`。
- 页面右上角可切换语言；第一次访问**不会**被强制跳转（对搜索引擎友好），手动切换过的访客会被记住偏好。

## SEO：自动生成的全部内容
| 项目 | 说明 |
|---|---|
| 独立页面 | 每篇文章、每种语言一个静态 HTML 页（`/p/slug/`、`/en/p/slug/`），首页也是构建时生成的完整 HTML，不依赖 JS 即可被抓取 |
| `<title>` / description | 每页唯一；缺失、过长、过短、重复都会提示 |
| canonical | 每页一个绝对地址 |
| hreflang | 中/英互指 + `x-default`，构建时校验“互相指回” |
| Open Graph / Twitter | `og:*`、`article:*`、`twitter:*`；有图片封面用封面，否则用 `/og-default.png`（1200×630） |
| 结构化数据 | 文章：`BlogPosting` + `BreadcrumbList`；首页：`WebSite` + `Person` + `CollectionPage/ItemList` |
| `sitemap.xml` | 含 `lastmod` 与 hreflang 互指 |
| `robots.txt` | 允许抓取并指向 sitemap；`404.html` 为 `noindex` |
| RSS | `/rss.xml`、`/en/rss.xml`，页面 `<head>` 里带自动发现 |
| `llms.txt` | 给 AI 抓取/引用用的站点索引 |
| 语义结构 | 每页唯一 h1，正文标题自动降一级并带锚点；面包屑、`<time datetime>`、“继续阅读”内链；图片 `loading=lazy` |
| 图标 | `favicon.ico/.svg`、`apple-touch-icon.png` |
| 安全头 | `_headers`：nosniff、Referrer-Policy、X-Frame-Options 等 |
| IndexNow（可选） | 配置 `seo.indexNowKey` 后，Cloudflare 生产构建会通知 Bing/Yandex |
| 站点验证（可选） | `seo.verify` 里填 google / bing / baidu / yandex 的验证码即可 |

### 稳定性：发布前自动检查
每次构建结尾都会自检；**有错误会让构建失败，线上继续保持上一个正常版本**：
重复网址 · 日期格式错误 · 外链缺 http · 内部链接/图片不存在 · `<title>`/`<h1>`/canonical 数量不对 · JSON-LD 不是合法 JSON · hreflang 没互相指回 · sitemap 里的地址不存在。
只给建议、不阻止发布的：标题/摘要长度、正文偏短、缺 summary、图片没写 alt、网址含中文、标题或描述重复。
本地运行：`npm run check`。推送到 GitHub 时 `.github/workflows/check.yml` 也会跑一遍。

### 上线后 5 分钟清单
1. 确认 `site.config.json` 的 `siteUrl` 是你的正式域名。
2. [Google Search Console](https://search.google.com/search-console) 添加域名 → 提交 `https://你的域名/sitemap.xml`。
3. [Bing Webmaster Tools](https://www.bing.com/webmasters) 同样提交（可直接“导入 Google 站点”）。国内搜索可再提交 [百度搜索资源平台](https://ziyuan.baidu.com)。
4. 用 [富媒体结果测试](https://search.google.com/test/rich-results) 抽查一篇文章的结构化数据。

## 让 AI 帮你润色并发布
仓库根目录有给大模型读的“技能”：
- `SKILL.md`：写作规范、front matter、SEO 规则、润色规则、发布流程（Claude Skills 格式）
- `AGENTS.md`（OpenAI Codex / Cursor 等）、`CLAUDE.md`（Claude Code）、`.github/copilot-instructions.md`（Copilot）：都指向 `SKILL.md`
- `docs/ai-prompts.md`：可以直接复制给 ChatGPT / Claude 等聊天窗口的提示词（没有仓库权限也能用）

## 部署（一次性）
1. **推到 GitHub**（公开仓库，建议仓库名 `uva-site`）。
2. Cloudflare 控制台 → **Workers 和 Pages** → **Create application** → **Import a repository / Continue with GitHub** → 授权并选择这个仓库。
3. 构建配置：**Build command** `npm run build`；**Deploy command** 保持默认 `npx wrangler deploy`；生产分支 `main`。
   项目名必须与 `wrangler.jsonc` 里的 `name`（`uva-site`）一致，否则改其中一个。
4. 部署成功后，先访问 `uva-site.<你的子域>.workers.dev` 检查，再到项目 **Settings → Domains & Routes → Add → Custom domain** 绑定你的域名。
5. 之后每次推送到 `main`，都会自动构建并更新；构建失败时线上保持上一个正常版本。

## 本地预览
`npm i && npm run build`，用任意静态服务器打开 `dist/`；或 `npm run dev`。

## 彩蛋
戳葡萄标志 · 键盘输入 `wine` · 切走标签页看标题。

## 留言板
已做好后端但暂未启用，放在 `extras/guestbook/`。

MIT License
