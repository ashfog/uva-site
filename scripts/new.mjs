// npm run new -- <分区> <slug> ["中文标题"] ["English title"]
// 一次生成中、英两个文件（默认 draft: true，写完删掉那一行才会发布）
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
const [,,section,slug,zh='',en='']=process.argv;
if(!section||!slug){console.log('用法：npm run new -- <分区> <slug> ["中文标题"] ["English title"]\n例：  npm run new -- writing my-first-post "我的第一篇" "My first post"');process.exit(1)}
if(!/^[a-z0-9-]+$/.test(slug)){console.log('slug 只能用小写英文、数字和短横线，例如 my-first-post');process.exit(1)}
const today=new Date().toISOString().slice(0,10);
const tpl=(title,L)=>`---
title: ${title||(L==='zh'?'在这里写标题':'Write the title here')}
date: ${today}
summary: ${L==='zh'?'一两句话概括这篇内容（40–100 字），会出现在搜索结果和列表里':'One or two sentences summarising the post (80–155 characters); it shows up in search results and lists'}
tags: []
cover:
draft: true
---

${L==='zh'?'正文从这里开始。写完后删掉上面的 draft: true 一行，推送即可发布。':'Write the body here. Delete the "draft: true" line above when it is ready, then push to publish.'}
`;
for(const L of ['zh','en']){const f=`content/${section}/${slug}.${L}.md`;
  if(existsSync(f)){console.log('已存在，跳过：',f);continue}
  mkdirSync(`content/${section}`,{recursive:true});writeFileSync(f,tpl(L==='zh'?zh:en,L));console.log('✓ 已创建',f)}
