// uva-site build —— content/**.md  →  dist/
// 静态页面 + 全套 SEO：canonical · hreflang · Open Graph · Twitter · JSON-LD · sitemap · RSS · robots · llms.txt · 404
// 末尾自带检查（内链/图片是否存在、标题描述是否缺失重复、hreflang 是否互相指回…），有错误会让构建失败，线上保持上一个正常版本。
import {readdirSync,readFileSync,writeFileSync,mkdirSync,statSync,rmSync,existsSync,cpSync} from 'node:fs';
import {join,basename,relative,sep} from 'node:path';
import {marked} from 'marked';

const R='content',O='dist',LANGS=['zh','en'];
const cfg=JSON.parse(readFileSync('site.config.json','utf8'));
const DEF=LANGS.includes(cfg.defaultLang)?cfg.defaultLang:'zh',OTHER=l=>LANGS.find(x=>x!==l);
const SITE=String(cfg.siteUrl||'').replace(/\/+$/,''),NAME=cfg.siteName||cfg.name||'site',AUTHOR=cfg.name||NAME;
const seo=cfg.seo||{},ver=seo.verify||{};
const E=[],W=[],I=[],add=(a,m)=>{if(!a.includes(m))a.push(m)},err=m=>add(E,m),warn=m=>add(W,m),info=m=>add(I,m);
const HL={zh:'zh-CN',en:'en'},OGL={zh:'zh_CN',en:'en_US'};
const today=new Date().toISOString().slice(0,10);

const UI={
 zh:{sec:{projects:'项目',writing:'写作',links:'收藏'},lg1:'刚长出来',lg2:'熟透了 · 圆点会随时间慢慢变紫',jr:'经历',minRead:n=>`约 ${n} 分钟`,min:n=>`${n} 分钟`,ext:'外链',
  tip:'tip: 键盘输入 wine',home:'首页',more:'继续阅读',published:'发布于',updated:'更新于',altLabel:'EN',altAria:'Switch to English',themeAria:'切换明暗',linksAria:'联系方式',
  empty:'还没长出东西。在 content/projects/ 里新建一个 .md 文件，推送后这里就会结出第一颗。',nf:'找不到这个页面',nfText:'它可能还没长出来，或者已经被摘走了。',book:'预约聊聊 ↗',
  lines:['别戳，会出汁的。','还没熟。','慢慢来。','🍇'],aged:'陈酿模式 · Vintage 2026 🍷',unaged:'醒酒完毕。',away:'🍇 别走呀…',
  ask:(n,u)=>`请介绍一下 ${n}（${u}）：TA 是谁、做过什么、写过什么。`,cr:'版权所有'},
 en:{sec:{projects:'Projects',writing:'Writing',links:'Bookmarks'},lg1:'Just sprouted',lg2:'Fully ripe · the dots slowly turn purple',jr:'Journey',minRead:n=>`${n} min read`,min:n=>`${n} min`,ext:'link',
  tip:'tip: type wine',home:'Home',more:'Keep reading',published:'Published',updated:'Updated',altLabel:'中',altAria:'切换到中文',themeAria:'Toggle theme',linksAria:'Contact',
  empty:'Nothing here yet. Add a .md file under content/projects/ and push — the first grape will appear.',nf:'Page not found',nfText:'It may not have grown yet, or it has been picked.',book:'Book a chat ↗',
  lines:['Careful, I might burst.','Not ripe yet.','Take it slow.','🍇'],aged:'Vintage mode · 2026 🍷',unaged:'Decanted.',away:'🍇 Come back…',
  ask:(n,u)=>`Tell me about ${n} (${u}): who they are, what they build, what they write.`,cr:'All rights reserved'}};

/* ---------- helpers ---------- */
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const jsonSafe=o=>JSON.stringify(o).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
const prefix=L=>L===DEF?'':'/'+L,homePath=L=>prefix(L)+'/',postPath=(L,s)=>prefix(L)+'/p/'+s+'/';
const abs=p=>/^https?:/.test(p)?p:(SITE?SITE+encodeURI(p):encodeURI(p));
const isImg=c=>/^(\/|https?:)/.test(c||'');
const fill=(t,o)=>t.replace(/{{([A-Z0-9_]+)}}/g,(m,k)=>k in o?o[k]:m);
const hue=t=>[...String(t)].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
const ripe=d=>{const t=Math.min(1,Math.max(0,(Date.now()-new Date(d))/864e5/45));return `hsl(${(96+179*t).toFixed(0)} ${(48-6*t).toFixed(0)}% ${(58-16*t).toFixed(0)}%)`};
const write=(p,c)=>{mkdirSync(join(O,...p.split('/').slice(0,-1)),{recursive:true});writeFileSync(join(O,p),c)};
const clip=(s,n)=>{s=String(s).replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trimEnd()+'…':s};
const rfc822=d=>new Date(d+'T00:00:00Z').toUTCString();
const secLabel=(k,L)=>(cfg.sections&&cfg.sections[k]&&cfg.sections[k][L])||UI[L].sec[k]||k;

