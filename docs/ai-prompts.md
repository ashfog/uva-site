# Let an AI polish and publish your posts

**English** · [简体中文](ai-prompts.zh-CN.md)

Copy one of the prompts below into any assistant (ChatGPT, Claude, Gemini, DeepSeek, …). Assistants with repository access (Codex, Claude Code, Cursor, Copilot, a GitHub connector) read `SKILL.md` in the repository root by themselves. Assistants without access can output the files with their paths, and you paste them into GitHub's web editor.

## A. Polish in a chat window (no repository access)

```
You are the content editor of my personal website. First read the "Publishing rules" below, then polish my text and write it up as Markdown files that are ready to publish.

[Publishing rules] (paste the whole content of SKILL.md from the repository root here)

[My requirements]
- Section: writing (or projects / links)
- Slug: (lowercase English words joined by hyphens, e.g. my-first-post)
- Languages: one Chinese and one English version (translate naturally, not word for word)
- Date: 2026-xx-xx
- Polishing: keep my meaning and voice; only improve clarity, structure and grammar; do not invent any facts, numbers or links
- Output: one code block per file, with the full path above it (content/writing/<slug>.zh.md and content/writing/<slug>.en.md)

[My text]
(paste it here)
```

Then in your GitHub repository choose **Add file → Create new file**, paste the path and the content, and commit. The site updates itself within a minute or two.

## B. An assistant with repository access publishes directly

```
Read SKILL.md in the repository root. Then polish the text below into a bilingual post: create
content/writing/<slug>.zh.md and content/writing/<slug>.en.md, run npm run check, and when it passes commit to main
with the message "content: add <slug> (zh/en)". Afterwards tell me the URLs of both pages.

(my text)
```

## C. Polish an existing post only

```
Read the "Polishing rules" in SKILL.md and polish content/writing/<slug>.zh.md and .en.md: keep the meaning and voice,
do not change the slug, set "updated" in the front matter to today's date, run npm run check, then commit.
```
