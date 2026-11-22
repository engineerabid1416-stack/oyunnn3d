const http=require('http'),fs=require('fs'),path=require('path'),{WebSocketServer}=require('ws');
const html=fs.readFileSync(path.join(__dirname,'index.html'));
const srv=http.createServer((q,r)=>{r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(html)});
const wss=new WebSocketServer({server:srv,maxPayload:4096});
const rooms=new Map(),J=JSON.stringify;let n=0;
wss.on('connection',ws=>{let room=null,id=null,code='';
 const bc=o=>{const s=J(o);for(const[k,v]of room)if(k!==id&&v.ws.readyState===1)v.ws.send(s)};
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch{return}
  if(m.t==='join'&&!room){const c=String(m.code||'').toUpperCase().slice(0,6);
   if(m.host){if(rooms.has(c))return ws.send(J({t:'err',m:'Kod kullanımda, tekrar dene.'}));rooms.set(c,new Map())}
   else if(!rooms.has(c))return ws.send(J({t:'err',m:'Bu kodla bir oda bulunamadı.'}));
   if(rooms.get(c).size>=12)return ws.send(J({t:'err',m:'Oda dolu.'}));
   room=rooms.get(c);code=c;id='p'+(++n);
   ws.send(J({t:'hello',id,list:[...room].map(([k,v])=>({id:k,p:v.p}))}));room.set(id,{ws,p:{}})}
  else if(room&&m.t==='p'&&m.p&&typeof m.p==='object'){room.get(id).p=m.p;bc({t:'p',id,p:m.p})}
  else if(room&&m.t==='e'&&typeof m.k==='string'){bc({t:'e',id,k:m.k,d:m.d})}});
 ws.on('close',()=>{if(!room)return;room.delete(id);bc({t:'left',id});if(!room.size)rooms.delete(code)})});
srv.listen(process.env.PORT||3000,()=>console.log('VALO-3D hazır'));