/* ---------- markdown：标题降一级（页面只留一个 h1）、标题带锚点、外链加 rel、图片懒加载 ---------- */
const slugify=s=>String(s).replace(/<[^>]*>/g,'').toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g,'-').replace(/^-|-$/g,'')||'section';
marked.use({renderer:{
 heading(a,b){const tk=typeof a==='object',depth=tk?a.depth:b,text=tk?this.parser.parseInline(a.tokens):a,d=Math.min(6,depth+1);return `<h${d} id="${slugify(text)}">${text}</h${d}>\n`},
 link(a,b,c){const tk=typeof a==='object',href=tk?a.href:a,title=tk?a.title:b,text=tk?this.parser.parseInline(a.tokens):c,ext=/^https?:/i.test(href);
  return `<a href="${esc(href)}"${title?` title="${esc(title)}"`:''}${ext?' rel="noopener" target="_blank"':''}>${text}</a>`},
 image(a,b,c){const tk=typeof a==='object',href=tk?a.href:a,title=tk?a.title:b,text=tk?a.text:c;
  return `<img src="${esc(href)}" alt="${esc(text)}"${title?` title="${esc(title)}"`:''} loading="lazy" decoding="async">`}}});

/* ---------- 读取 content ---------- */
const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.name.endsWith('.md')?[join(d,e.name)]:[]);
const fm=src=>{const m=src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);if(!m)return[{},src];const o={};
  for(const l of m[1].split(/\r?\n/)){const i=l.indexOf(':');if(i<1)continue;const k=l.slice(0,i).trim();let v=l.slice(i+1).trim();
    if(v.startsWith('['))v=v.slice(1,-1).split(',').map(s=>s.trim().replace(/^["']|["']$/g,'')).filter(Boolean);
    else if(v==='true'||v==='false')v=v==='true';else v=v.replace(/^["']|["']$/g,'');o[k]=v}
  return[o,src.slice(m[0].length)]};
const plainOf=b=>b.replace(/```[\s\S]*?```/g,'').replace(/!?\[([^\]]*)\]\([^)]*\)/g,'$1').replace(/[#>*_`\-]/g,'').replace(/\s+/g,' ').trim();

rmSync(O,{recursive:true,force:true});mkdirSync(O,{recursive:true});
if(existsSync('public'))cpSync('public',O,{recursive:true});

const groups=new Map();
if(existsSync(R))for(const f of walk(R)){
  const parts=relative(R,f).split(sep);let name=basename(f,'.md'),lang='all';
  const m=name.match(/^(.*)\.(zh|en)$/);if(m){name=m[1];lang=m[2]}
  const key=[...parts.slice(0,-1),name].join('/');
  if(!groups.has(key))groups.set(key,{dir:parts.slice(0,-1),name,f:{}});
  groups.get(key).f[lang]=f;
}
const posts=[],slugs=new Map();
for(const g of groups.values()){
  const V={};
  for(const k of ['zh','en','all'])if(g.f[k]){const [m,body]=fm(readFileSync(g.f[k],'utf8'));if(!m.draft)V[k]={m,body,f:g.f[k]}}
  const order=[V.zh,V.en,V.all].filter(Boolean);if(!order.length)continue;
  const pick=k=>{for(const v of order)if(v.m[k]!==undefined&&v.m[k]!=='')return v.m[k];return ''};
  const slug=String(pick('slug')||g.name).toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g,'-').replace(/^-|-$/g,'');
  if(!slug){err(`${g.f.zh||g.f.en||g.f.all}：无法生成网址（slug 为空），请在 front matter 里写 slug: xxx`);continue}
  if(slugs.has(slug))err(`网址重复：/p/${slug}/ 同时被 ${slugs.get(slug)} 和 ${order[0].f} 使用，请改名或写不同的 slug`);else slugs.set(slug,order[0].f);
  if(/[^a-z0-9-]/.test(slug))warn(`${order[0].f}：网址含非英文字符（/p/${slug}/），建议在 front matter 写 slug: english-words，更利于分享与收录`);
  const date=String(pick('date')||statSync(order[0].f).mtime.toISOString().slice(0,10)).slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||isNaN(new Date(date)))err(`${order[0].f}：date 必须是 YYYY-MM-DD，现在是「${date}」`);
  const updated=String(pick('updated')||date).slice(0,10);
  if(!pick('date'))warn(`${order[0].f}：没写 date，暂用文件修改时间（建议写上，日期会进入 sitemap 与结构化数据）`);
  const p={slug,date,updated,section:pick('section')||g.dir[0]||'writing',pin:pick('pin')?1:0,live:pick('live'),repo:pick('repo'),cover:pick('cover'),i:{},has:{},page:{},path:{},body:{}};
  for(const L of LANGS){
    const own=V[L]||V.all,src=own||V[OTHER(L)],plain=plainOf(src.body),tags=src.m.tags,url=src.m.url||'';
    p.has[L]=!!own;
    p.i[L]={title:src.m.title||g.name,summary:clip(src.m.summary||plain,L==='en'?158:100),tags:Array.isArray(tags)?tags:[],url,fb:own?'':OTHER(L),
      read:Math.max(1,Math.round(L==='en'?plain.split(/\s+/).length/200:plain.length/400)),words:L==='en'?plain.split(/\s+/).length:plain.length};
    p.body[L]=src.body;p.page[L]=!!own&&!url;
    if(url&&!/^https?:\/\//.test(url))err(`${src.f}：url 必须以 http:// 或 https:// 开头`);
    if(own){ // 单篇质量检查
      const x=p.i[L],f=own.f,zh=L==='zh';
      if(!src.m.title)warn(`${f}：没写 title`);
      if(x.title.length>(zh?32:62))warn(`${f}：标题偏长（${x.title.length}），搜索结果里会被截断，建议 ${zh?'≤32 字':'≤60 字符'}`);
      if(!url){
        if(!src.m.summary)warn(`${f}：没写 summary，将自动截取正文（建议手写 ${zh?'40–100 字':'80–155 字符'}）`);
        else if(src.m.summary.length<(zh?30:70)||src.m.summary.length>(zh?110:165))warn(`${f}：summary 长度 ${src.m.summary.length}，建议 ${zh?'40–100 字':'80–155 字符'}`);
        if(p.section==='writing'&&x.words<(zh?200:60))warn(`${f}：正文偏短（${x.words}${zh?' 字':' words'}），内容太薄不利于收录`);
        if(/!\[\]\(/.test(src.body))warn(`${f}：有图片没写 alt 文字（![说明](图片地址)）`);
        if(/^#\s/m.test(src.body))info(`${f}：正文里的 # 标题会自动降为二级标题（页面只保留一个 h1）`);
      }
    }
  }
  if(!(V.zh||V.all)||!(V.en||V.all))info(`${order[0].f}：只有${V.zh?'中文':'英文'}版，另一种语言的页面里会链接到这一版并标注语言`);
  for(const L of LANGS)p.path[L]=p.i[L].url?'':(p.page[L]?postPath(L,slug):(p.page[OTHER(L)]?postPath(OTHER(L),slug):''));
  posts.push(p);
}
posts.sort((a,b)=>(b.pin-a.pin)||(b.date>a.date?1:-1));
if(!SITE)warn('site.config.json 缺少 siteUrl（例如 https://uva.xyz）：canonical、sitemap、Open Graph 都需要它');

/* ---------- <head> / SEO ---------- */
const imgFor=p=>isImg(p?.cover)?{src:abs(p.cover)}:{src:abs(seo.ogImage||'/og-default.png'),w:1200,h:630};
function head(o){
  const {L,title,desc,path,type='website',img,alts=[],xdef,ld,pub,mod,tags=[],noindex=false}=o,url=abs(path),H=[];
  H.push(`<title>${esc(title)}</title>`,`<meta name="description" content="${esc(desc)}">`,
    `<meta name="robots" content="${noindex?'noindex,follow':'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'}">`,
    `<meta name="author" content="${esc(AUTHOR)}">`);
  if(tags.length)H.push(`<meta name="keywords" content="${esc(tags.join(', '))}">`);
  if(SITE&&!noindex)H.push(`<link rel="canonical" href="${esc(url)}">`);
  if(!noindex&&alts.length){for(const [hl,p] of alts)H.push(`<link rel="alternate" hreflang="${hl}" href="${esc(abs(p))}">`);if(xdef)H.push(`<link rel="alternate" hreflang="x-default" href="${esc(abs(xdef))}">`)}
  H.push(`<meta property="og:site_name" content="${esc(NAME)}">`,`<meta property="og:type" content="${type}">`,`<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(desc)}">`,`<meta property="og:url" content="${esc(url)}">`,`<meta property="og:locale" content="${OGL[L]}">`);
  for(const [hl] of alts)if(hl!==HL[L])H.push(`<meta property="og:locale:alternate" content="${hl==='zh-CN'?'zh_CN':'en_US'}">`);
  if(img){H.push(`<meta property="og:image" content="${esc(img.src)}">`,`<meta property="og:image:alt" content="${esc(title)}">`);
    if(img.w)H.push(`<meta property="og:image:width" content="${img.w}">`,`<meta property="og:image:height" content="${img.h}">`)}
  if(type==='article'){H.push(`<meta property="article:published_time" content="${pub}">`,`<meta property="article:modified_time" content="${mod}">`,`<meta property="article:author" content="${esc(AUTHOR)}">`);for(const t of tags)H.push(`<meta property="article:tag" content="${esc(t)}">`)}
  H.push(`<meta name="twitter:card" content="summary_large_image">`,`<meta name="twitter:title" content="${esc(title)}">`,`<meta name="twitter:description" content="${esc(desc)}">`);
  if(img)H.push(`<meta name="twitter:image" content="${esc(img.src)}">`);
  if(seo.twitter)H.push(`<meta name="twitter:site" content="${esc(seo.twitter)}">`,`<meta name="twitter:creator" content="${esc(seo.twitter)}">`);
  if(ver.google)H.push(`<meta name="google-site-verification" content="${esc(ver.google)}">`);
  if(ver.bing)H.push(`<meta name="msvalidate.01" content="${esc(ver.bing)}">`);
  if(ver.baidu)H.push(`<meta name="baidu-site-verification" content="${esc(ver.baidu)}">`);
  if(ver.yandex)H.push(`<meta name="yandex-verification" content="${esc(ver.yandex)}">`);
  H.push(`<meta name="theme-color" content="#fbfaf7" media="(prefers-color-scheme: light)">`,`<meta name="theme-color" content="#0c0b10" media="(prefers-color-scheme: dark)">`,
    `<link rel="icon" href="/favicon.ico" sizes="48x48">`,`<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,`<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<link rel="alternate" type="application/rss+xml" title="${esc(NAME)} RSS (${L})" href="${esc(abs(prefix(L)+'/rss.xml'))}">`);
  if(ld)H.push(`<script type="application/ld+json">${jsonSafe(ld)}</script>`);
  return H.join('\n');
}

/* ---------- 吉祥物 / 首页 ---------- */
function markHTML(){
  if(cfg.avatar)return `<img id="mark" src="${esc(cfg.avatar)}" alt="${esc(AUTHOR)}" width="84" height="84">`;
  const rows=[[13.1,25.7,38.3,50.9],[19.4,32,44.6],[25.7,38.3],[32]],op=[.62,.76,.88,1];
  let h=`<svg id="mark" viewBox="0 0 64 64" role="img" aria-label="${esc(NAME)}"><path d="M32 17.5C32 11.5 34 8 37 6" stroke="var(--g)" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M36.5 8C37 3 43 1 50 2.5c0 5.5-5 9-13.5 5.5z" fill="var(--g)"/>`;
  rows.forEach((r,i)=>r.forEach((x,j)=>{const y=+(23+i*10.9).toFixed(1),k=(1+i*.35+((i*7+j*3)%10)/33).toFixed(2);
    h+=`<g class="g" data-x="${x}" data-y="${y}" data-k="${k}"><circle cx="${x}" cy="${y}" r="6" fill="var(--acc)" opacity="${op[i]}"/><circle cx="${+(x-2.3).toFixed(1)}" cy="${+(y-2.5).toFixed(1)}" r="1.6" fill="#fff" opacity=".45"/></g>`}));
  return h+'</svg>';
}
const tpHome=readFileSync('src/index.html','utf8'),tpPost=readFileSync('src/post.html','utf8');
const lastmodAll=posts.reduce((m,p)=>p.updated>m?p.updated:m,'0000')||today;

function homePage(L){
  const c=cfg[L]||cfg[DEF]||{},u=UI[L],O2=OTHER(L),title=c.title||NAME,desc=clip(c.description||'',158);
  const bioF=[`about.${L}.md`,'about.md'].find(existsSync),bio=bioF?`<div class="bio">${marked.parse(readFileSync(bioF,'utf8'))}</div>`:'';
  const A=[];if(cfg.email)A.push([cfg.email,'mailto:'+cfg.email]);Object.entries(cfg.socials||{}).forEach(([k,v])=>v&&A.push([k+' ↗',v]));if(cfg.booking)A.push([u.book,cfg.booking]);
  if(cfg.askAI){const q=encodeURIComponent((cfg.askPrompt&&cfg.askPrompt[L])||u.ask(AUTHOR,abs(homePath(L))));A.push(['Ask Claude ↗','https://claude.ai/new?q='+q],['Ask ChatGPT ↗','https://chatgpt.com/?q='+q])}
  const links=A.map(([t,h])=>`<a href="${esc(h)}"${h.startsWith('mailto')?'':' target="_blank" rel="noopener"'}>${esc(t)}</a>`).join('');
  const g={};posts.forEach((p,i)=>(g[p.section]=g[p.section]||[]).push([p,i]));
  const keys=[...['projects','writing','links'].filter(k=>g[k]),...Object.keys(g).filter(k=>!['projects','writing','links'].includes(k))];
  const row=(p,i)=>{const x=p.i[L],ext=!!x.url,href=ext?x.url:p.path[L];
    const fb=x.fb?`<em class="fb" lang="${HL[x.fb]}">${x.fb==='en'?'EN':'中'}</em>`:'';
    return `<a class="row" href="${esc(href)}"${ext?' target="_blank" rel="noopener"':''}${x.fb?` hreflang="${HL[x.fb]}"`:''} data-i="${i}"><i class="dot" data-d="${p.date}" style="background:${ripe(p.date)}"></i><span class="t">${esc(x.title)}${ext?' <em>↗</em>':''}${fb}</span><time datetime="${p.date}">${p.date}</time><span class="d">${esc(x.summary)}</span></a>`};
  let secs=posts.length?'':`<div class="sec"><p class="empty">${esc(u.empty)}</p></div>`;
  keys.forEach((k,n)=>{secs+=`<section class="sec" id="${esc(k)}"><h2 class="lb"><span>${esc(secLabel(k,L))}</span></h2>${n===0?`<p class="legend"><i class="dot" style="background:hsl(96 48% 58%)"></i>${u.lg1}<i class="dot" style="background:hsl(275 42% 42%);margin-left:8px"></i>${u.lg2}</p>`:''}${g[k].map(([p,i])=>row(p,i)).join('')}</section>`});
  const J=c.journey||[],jr=J.length?`<section class="sec" id="journey"><h2 class="lb"><span>${u.jr}</span></h2>${J.map(j=>`<div class="jr"><span class="m">${esc(j.time||'')}</span><div><b>${j.url?`<a href="${esc(j.url)}" target="_blank" rel="noopener">${esc(j.org)} ↗</a>`:esc(j.org)}</b> <span>· ${esc(j.role||'')}</span></div>${j.text?`<p>${esc(j.text)}</p>`:''}</div>`).join('')}</section>`:'';
  const tg=c.tagline||['',''];
  const P=posts.map(p=>{const x=p.i[L];return {t:x.title,s:x.summary,tags:x.tags,c:p.cover||'',d:p.date,m:x.url?u.ext:u.min(x.read),h:hue(p.i.zh.title),sec:secLabel(p.section,L)}});
  const alts=LANGS.map(l=>[HL[l],homePath(l)]);
  const ld={'@context':'https://schema.org','@graph':[
    {'@type':'WebSite','@id':abs('/')+'#website','url':abs(homePath(L)),'name':NAME,'description':desc,'inLanguage':HL[L],'publisher':{'@id':abs('/')+'#person'}},
    {'@type':'Person','@id':abs('/')+'#person','name':AUTHOR,'url':abs(homePath(L)),'sameAs':Object.values(cfg.socials||{}).filter(Boolean),...(cfg.avatar?{image:abs(cfg.avatar)}:{})},
    {'@type':'CollectionPage','@id':abs(homePath(L))+'#posts','url':abs(homePath(L)),'name':title,'inLanguage':HL[L],'mainEntity':{'@type':'ItemList','itemListElement':posts.filter(p=>p.path[L]||p.i[L].url).map((p,i)=>({'@type':'ListItem','position':i+1,'url':abs(p.i[L].url||p.path[L]),'name':p.i[L].title}))}}]};
  const html=fill(tpHome,{LANG:HL[L],CODE:L,HEAD:head({L,title,desc,path:homePath(L),img:imgFor(null),alts,xdef:homePath(DEF),ld}),
    HOST:SITE?new URL(SITE).hostname:'',ALTHOME:homePath(O2),ALTHL:HL[O2],ALTLABEL:u.altLabel,ALTARIA:u.altAria,THEMEARIA:u.themeAria,LINKSARIA:u.linksAria,MARK:markHTML(),
    HI:esc(c.hi||''),H1:`${esc(tg[0])}<br><em>${esc(tg[1]||'')}</em>`,BIO:bio,LINKS:links,SECS:secs,JR:jr,GH:esc(cfg.github||''),
    COPY:`© ${new Date().getFullYear()} ${esc(AUTHOR)}`,RSS:prefix(L)+'/rss.xml',REPO:esc(cfg.repo||'#'),TIP:esc(u.tip),
    DATA:jsonSafe({P,code:L,gh:cfg.github||'',T:{lines:u.lines,aged:u.aged,unaged:u.unaged,away:u.away}})});
  write(prefix(L).slice(1)?prefix(L).slice(1)+'/index.html':'index.html',html);
}

/* ---------- 文章页（每篇每种语言一个独立页面）---------- */
function postPage(p,L){
  const x=p.i[L],u=UI[L],O2=OTHER(L),path=postPath(L,p.slug),both=p.page.zh&&p.page.en,titleTag=`${x.title} — ${NAME}`,img=imgFor(p);
  const sec=secLabel(p.section,L),homeL=homePath(L);
  const links=[p.live&&`<a href="${esc(p.live)}" rel="noopener">Live ↗</a>`,p.repo&&`<a href="${esc(p.repo)}" rel="noopener">Source ↗</a>`].filter(Boolean).join(' · ');
  const meta=`<p class="meta"><time datetime="${p.date}">${u.published} ${p.date}</time>${p.updated!==p.date?` · <time datetime="${p.updated}">${u.updated} ${p.updated}</time>`:''} · ${u.minRead(x.read)}${links?` · ${links}`:''}</p>`;
  const rel=posts.filter(q=>q!==p&&q.page[L]).sort((a,b)=>((b.section===p.section)-(a.section===p.section))||(b.date>a.date?1:-1)).slice(0,3);
  const related=rel.length?`<aside class="related" aria-labelledby="rel"><h2 id="rel">${u.more}</h2>${rel.map(q=>`<a href="${esc(postPath(L,q.slug))}"><b>${esc(q.i[L].title)}</b><p>${esc(q.i[L].summary)}</p></a>`).join('')}</aside>`:'';
  const alts=both?LANGS.map(l=>[HL[l],postPath(l,p.slug)]):[];
  const ld={'@context':'https://schema.org','@graph':[
    {'@type':'BlogPosting','@id':abs(path)+'#article','headline':clip(x.title,110),'description':x.summary,'url':abs(path),'mainEntityOfPage':{'@type':'WebPage','@id':abs(path)},
     'datePublished':p.date,'dateModified':p.updated,'inLanguage':HL[L],'articleSection':sec,'image':[img.src],...(x.tags.length?{keywords:x.tags.join(', ')}:{}),
     'author':{'@type':'Person','name':AUTHOR,'url':abs(homePath(L))},'publisher':{'@type':'Person','name':AUTHOR,'url':abs(homePath(L))},'isPartOf':{'@id':abs('/')+'#website'}},
    {'@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':u.home,'item':abs(homeL)},{'@type':'ListItem','position':2,'name':sec,'item':abs(homeL+'#'+p.section)},{'@type':'ListItem','position':3,'name':x.title,'item':abs(path)}]}]};
  const crumb=`<nav class="crumb" aria-label="Breadcrumb"><a href="${homeL}">${u.home}</a><span>/</span><a href="${homeL}#${esc(p.section)}">${esc(sec)}</a></nav>`;
  const html=fill(tpPost,{LANG:HL[L],HEAD:head({L,title:titleTag,desc:x.summary,path,type:'article',img,alts,xdef:both?postPath(DEF,p.slug):undefined,ld,pub:p.date,mod:p.updated,tags:x.tags}),
    ALTHREF:p.page[O2]?postPath(O2,p.slug):homePath(O2),ALTHL:HL[O2],ALTLABEL:u.altLabel,ALTARIA:u.altAria,ALTCODE:O2,THEMEARIA:u.themeAria,CRUMB:crumb,H1:esc(x.title),META:meta,
    TAGS:x.tags.length?`<p class="tags">${x.tags.map(t=>`<span>#${esc(t)}</span>`).join('')}</p>`:'',BODY:marked.parse(p.body[L]),RELATED:related,HOME:homeL,HOMETXT:'← '+u.home,RSS:prefix(L)+'/rss.xml',COPY:`© ${new Date().getFullYear()} ${esc(AUTHOR)}`});
  write(path.slice(1)+'index.html',html);
}

for(const L of LANGS)homePage(L);
for(const p of posts)for(const L of LANGS)if(p.page[L])postPage(p,L);

/* ---------- 404 ---------- */
{const L=DEF,u=UI[L];write('404.html',fill(tpPost,{LANG:HL[L],HEAD:head({L,title:`${u.nf} — ${NAME}`,desc:u.nfText,path:'/404.html',img:null,noindex:true}),
  ALTHREF:homePath(OTHER(L)),ALTHL:HL[OTHER(L)],ALTLABEL:u.altLabel,ALTARIA:u.altAria,ALTCODE:OTHER(L),THEMEARIA:u.themeAria,CRUMB:'',H1:esc(u.nf),META:'',TAGS:'',
  BODY:`<p>${esc(u.nfText)}</p><p><a href="${homePath(L)}">← ${u.home}</a></p>`,RELATED:'',HOME:homePath(L),HOMETXT:'← '+u.home,RSS:prefix(L)+'/rss.xml',COPY:`© ${new Date().getFullYear()} ${esc(AUTHOR)}`}))}

/* ---------- sitemap / rss / robots / llms.txt / _headers ---------- */
const xe=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const urls=[];
{const alt=LANGS.map(l=>[HL[l],abs(homePath(l))]);for(const L of LANGS)urls.push({loc:abs(homePath(L)),mod:lastmodAll,alt,xd:abs(homePath(DEF))})}
for(const p of posts){const both=p.page.zh&&p.page.en,alt=both?LANGS.map(l=>[HL[l],abs(postPath(l,p.slug))]):[];for(const L of LANGS)if(p.page[L])urls.push({loc:abs(postPath(L,p.slug)),mod:p.updated,alt,xd:both?abs(postPath(DEF,p.slug)):''})}
write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`+
  urls.map(u=>`<url><loc>${xe(u.loc)}</loc><lastmod>${u.mod}</lastmod>${u.alt.map(([h,l])=>`<xhtml:link rel="alternate" hreflang="${h}" href="${xe(l)}"/>`).join('')}${u.xd?`<xhtml:link rel="alternate" hreflang="x-default" href="${xe(u.xd)}"/>`:''}</url>`).join('\n')+`\n</urlset>\n`);
write('robots.txt',`User-agent: *\nAllow: /\n\n${SITE?`Sitemap: ${SITE}/sitemap.xml\n`:''}`);
for(const L of LANGS){const c=cfg[L]||{},items=posts.filter(p=>p.page[L]);
  write(prefix(L).slice(1)?`${prefix(L).slice(1)}/rss.xml`:'rss.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${xe(c.title||NAME)}</title><link>${xe(abs(homePath(L)))}</link><description>${xe(c.description||'')}</description><language>${HL[L]}</language><lastBuildDate>${rfc822(today)}</lastBuildDate><atom:link href="${xe(abs(prefix(L)+'/rss.xml'))}" rel="self" type="application/rss+xml"/>\n`+
  items.map(p=>`<item><title>${xe(p.i[L].title)}</title><link>${xe(abs(p.path[L]))}</link><guid isPermaLink="true">${xe(abs(p.path[L]))}</guid><pubDate>${rfc822(p.date)}</pubDate><description>${xe(p.i[L].summary)}</description>${p.i[L].tags.map(t=>`<category>${xe(t)}</category>`).join('')}</item>`).join('\n')+`\n</channel></rss>\n`)}
write('llms.txt',`# ${NAME}\n\n> ${(cfg[DEF]&&cfg[DEF].description)||''}\n\n`+LANGS.map(L=>`## ${L==='zh'?'中文':'English'}（${abs(homePath(L))}）\n\n`+
  [...new Set(posts.map(p=>p.section))].map(k=>{const items=posts.filter(p=>p.section===k&&(p.path[L]||p.i[L].url));return items.length?`### ${secLabel(k,L)}\n`+items.map(p=>`- [${p.i[L].title}](${abs(p.i[L].url||p.path[L])}): ${p.i[L].summary}`).join('\n')+'\n':''}).join('\n')).join('\n'));
write('_headers',`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n`);

/* ---------- 发布后自检 ---------- */
const files=[];(function w(d){for(const e of readdirSync(d,{withFileTypes:true}))e.isDirectory()?w(join(d,e.name)):files.push(join(d,e.name))})(O);
const htmls=files.filter(f=>f.endsWith('.html')),rel=f=>'/'+relative(O,f).split(sep).join('/');
const exists=p=>{p=decodeURI(p);const f=join(O,p);return p.endsWith('/')?existsSync(join(f,'index.html')):(existsSync(f)&&statSync(f).isFile())||existsSync(join(f,'index.html'))};
const titles=new Map(),descs=new Map(),altMap=new Map();
for(const f of htmls){
  const h=readFileSync(f,'utf8'),r=rel(f),is404=r==='/404.html';
  const n=(re)=>(h.match(re)||[]).length;
  if(n(/<title>/g)!==1)err(`${r}：<title> 数量应为 1`);
  if(n(/<h1[ >]/g)!==1)err(`${r}：<h1> 数量应为 1（现在 ${n(/<h1[ >]/g)}）`);
  if(!/<meta name="description" content="[^"]+"/.test(h))err(`${r}：缺少 meta description`);
  if(!is404){
    if(SITE&&n(/<link rel="canonical"/g)!==1)err(`${r}：canonical 应有且仅有 1 个`);
    for(const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1])}catch(e){err(`${r}：JSON-LD 不是合法 JSON`)}}
    const t=(h.match(/<title>([^<]*)<\/title>/)||[])[1],d=(h.match(/<meta name="description" content="([^"]*)"/)||[])[1];
    if(titles.has(t))warn(`标题重复：「${t}」出现在 ${titles.get(t)} 和 ${r}`);else titles.set(t,r);
    if(descs.has(d))warn(`描述重复：${descs.get(d)} 与 ${r} 的 description 相同`);else descs.set(d,r);
    const al=[...h.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].filter(m=>m[1]!=='x-default').map(m=>m[2]);if(al.length)altMap.set(abs(r.replace(/index\.html$/,'')),al);
  }
  for(const m of h.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)){if(m[1].startsWith('//'))continue;if(!exists(m[1]))err(`${r}：内部链接/图片不存在 → ${m[1]}`)}
}
for(const [self,al] of altMap)for(const a of al){const back=altMap.get(a);if(!back||!back.includes(self))err(`hreflang 没有互相指回：${self} ↔ ${a}`)}
for(const u of urls){if(SITE&&u.loc.startsWith(SITE)){const p=decodeURI(u.loc.slice(SITE.length));if(!exists(p))err(`sitemap 里的地址不存在：${p}`)}}

/* ---------- IndexNow（可选，仅 Cloudflare 生产构建时通知 Bing/Yandex 等）---------- */
if(seo.indexNowKey&&SITE){write(`${seo.indexNowKey}.txt`,seo.indexNowKey);
  const br=cfg.productionBranch||'main',prod=(process.env.WORKERS_CI==='1'&&process.env.WORKERS_CI_BRANCH===br)||(process.env.CF_PAGES==='1'&&process.env.CF_PAGES_BRANCH===br);
  if(prod&&!E.length){
    try{const r=await fetch('https://api.indexnow.org/indexnow',{method:'POST',headers:{'content-type':'application/json'},signal:AbortSignal.timeout(8000),
      body:JSON.stringify({host:new URL(SITE).host,key:seo.indexNowKey,keyLocation:`${SITE}/${seo.indexNowKey}.txt`,urlList:urls.map(u=>u.loc)})});info(`IndexNow 已通知（HTTP ${r.status}）`)}catch(e){warn('IndexNow 通知失败（不影响构建）')}}}

/* ---------- 报告 ---------- */
const pages=htmls.length-1;
console.log(`\n✓ ${posts.length} 篇内容 · ${pages} 个页面 · sitemap ${urls.length} 条 · 语言 ${LANGS.join('/')}（默认 ${DEF}）`);
for(const m of I)console.log('  ℹ',m);
for(const m of W)console.log('  ⚠',m);
for(const m of E)console.log('  ✗',m);
if(E.length){console.log(`\n构建失败：${E.length} 个错误（线上会继续保持上一个正常版本）`);process.exit(1)}
console.log(W.length?`\n通过，但有 ${W.length} 条建议。`:'\n全部检查通过 ✔');
