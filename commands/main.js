const fs = require('fs');
const path = require('path');
const {suggestions} = require('../reply-links');
const MUSIC_DIR = path.join(__dirname, '..', 'assets', 'music');
const BANNER = path.join(__dirname, '..', 'assets', 'banner.png');
function pickRandomMusic(){
  if(!fs.existsSync(MUSIC_DIR)) return null;
  const files=fs.readdirSync(MUSIC_DIR).filter(f=>/\.(m4a|mp3|ogg)$/i.test(f));
  return files.length?path.join(MUSIC_DIR,files[Math.floor(Math.random()*files.length)]):null;
}
function fmt(ms){const s=Math.floor(ms/1000);return `${Math.floor(s/86400)}j ${Math.floor(s/3600)%24}h ${Math.floor(s/60)%60}m ${s%60}s`;}
const labels={
 fr:{sub:'✨ *VERSION 1.1 — ÉDITION DE LANCEMENT*',main:'🏠 PRINCIPAL',tools:'🛠️ OUTILS',group:'👥 GROUPES',fun:'🎭 DIVERTISSEMENT',settings:'⚙️ RÉGLAGES',security:'🛡️ AUTOMATISATION',info:'ℹ️ INFORMATIONS',footer:'> 𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀 𝑱𝑶𝑲𝑬𝑹.𝑴𝑫'},
 en:{sub:'✨ *VERSION 1.1 — LAUNCH EDITION*',main:'🏠 MAIN',tools:'🛠️ TOOLS',group:'👥 GROUPS',fun:'🎭 FUN',settings:'⚙️ SETTINGS',security:'🛡️ AUTOMATION',info:'ℹ️ INFORMATION',footer:'> 𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀 𝑱𝑶𝑲𝑬𝑹.𝑴𝑫'},
 ht:{sub:'✨ *VÈSYON 1.1 — PREMYE EDISYON*',main:'🏠 PRENSIPAL',tools:'🛠️ ZOUTI',group:'👥 GWOUP',fun:'🎭 DIVÈTISMAN',settings:'⚙️ PARAMÈT',security:'🛡️ OTOMATIZASYON',info:'ℹ️ ENFÒMASYON',footer:'> 𝑷𝑶𝑾𝑬𝑹𝑬𝑫 𝑩𝒀 𝑱𝑶𝑲𝑬𝑹.𝑴𝑫'}
};
async function sendMenu({sock,jid,m,config,cmds,lang='fr'}){
  const t=labels[lang]||labels.fr;
  const names=Object.keys(cmds).sort();
  const categories=[
    ['MÉDIAS',['imagine','compose','aivideo','photo','music','sticker','toimg','toaudio','bass','nightcore','slowaudio','fastaudio','reverseaudio','volume','grayscale','flipimage','rotateimage','blurimage','mutevideo','compressvideo','thumbnail','medialist','getmedia']],
    ['MÉDIAS / RÉGLAGES',['autoimage','automusic','mediastatus','channel','setchannel']],
    [t.main,['menu','system','help','ping','alive','runtime','version','owner','setprefix']],
    [t.group,['tagall','hidetag','members','tagadmin','poll','warn','unwarn','warnings','gdesc','delete','kick','promote','demote','open','close','link','revoke','admins','groupinfo','setgname','setdesc','welcome','goodbye','setwelcome','setgoodbye']],
    [t.security,['repondre','respond','language','langue','salutations','reactstatus','reagcht','reagchtoff','vv']],
    [t.fun,['joke','truth','dare','compliment','roast','love','rate','ship','roll','flip','choose','quote','fact','8ball','rps','slot','iq','lucky','hack','password','riddle','motivation','horoscope','dicex','wouldyou','neverhave','pickup','fortune','yesno','emoji','color','nickname','top','couple']],
    [t.tools,['calc','qr','shorturl','fancy','cm2in','in2cm','m2ft','ft2m','l2gal','gal2l','kmh2ms','ms2kmh','deg2rad','rad2deg']],
    [t.info,['jid','cid','chatid','id','cpu','ram','health','stats','uptime','myinfo','botinfo','time','date','day','timezone','countdown','year','week']],
    ['✍️ TEXTE',['reverse','upper','lower','capitalize','count','wordcount','repeat','mock','clap','bold','italic','mono','bubble','square','strike','upsidedown','leet','morse','unmorse','binary','unbinary','base64','unbase64','hex','unhex','urlencode','urldecode','rot13','slug','palindrome','trimtext','noaccents','initials','camelcase','snakecase','sortwords','uniquewords','wordfreq','extractnumbers','extractemails']],
    ['🧮 MATHS',['sqrt','pow','percent','avg','sum','max','min','random','isprime','factorial','fibo','gcd','lcm','roman','unroman','temp','km2mi','mi2km','kg2lb','lb2kg','bmi','age','tip','median','range','product','variance','stddev','cbrt','hypot','log10','primefactors','fraction']],
    ['🌐 WEB',['weather','wiki','define','translate','crypto','github','ipinfo','advice']]
  ];
  const used=new Set();
  const sections=categories.map(([title,items])=>{
    const found=items.filter(x=>cmds[x]).sort(); found.forEach(x=>used.add(x));
    const label=title.replace(/^[^\p{L}\p{N}]+/u,'');
    return found.length?`*${label}*\n────────────\n${found.map(x=>`${config.prefix}${x}`).join('\n\n')}` : '';
  }).filter(Boolean);
  const other=names.filter(x=>!used.has(x));
  if(other.length) sections.push(`*AUTRES / OTHER*\n────────────\n${other.map(x=>`${config.prefix}${x}`).join('\n\n')}`);
  const heading=`*JOKER.MD BOT*\n────────────────────\nVersion : ${config.version}\nOwner : +${config.ownerNumber}\nPréfixe : ${config.prefix}\nLangues : Français / English / Kreyòl\nCommandes actives : ${names.length}${config.channelUrl?'\nChaîne : '+config.channelUrl:''}\n────────────────────`;
  const menu=heading+'\n\n'+suggestions(config,lang)+'\n\n'+sections.join('\n\n')+'\n\n'+
    `*QUOTAS MEMBRES*\nDivertissement : 50 utilisations / jour\nMédias/outils coûteux : 20 utilisations / jour\nLecture et réactions aux statuts : sans limite\nCommandes normales : sans limite\nPropriétaire et admins du groupe : exemptés\n\n_Joker.md bot_`;
  if(fs.existsSync(BANNER)) await sock.sendMessage(jid,{image:fs.readFileSync(BANNER),caption:heading},{quoted:m});
  await sock.sendMessage(jid,{text:menu},{quoted:m});

  // Pack média du menu : galerie des photos fournies + courte vidéo de présentation.
  const GALLERY = path.join(__dirname, '..', 'assets', 'menu-gallery.jpg');
  const MENU_VIDEO = path.join(__dirname, '..', 'assets', 'menu-video.mp4');
  if (fs.existsSync(GALLERY)) {
    await sock.sendMessage(jid, {
      image: fs.readFileSync(GALLERY),
      caption: lang === 'en' ? '🖼️ *JOKER.MD BOT — PHOTO GALLERY*' :
        lang === 'ht' ? '🖼️ *JOKER.MD BOT — GALRI FOTO*' :
          '🖼️ *JOKER.MD BOT — GALERIE PHOTOS*'
    }, { quoted: m });
  }
  if (fs.existsSync(MENU_VIDEO)) {
    await sock.sendMessage(jid, {
      video: fs.readFileSync(MENU_VIDEO),
      caption: lang === 'en' ? '🎬 *Joker.md bot — presentation*' :
        lang === 'ht' ? '🎬 *Joker.md bot — prezantasyon*' :
          '🎬 *Présentation de Joker.md bot*'
    }, { quoted: m });
  }

  const music=pickRandomMusic();
  if(music){
    const ext=path.extname(music).toLowerCase();
    const mimetype=ext==='.mp3'?'audio/mpeg':ext==='.ogg'?'audio/ogg':'audio/mp4';
    try{await sock.sendMessage(jid,{audio:fs.readFileSync(music),mimetype,ptt:false},{quoted:m});}
    catch(e){console.error('menu-music:',e.message);}
  }
}
module.exports={
  ping:async({reply})=>reply('🏓 Pong !'),
  alive:async({reply,config})=>reply(`✨ ${config.botName} est en ligne !`),
  runtime:async({reply,config})=>reply('⏱ Runtime : '+fmt(Date.now()-config.startTime)),
  setprefix:async({reply,args,config,isOwner})=>{if(!isOwner)return reply('❌ Commande réservée au propriétaire.');if(!args[0]||args[0].length>3)return reply('Exemple : .setprefix !');config.prefix=args[0];return reply('✅ Nouveau préfixe : '+args[0]);},
  menu:sendMenu,system:sendMenu,help:sendMenu
};
