const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(),'joker40-'));
const commands = require('./commands/popular40');
const media = require('./media');
const handler = require('./handler');
const users = require('./userstore');
const groups = require('./groupstore');
const config = require('./config');
async function main() {
  assert.equal(Object.keys(commands).length,40);
  const names=new Set();
  for(const file of fs.readdirSync(path.join(__dirname,'commands')).filter(n=>n.endsWith('.js'))){
    for(const name of Object.keys(require('./commands/'+file))){assert.equal(names.has(name),false,`Collision ${name}`);names.add(name);}
  }
  assert.equal(names.size,230);
  const outputs=[]; const sends=[];
  const ctx={args:[],sender:'222@s.whatsapp.net',jid:'222@s.whatsapp.net',isOwner:true,isAdmin:true,config,reply:async v=>outputs.push(v),sock:{sendMessage:async(j,c)=>sends.push(c)},m:{key:{id:'creation1',remoteJid:'222@s.whatsapp.net'},message:{}}};
  const exact={sha256:['abc','ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'],md5:['abc','900150983cd24fb0d6963f7d28e17f72'],extractlinks:['hi https://example.com','https://example.com'],spoiler:['abc','||abc||'],titlecase:['hello world','Hello World'],kebabcase:['École du jour','ecole-du-jour'],charfreq:['aba','a: 2\nb: 1'],lines:['hello','1'],sentences:['Hello. Yes!','2'],removeemoji:['Hi 😊','Hi'],nato:['abc','Alpha Bravo Charlie'],readingtime:['one two','1 min']};
  for(const [name,[text,result]] of Object.entries(exact)){outputs.length=0;await commands[name]({...ctx,args:[text]});assert.equal(outputs[0],result,name);}
  for(const field of ['autoimage','automusic']) {
    await commands[field]({...ctx,args:['off']});assert.equal(users.get(ctx.sender)[field==='autoimage'?'autoImages':'autoMusic'],false);
    await commands[field]({...ctx,args:['on']});assert.equal(users.get(ctx.sender)[field==='autoimage'?'autoImages':'autoMusic'],true);
    await commands[field]({...ctx,jid:'g@g.us',isOwner:false,isAdmin:false,args:['off']});assert.equal(groups.get('g@g.us')[field==='autoimage'?'autoImages':'autoMusic'],undefined);
  }
  const originalChannel=config.channelUrl;
  await commands.setchannel({...ctx,isOwner:false,args:['https://whatsapp.com/channel/ABC']});assert.equal(config.channelUrl,originalChannel);
  await commands.setchannel({...ctx,args:['https://evil.example/']});assert.equal(config.channelUrl,originalChannel);
  await commands.setchannel({...ctx,args:['https://whatsapp.com/channel/ABC']});assert.equal(config.channelUrl,'https://whatsapp.com/channel/ABC');
  config.channelUrl='';
  for(const type of ['image','audio','video']) {
    sends.length=0;
    const message={[type+'Message']:{mimetype:type==='image'?'image/jpeg':'audio/ogg'}};
    await handler(ctx.sock,{key:{remoteJid:ctx.jid,id:'received-'+type},message});assert.equal(sends.length,1);assert.match(sends[0].text,/reçu/);
    await handler(ctx.sock,{key:{remoteJid:ctx.jid,id:'repeat-'+type},message});assert.equal(sends.length,1,'Cooldown prevents repeat');
    await handler(ctx.sock,{key:{remoteJid:'self@s.whatsapp.net',fromMe:true},message});assert.equal(sends.length,1,'No self reply');
  }
  users.set('disabled@s.whatsapp.net',{autoImages:false});sends.length=0;
  await handler(ctx.sock,{key:{remoteJid:'disabled@s.whatsapp.net'},message:{imageMessage:{}}});assert.equal(sends.length,0);
  let calls=0; const original=global.fetch; const oldKey=process.env.LOVABLE_API_KEY;
  process.env.LOVABLE_API_KEY='test-placeholder';
  global.fetch=async (url,init)=>{calls++;const body=JSON.parse(init.body);assert.equal(body.model,'google/lyria-3-clip-preview');assert.equal(body.input[0].content[0].text,'Instrumental piano');return new Response(Buffer.from('mock mp3'),{headers:{'Content-Type':'audio/mpeg'}});};
  try {
    sends.length=0;await commands.compose({...ctx,args:['Instrumental piano']});assert.equal(calls,1);assert.deepEqual(sends[0].audio,Buffer.from('mock mp3'));
    await commands.compose({...ctx,args:['Instrumental piano']});assert.equal(calls,1,'Repeated delivery uses saved bytes');
    const files=media.library(ctx.sender);assert.equal(files.length,1);
    await commands.getmedia({...ctx,args:[files[0]]});assert.equal(calls,1,'Replay does not generate');assert.deepEqual(sends[2].audio,sends[0].audio);
    await commands.getmedia({...ctx,sender:'another-user',args:[files[0]]});assert.equal(sends.length,3,'Other user cannot read media');
    global.fetch=async()=>{calls++;return new Response(JSON.stringify({message:'Credit unavailable',type:'insufficient_credits'}),{status:402,headers:{'Content-Type':'application/json'}});};
    await assert.rejects(media.generateMusic('test'),/Credit unavailable/);assert.equal(media.state().status,402);
    const before=calls;await assert.rejects(media.generateImage('test'),/Credit unavailable/);assert.equal(calls,before,'Persisted pause prevents more gateway work');
    fs.rmSync(path.join(media.root(),'gateway.json'));
    // Real image conversion and real audio conversion, with only the WhatsApp transport mocked.
    sends.length=0;
    await commands.grayscale({...ctx,quoted:{imageMessage:{mimetype:'image/jpeg'}},downloadMedia:async()=>fs.readFileSync(path.join(__dirname,'assets/gallery/joker-photo-1.jpg'))});
    assert.ok(sends[0].image.length>100);assert.equal(sends[0].image.subarray(1,4).toString(),'PNG');
    await commands.toaudio({...ctx,quoted:{audioMessage:{mimetype:'audio/mp4'}},downloadMedia:async()=>fs.readFileSync(path.join(__dirname,'assets/music/01-rushex.m4a'))});assert.ok(sends[1].audio.length>100);
  } finally {global.fetch=original;if(oldKey)process.env.LOVABLE_API_KEY=oldKey;else delete process.env.LOVABLE_API_KEY;fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});}
  console.log('40 commands: exact count, collisions, text results, permissions, automatic replies, cooldown, generation/replay, credit pause, real image/audio conversions OK.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});