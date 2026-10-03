// Cloudflare Pages Function → /api/guestbook  (需要绑定 D1：变量名 DB)
const json=(d,s=200)=>new Response(JSON.stringify(d),{status:s,headers:{'content-type':'application/json;charset=utf-8','cache-control':'no-store'}});
const COLORS=['violet','green','rose','amber'];
const sha=async s=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].slice(0,8).map(b=>b.toString(16).padStart(2,'0')).join('');

export async function onRequestGet({env}){
  const {results}=await env.DB.prepare('SELECT id,name,body,color,created FROM notes WHERE hidden=0 ORDER BY id DESC LIMIT 60').all();
  return json(results);
}
export async function onRequestPost({request,env}){
  let d;try{d=await request.json()}catch{return json({error:'格式不对'},400)}
  if(d.website)return json({ok:true});                                   // 蜜罐：机器人才会填
  const body=String(d.body||'').trim().slice(0,140),name=String(d.name||'').trim().slice(0,20)||'路过的葡萄';
  const color=COLORS.includes(d.color)?d.color:'violet';
  if(body.length<2)return json({error:'再多写一点点吧'},400);
  if(/https?:\/\/|www\./i.test(body+name))return json({error:'为了防广告，暂不支持链接'},400);
  const ip=await sha((request.headers.get('cf-connecting-ip')||'')+(env.SALT||''));   // 只存哈希，不存原始 IP
  const r=await env.DB.prepare("SELECT COUNT(*) a,COALESCE(SUM(created>datetime('now','-1 minute')),0) b FROM notes WHERE ip=? AND created>datetime('now','-1 hour')").bind(ip).first();
  if(r.b>=1||r.a>=5)return json({error:'挂得太快啦，歇一会儿再来'},429);
  const res=await env.DB.prepare('INSERT INTO notes(name,body,color,ip) VALUES(?,?,?,?)').bind(name,body,color,ip).run();
  return json({note:{id:res.meta.last_row_id,name,body,color,created:new Date().toISOString().replace('T',' ').slice(0,19)}},201);
}
