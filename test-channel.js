const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
process.env.DATA_DIR=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'joker-channel-'));
delete process.env.CHANNEL_URL;
const config=require('./config');
const handler=require('./handler');
const {channelSocket}=require('./reply-links');
const users=require('./userstore');
async function main(){
  const link='https://whatsapp.com/channel/0029VbDxbVnDTkK6xgnh7L1L';
  assert.equal(config.channelUrl,link,'Supplied channel is the default');
  const sends=[];
  const sock={sendMessage:async(j,c)=>{sends.push(c);return {key:{id:'sent'}};}};
  const send=async(text,id)=>handler(sock,{key:{remoteJid:id+'@s.whatsapp.net',id},message:{conversation:text}});
  await send('.ping','command');assert.ok(sends.pop().text.includes(link),'Command reply includes channel');
  const originalFetch=global.fetch;
  global.fetch=()=>{throw new Error('Automatic replies must not generate paid media');};
  try{
    for(const type of ['image','audio','video']){
      sends.length=0;
      await handler(sock,{key:{remoteJid:type+'@s.whatsapp.net',id:type},message:{[type+'Message']:{}}});
      assert.equal(sends.length,1);assert.ok(sends[0].text.includes(link));
    }
  }finally{global.fetch=originalFetch;}
  users.set('disabled@s.whatsapp.net',{autoImages:false});sends.length=0;
  await handler(sock,{key:{remoteJid:'disabled@s.whatsapp.net'},message:{videoMessage:{}}});assert.equal(sends.length,0);
  await send('.menu','menu');assert.ok(sends.some(c=>c.image));assert.ok(sends.some(c=>c.video));assert.ok(sends.some(c=>c.audio));
  for(const c of sends.filter(c=>c.image||c.video))assert.ok(c.caption.includes(link));
  sends.length=0;
  const linked=channelSocket(sock,config,'fr');
  const bytes=Buffer.from('audio');await linked.sendMessage('j',{audio:bytes});
  assert.equal(sends.length,2);assert.equal(sends[0].audio,bytes);assert.ok(sends[1].text.includes(link));
  fs.rmSync(process.env.DATA_DIR,{recursive:true,force:true});
  console.log('Channel default, command/media replies, received image/audio/video, no automatic generation and video opt-out OK.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});