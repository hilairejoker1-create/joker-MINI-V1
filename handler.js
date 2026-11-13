const fs = require('fs');
const path = require('path');
const config = require('./config');
const users = require('./userstore');
const groups = require('./groupstore');
const limits = require('./limitstore');
const media = require('./media');
const {withChannel, suggestions, channelSocket} = require('./reply-links');

const cmds = {};
for (const f of fs.readdirSync(path.join(__dirname, 'commands'))) {
  if (f.endsWith('.js')) Object.assign(cmds, require('./commands/' + f));
}
const lastAutoReply = new Map();
const lastGreeting = new Map();
const greetingReplies = {
  fr: {
    morning: ['Bonjour 😊 Que ta journée soit belle !','Salut ! Ravi de te voir ici ☀️','Bonjour à toi ! Comment vas-tu ?'],
    evening: ['Bonsoir 🌙 J’espère que tu passes une excellente soirée !','Bonsoir ! Bienvenue dans la discussion 😊'],
    hello: ['Salut 👋 Comment ça va ?','Coucou 😊 Heureux de te lire !','Hello ! Quoi de neuf ?'],
    thanks: ['Avec plaisir ! ❤️','Je t’en prie 😊','Toujours là pour aider !'],
    night: ['Bonne nuit 🌙 Fais de beaux rêves !','Dors bien et à bientôt ❤️'],
    how: ['Je vais très bien, merci ! Et toi ? 😊','Tout va bien ici ! Et de ton côté ?']
  },
  en: {
    morning: ['Good morning 😊 Have a wonderful day!','Hello! Great to see you here ☀️','Good morning! How are you?'],
    evening: ['Good evening 🌙 Hope you are having a lovely evening!','Good evening! Welcome to the conversation 😊'],
    hello: ['Hi 👋 How are you?','Hey 😊 Nice to hear from you!','Hello! What’s new?'],
    thanks: ['You’re welcome! ❤️','Anytime 😊','Always happy to help!'],
    night: ['Good night 🌙 Sweet dreams!','Sleep well and see you soon ❤️'],
    how: ['I’m doing great, thanks! How about you? 😊','All good here! And you?']
  },
  ht: {
    morning: ['Bonjou 😊 Mwen swete w pase yon bèl jounen!','Bonjou zanmi! Kijan ou ye jodi a? ☀️','Alo! Mwen kontan wè mesaj ou.'],
    evening: ['Bonswa 🌙 Mwen swete w pase yon bèl sware!','Bonswa zanmi! Byenveni nan diskisyon an 😊'],
    hello: ['Alooo 👋 Kijan ou ye?','Sak pase! Mwen kontan ou la 😊','Woy! Kisa k ap fèt?'],
    thanks: ['Pa gen pwoblèm! ❤️','Se plezi mwen 😊','Mwen la pou ede w!'],
    night: ['Bòn nuit 🌙 Fè bèl rèv!','Dòmi byen, n a wè pita ❤️'],
    how: ['Mwen anfòm, mèsi! E ou menm? 😊','Tout bagay anfòm bò isit la! Kijan sa ye lakay ou?']
  }
};
const generalReplies = {
  fr: ['Bien reçu 😊 Que puis-je faire pour toi ?','Je suis là ! Dis-m’en plus 💬','Merci pour ton message ! ✨','Intéressant 😊 Je t’écoute.'],
  en: ['Got it 😊 How can I help?','I’m here! Tell me more 💬','Thanks for your message! ✨','Interesting 😊 I’m listening.'],
  ht: ['Mwen resevwa mesaj ou 😊 Kijan m ka ede w?','Mwen la! Di m plis 💬','Mèsi pou mesaj ou! ✨','Sa enteresan 😊 M ap koute w.']
};
function getText(message={}) {
  return message.conversation || message.extendedTextMessage?.text ||
    message.imageMessage?.caption || message.videoMessage?.caption ||
    message.documentMessage?.caption || message.buttonsResponseMessage?.selectedButtonId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId || '';
}
const normJid=j=>(j||'').split('@')[0].split(':')[0];
function sameJid(a,b){return normJid(a)===normJid(b);}
async function isGroupAdmin(sock,jid,sender){
  if(!jid.endsWith('@g.us')) return false;
  try { const meta=await sock.groupMetadata(jid); return meta.participants.some(x=>x.admin&&(sameJid(x.id,sender)||sameJid(x.lid,sender))); }
  catch{return false;}
}
function pick(list){return list[Math.floor(Math.random()*list.length)];}
function detectGreeting(text) {
  const s=text.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim();
  if (/\b(bonne nuit|bon nuit|good night|bòn nuit|bonn nwi)\b/.test(s)) return 'night';
  if (/\b(bonsoir|bonswa|good evening|good night)\b/.test(s)) return 'evening';
  if (/\b(bonjour|bonjou|good morning|morning)\b/.test(s)) return 'morning';
  if (/\b(merci|mersi|thank you|thanks|thx)\b/.test(s)) return 'thanks';
  if (/\b(comment vas tu|comment ca va|ca va|how are you|kijan ou ye|sak pase|what's up)\b/.test(s)) return 'how';
  if (/^(salut|hello|hi|hey|coucou|alo|woy|yo|slt|bjr|bsr)(\s|$)/.test(s)) return 'hello';
  return null;
}

module.exports = async (sock, m, ctx = {}) => {
  if (!m?.message) return;
  const jid=m.key.remoteJid;
  if (!jid || jid === 'status@broadcast' || jid.endsWith('@newsletter')) return;
  const sender=m.key.participant || jid;
  const incoming = media.info(m.message);
  const text=getText(incoming?.message || m.message).trim();
  const isOwner=ctx.isOwnerJid ? ctx.isOwnerJid(sender) : false;
  const inGroup=jid.endsWith('@g.us');
  const groupSettings=inGroup ? groups.get(jid) : null;
  const userSettings=users.get(sender);
  const lang=inGroup ? (groupSettings.language||'fr') : (userSettings.language||config.defaultLanguage);
  const quoted=m.message.extendedTextMessage?.contextInfo?.quotedMessage || incoming?.node.contextInfo?.quotedMessage || null;
  const reply=t=>sock.sendMessage(jid,{text:withChannel(t,config,lang)},{quoted:m});
  const isCommand=text.startsWith(config.prefix);
  const parts=isCommand ? text.slice(config.prefix.length).trim().split(/\s+/) : [];
  const name=isCommand ? (parts.shift()||'').toLowerCase() : '';
  const args=parts;

  // Les commandes envoyées depuis le compte connecté fonctionnent aussi.
  if (isCommand && cmds[name]) {
    const admin=isOwner || await isGroupAdmin(sock,jid,sender);
    let bucket=null, limit=null;
    const funCommands=['joke','truth','dare','compliment','roast','love','rate','ship','roll','flip','choose','quote','fact','8ball','rps','slot','iq','lucky','hack','riddle','horoscope','dicex','wouldyou','neverhave','pickup','fortune','top','couple'];
    const mediaCommands=['vv','qr','shorturl','weather','wiki','define','translate','crypto','github','ipinfo'];
    if(funCommands.includes(name)){bucket='fun';limit=config.dailyLimits.fun;}
    if(mediaCommands.includes(name)){bucket='media';limit=config.dailyLimits.media;}
    if(bucket && !admin){
      const use=limits.consume(sender,bucket,limit);
      if(!use.ok) return reply(lang==='en' ? `⛔ Daily ${bucket} limit reached (${limit}). Try again tomorrow.` : lang==='ht' ? `⛔ Ou rive nan limit ${bucket} la (${limit}) pou jounen an. Eseye demen.` : `⛔ Tu as atteint la limite quotidienne (${limit}) pour ${bucket}. Réessaie demain.`);
    }
    try { await cmds[name]({sock:channelSocket(sock,config,lang),m,args,jid,sender,isOwner,isAdmin:admin,quoted,reply,config,cmds,text,lang,downloadMedia:ctx.downloadMedia}); }
    catch(e){ console.error('cmd '+name+':',e.message); await reply('❌ Erreur : '+e.message+(inGroup?'\nℹ️ Vérifie que le bot est admin du groupe.':'')); }
    return;
  }

  // Ne jamais répondre aux messages émis par le compte lui-même.
  if (isCommand) {
    const matches=Object.keys(cmds).filter(command=>command.startsWith(name.slice(0,2))).sort().slice(0,5);
    await reply(`*${lang==='ht'?'Kòmand pa jwenn':lang==='en'?'Unknown command':'Commande inconnue'}*\n${matches.map(command=>config.prefix+command).join('\n')}\n\n${suggestions(config,lang)}`);
    return;
  }
  if (m.key.fromMe) return;
  if (incoming && ['image','audio','video'].includes(incoming.type)) {
    const settings=inGroup ? groupSettings : userSettings;
    const enabled=incoming.type==='audio' ? settings.autoMusic!==false : settings.autoImages!==false;
    const key=jid+':'+sender+':'+incoming.type;
    if(enabled && Date.now()-(lastAutoReply.get(key)||0)>=config.autoReplyCooldownMs){
      lastAutoReply.set(key,Date.now());
      const replies={fr:{image:'Photo reçue. 📷',audio:'Audio reçu. 🎵',video:'Vidéo reçue. 🎬'},en:{image:'Photo received. 📷',audio:'Audio received. 🎵',video:'Video received. 🎬'},ht:{image:'Mwen resevwa foto a. 📷',audio:'Mwen resevwa mizik/od yo a. 🎵',video:'Mwen resevwa videyo a. 🎬'}};
      await reply((replies[lang]||replies.fr)[incoming.type]+'\n\n'+suggestions(config,lang,incoming.type));
    }
    return;
  }
  if (!text) return;
  const key=jid+':'+sender;
  const greeting=detectGreeting(text);
  const greetingsEnabled=inGroup ? groupSettings.autoGreetings !== false : userSettings.autoGreetings !== false;
  if(greeting && greetingsEnabled){
    const now=Date.now(), previous=lastGreeting.get(key)||0;
    if(now-previous>=config.greetingCooldownMs){
      lastGreeting.set(key,now);
      const pool=(greetingReplies[lang]||greetingReplies.fr)[greeting];
      await reply(pick(pool)+'\n\n'+suggestions(config,lang));
      return;
    }
  }
  const enabled=inGroup ? groupSettings.autoReply : userSettings.autoReply;
  if(enabled){
    const now=Date.now(), previous=lastAutoReply.get(key)||0;
    if(now-previous>=config.autoReplyCooldownMs){
      lastAutoReply.set(key,now);
      await reply(pick(generalReplies[lang]||generalReplies.fr)+'\n\n'+suggestions(config,lang));
    }
  }
};
