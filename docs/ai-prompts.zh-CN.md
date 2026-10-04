# 让 AI 帮你润色并发布文章

[English](ai-prompts.md) · **简体中文**

把下面的提示词复制给任意大模型（ChatGPT、Claude、Gemini、DeepSeek……）。有仓库权限的 AI（Codex、Claude Code、Cursor、Copilot、GitHub 连接器）会直接读取根目录的 `SKILL.md`；没有权限的，让它按路径输出文件，你在 GitHub 网页里粘贴即可。

## A. 在聊天窗口里润色（没有仓库权限）

```
你是我个人网站的内容编辑。请先阅读下面的“发布规范”，然后帮我润色并写成可直接发布的 Markdown 文件。

【发布规范】（把仓库根目录 SKILL.md 的全部内容粘贴在这里）

【我的要求】
- 栏目：writing（或 projects / links）
- slug：（英文小写加短横线，例如 my-first-post）
- 语言：中文 + 英文各一份（英文请自然地翻译，不要逐字直译）
- 日期：2026-xx-xx
- 润色：保持我的原意和语气，只改通顺度、结构和语法；不要编造任何事实、数据或链接
- 输出：每个文件单独一个代码块，代码块上方写出完整路径（content/writing/<slug>.zh.md 和 .en.md）

【我的原文】
（在这里粘贴）
```

拿到结果后：GitHub 仓库 → Add file → Create new file → 粘贴路径与内容 → Commit。一两分钟后网站自动更新。

## B. 让有仓库权限的 AI 直接发布

```
请阅读仓库根目录的 SKILL.md，然后把下面这篇文章润色成中英双语，创建 content/writing/<slug>.zh.md 和 .en.md，
运行 npm run check，通过后提交到 main，提交信息写 "content: add <slug> (zh/en)"。完成后告诉我两个页面的网址。

（原文）
```

## C. 只润色已有文章

```
请阅读 SKILL.md 的“Polishing rules”，润色 content/writing/<slug>.zh.md 与 .en.md：保持原意与语气，不改 slug，
更新 front matter 里的 updated 为今天，运行 npm run check，然后提交。
```
