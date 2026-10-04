---
title: ASHFOG, an AI auto-publishing blog
date: 2026-10-01
updated: 2026-10-03
summary: A blog with a built-in AI publishing workbench: give an AI a topic and permission, and it researches, writes, validates and publishes via GitHub and Cloudflare.
tags: [Astro, AI, automation, Cloudflare]
cover: /images/ashfog-cover.jpg
live: https://ashfog.com
repo: https://github.com/ashfog/blog
---
ASHFOG ([ashfog.com](https://ashfog.com)) is an independent blog about technology, culture and useful ideas — and it ships with a **repository-owned AI publishing workbench**. Give a compatible AI platform a topic and permission to publish, and the writing, checking and deployment can happen automatically.

![The ASHFOG homepage: a 3D carousel of article cards called The Reading Room](/images/ashfog-home.jpg)

## A blog that publishes itself

Here is how the workflow goes:

1. You give the AI a **topic**, optionally some source material, and explicit permission to publish;
2. the workbench reads the site's configuration;
3. it researches the topic;
4. it writes **one Markdown article** in the language you ask for (or the configured default when you don't specify one);
5. it validates the complete Astro site;
6. it commits to GitHub;
7. and hands deployment over to Cloudflare Pages.

Once the commit lands, the site updates by itself — no manual build and no manual upload.

## The homepage: The Reading Room

The homepage is a ring of draggable 3D cards called "The Reading Room": drag to explore, click to read. Each card is an article, with its category, title and date. The header offers Articles, Topics and About, plus search and a light/dark toggle. The tagline reads "Not everything worth seeing is visible", and the articles in the screenshot lean toward models, agents and open source.

## The theme system

The site ships with two themes. A theme manifest declares its identity, version, supported color modes and the browser theme color:

- **ashfog-editorial** preserves the original ASHFOG visual system;
- **ashfog-humanist** is warm and fog-orange, with serif-led headlines, topic-forward navigation, illustrated cards, a filterable article library and a long-form reading layout.

Accessibility, article rendering, responsive behavior, publishing, search, RSS and SEO live in shared code, so nothing is lost when you switch themes.

## Search, RSS and SEO

The site comes with built-in search, RSS and a sitemap, and its SEO logic also sits in the shared code. After deploying, submit the sitemap index to Google Search Console (for ashfog.com it is `https://ashfog.com/sitemap-index.xml`); if you fork the project, replace the domain with your own.

## Source code

The project is open source. The repository at [github.com/ashfog/blog](https://github.com/ashfog/blog) contains both the ASHFOG site and the reusable AI publishing workbench. Fork it, swap in your own domain and configuration, and you have a blog that an AI can publish to.
