const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const media = require('../media');
const users = require('../userstore');
const groups = require('../groupstore');
const input = ctx => ctx.args.join(' ').trim();
const tool = (name, fn) => async ctx => input(ctx) ? ctx.reply(fn(input(ctx))) : ctx.reply(`Exemple : ${ctx.config.prefix}${name} texte`);
const convert = (types, flags, ext, kind) => async ctx => {
  if (!media.info(ctx.quoted || ctx.m.message)) return ctx.reply('Reponn sou foto, mizik oswa videyo a ak kòmand sa a.');
  return media.transform(ctx,types,flags,ext,kind);
};
const setting = field => async ctx => {
  if (!['on','off'].includes(ctx.args[0])) return ctx.reply('Exemple : ' + ctx.config.prefix + (field==='autoImages'?'autoimage':'automusic') + ' on/off');
  if (ctx.jid.endsWith('@g.us') && !ctx.isAdmin && !ctx.isOwner) return ctx.reply('Se sèlman admin gwoup la ki ka chanje sa.');
  const store = ctx.jid.endsWith('@g.us') ? groups : users;
  store.set(ctx.jid.endsWith('@g.us') ? ctx.jid : ctx.sender,{[field]:ctx.args[0]==='on'});
  return ctx.reply('Repons otomatik: '+ctx.args[0]);
};
const create = kind => async ctx => input(ctx) ? media.generate(ctx,kind,input(ctx)) : ctx.reply('Dekri sa ou vle kreye apre kòmand la.');
async function asset(ctx,type) {
  const dir = path.join(__dirname,'..','assets',type==='audio'?'music':'gallery');
  const files = fs.readdirSync(dir).filter(n => type==='audio'?/\.(mp3|m4a|ogg)$/i.test(n):/\.(png|jpg|jpeg)$/i.test(n));
  if (!files.length) return ctx.reply('Pa gen medya disponib.');
  const file = files[Math.floor(Math.random()*files.length)];
  return ctx.sock.sendMessage(ctx.jid,{[type]:fs.readFileSync(path.join(dir,file)),...(type==='audio'?{mimetype:file.endsWith('.m4a')?'audio/mp4':file.endsWith('.ogg')?'audio/ogg':'audio/mpeg'}:{})},{quoted:ctx.m});
}
module.exports = {
  imagine:create('image'), compose:create('audio'), aivideo:create('video'),
  autoimage:setting('autoImages'), automusic:setting('autoMusic'),
  mediastatus:async ctx => { const s=ctx.jid.endsWith('@g.us')?groups.get(ctx.jid):users.get(ctx.sender);return ctx.reply(`Foto: ${s.autoImages!==false?'on':'off'}\nMizik: ${s.autoMusic!==false?'on':'off'}\nIA: ${media.state().status?'paused':process.env.LOVABLE_API_KEY?'configured':'not configured'}`); },
  channel:async ctx => ctx.reply(ctx.config.channelUrl || 'Lyen chanèl la poko mete. Voye vrè lyen an bay pwopriyetè a.'),
  setchannel:async ctx => { if(!ctx.isOwner)return ctx.reply('Se sèlman pwopriyetè a.');if(!/^https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]+$/.test(input(ctx)))return ctx.reply('Bay yon lyen https://whatsapp.com/channel/... ki valab.');fs.mkdirSync(media.root(),{recursive:true});fs.writeFileSync(path.join(media.root(),'channel.json'),JSON.stringify({url:input(ctx)}));ctx.config.channelUrl=input(ctx);return ctx.reply('Lyen chanèl la anrejistre.'); },
  music:ctx=>asset(ctx,'audio'), photo:ctx=>asset(ctx,'image'),
  medialist:async ctx=>ctx.reply(media.library(ctx.sender).join('\n')||'Pa gen kreyasyon anrejistre.'),
  getmedia:async ctx=>{const name=input(ctx);if(!media.library(ctx.sender).includes(name))return ctx.reply('Chwazi yon fichye nan .medialist.');const type=name.endsWith('.mp3')?'audio':name.endsWith('.mp4')?'video':'image';return ctx.sock.sendMessage(ctx.jid,{[type]:fs.readFileSync(path.join(media.folder(ctx.sender),name)),...(type==='audio'?{mimetype:'audio/mpeg'}:{})},{quoted:ctx.m});},
  sticker:convert(['image','video'],['-t','6','-vf','scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000','-an','-c:v','libwebp'],'webp','sticker'),
  toimg:convert(['image','sticker'],['-frames:v','1'],'png','image'),
  toaudio:convert(['video','audio'],['-vn','-c:a','libmp3lame'],'mp3','audio'),
  bass:convert(['audio','video'],['-vn','-af','bass=g=10'],'mp3','audio'),
  nightcore:convert(['audio'],['-af','asetrate=48000*1.25,aresample=48000'],'mp3','audio'),
  slowaudio:convert(['audio'],['-af','atempo=0.8'],'mp3','audio'),
  fastaudio:convert(['audio'],['-af','atempo=1.25'],'mp3','audio'),
  reverseaudio:convert(['audio'],['-af','areverse'],'mp3','audio'),
  volume:convert(['audio'],['-af','volume=1.5'],'mp3','audio'),
  grayscale:convert(['image'],['-vf','hue=s=0','-frames:v','1'],'png','image'),
  flipimage:convert(['image'],['-vf','hflip','-frames:v','1'],'png','image'),
  rotateimage:convert(['image'],['-vf','transpose=1','-frames:v','1'],'png','image'),
  blurimage:convert(['image'],['-vf','boxblur=5:1','-frames:v','1'],'png','image'),
  mutevideo:convert(['video'],['-an','-c:v','libx264','-pix_fmt','yuv420p'],'mp4','video'),
  compressvideo:convert(['video'],['-vf','scale=640:-2','-c:v','libx264','-crf','30','-c:a','aac'],'mp4','video'),
  thumbnail:convert(['video'],['-frames:v','1'],'png','image'),
  sha256:tool('sha256',v=>crypto.createHash('sha256').update(v).digest('hex')),
  md5:tool('md5',v=>crypto.createHash('md5').update(v).digest('hex')),
  extractlinks:tool('extractlinks',v=>(v.match(/https?:\/\/[^\s]+/g)||[]).join('\n')||'Aucun lien.'),
  spoiler:tool('spoiler',v=>'||'+v+'||'),
  titlecase:tool('titlecase',v=>v.toLowerCase().replace(/(^|\s)\p{L}/gu,c=>c.toUpperCase())),
  kebabcase:tool('kebabcase',v=>v.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')),
  charfreq:tool('charfreq',v=>Object.entries([...v].reduce((a,c)=>(a[c]=(a[c]||0)+1,a),{})).map(([c,n])=>`${c}: ${n}`).join('\n')),
  lines:tool('lines',v=>String(v.split(/\n/).length)),
  sentences:tool('sentences',v=>String(v.split(/[.!?]+/).filter(s=>s.trim()).length)),
  removeemoji:tool('removeemoji',v=>v.replace(/\p{Extended_Pictographic}|\uFE0F|\u200D/gu,'').trim()||'Aucun texte.'),
  nato:tool('nato',v=>[...v.toUpperCase()].map(c=>({A:'Alpha',B:'Bravo',C:'Charlie',D:'Delta',E:'Echo',F:'Foxtrot',G:'Golf',H:'Hotel',I:'India',J:'Juliett',K:'Kilo',L:'Lima',M:'Mike',N:'November',O:'Oscar',P:'Papa',Q:'Quebec',R:'Romeo',S:'Sierra',T:'Tango',U:'Uniform',V:'Victor',W:'Whiskey',X:'X-ray',Y:'Yankee',Z:'Zulu'}[c]||c)).join(' ')),
  readingtime:tool('readingtime',v=>`${Math.max(1,Math.ceil(v.split(/\s+/).length/200))} min`)
};