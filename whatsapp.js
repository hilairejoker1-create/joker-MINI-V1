const {
  default: makeWASocket, useMultiFileAuthState, DisconnectReason,
  fetchLatestBaileysVersion, Browsers, downloadMediaMessage
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const handler = require('./handler');
const config = require('./config');
const groupstore = require('./groupstore');

const SESSIONS = path.join(process.env.DATA_DIR || __dirname, 'sessions');
const BANNER = path.join(__dirname, 'assets', 'banner.png');
const LOGO = path.join(__dirname, 'assets', 'logo.png');
const active = new Map();

function isOwnerJid(jid) {
  if (!config.ownerNumber) return false;
  return jid && jid.replace(/\D/g, '').startsWith(config.ownerNumber);
}

function logPairingCode(number, code) {
  const line = '='.repeat(44);
  console.log(`\n${line}\n🔑 CODE DE CONNEXION WHATSAPP : ${code}\n📱 Numéro : +${number}\n👉 WhatsApp > Appareils connectés > Connecter avec un numéro\n${line}\n`);
}

async function startSession(number, onCode, onStatus) {
  const dir = path.join(SESSIONS, number);
  const { state, saveCreds } = await useMultiFileAuthState(dir);
  const { version } = await fetchLatestBaileysVersion();
  let wasRegistered = fs.existsSync(path.join(dir, 'creds.json'));

  const sock = makeWASocket({
    version, auth: state, logger: pino({ level: 'silent' }),
    printQRInTerminal: false, browser: Browsers.ubuntu('Chrome'), syncFullHistory: false
  });
  active.set(number, sock);
  sock.ev.on('creds.update', saveCreds);

  if (!sock.authState.creds.registered && onCode) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(number);
        const pretty = code.match(/.{1,4}/g).join('-');
        logPairingCode(number, pretty);
        onCode(pretty);
      } catch (e) { onStatus && onStatus('❌ Erè pairage: ' + e.message); }
    }, 3000);
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      onStatus && onStatus('✅ WhatsApp konekte: ' + number);
      // Premye fwa konekte -> voye banner + menu nan pwòp chat moun nan (Mesaj a mwen menm)
      if (!wasRegistered) {
        try {
          const selfJid = number + '@s.whatsapp.net';
          await sock.sendMessage(selfJid, {
            image: fs.readFileSync(BANNER),
            caption: `👑 *BIENVENUE SUR ${config.botName.toUpperCase()} !*\n\n` +
              `✅ Ton WhatsApp est connecté avec succès.\n` +
              `🌐 Langues disponibles : Français, English et Kreyòl.\n` +
              `💬 Répondeur : ${config.prefix}repondre on/off\n` +
              `🌍 Langue : ${config.prefix}language fr/en/ht\n\n` +
              `📚 Tape ${config.prefix}menu pour découvrir les commandes.\n` +
              `> POWERED BY JOKER.MD`
          });
          wasRegistered = true;
        } catch (e) { console.error('banner:', e.message); }
      }
    }
    if (connection === 'close') {
      active.delete(number);
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut) {
        fs.rmSync(dir, { recursive: true, force: true });
        onStatus && onStatus('⚠️ Sesyon dekonekte: ' + number);
      } else {
        startSession(number, null, onStatus);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const m of messages) {
      if (!m.message) continue;
      const jid = m.key.remoteJid;

      if (jid === 'status@broadcast') {
        if (config.reactStatus && !m.key.fromMe) {
          try {
            await sock.readMessages([m.key]);
            await sock.sendMessage(jid, { react: { text: '💚', key: m.key } },
              { statusJidList: [m.key.participant] });
          } catch (e) { console.error('reactStatus:', e.message); }
        }
        continue;
      }

      const emoji = config.autoReactChannels[jid];
      if (emoji && !m.key.fromMe) {
        try { await sock.sendMessage(jid, { react: { text: emoji, key: m.key } }); } catch {}
      }

      try { await handler(sock, m, { isOwnerJid }); } catch (e) { console.error(e); }
    }
  });

  // WELCOME / GOODBYE pou gwoup, ak logo a
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    const settings = groupstore.get(id);
    try {
      const meta = await sock.groupMetadata(id);
      for (const p of participants) {
        const name = '@' + p.split('@')[0];
        if (action === 'add' && settings.welcome) {
          const now = new Date();
          const locale = ({fr:'fr-FR',en:'en-US',ht:'fr-FR'})[settings.language] || 'fr-FR';
          const date = new Intl.DateTimeFormat(locale, { weekday:'long', day:'2-digit', month:'long', year:'numeric' }).format(now);
          const time = new Intl.DateTimeFormat('fr-FR', { hour:'2-digit', minute:'2-digit', timeZone:'America/Port-au-Prince' }).format(now);
          const description = meta.desc || 'Aucune description disponible.';
          const welcomeTemplates = {
            fr: '🌟 {user} Tu viens d’intégrer le groupe qui fait buguer la NASA quand on parle en même temps ! 🌟\n\n📅 Arrivé le : {date} à {time}\n👥 Membres : {members}\n📌 Groupe : {group}\n📝 Description : {description}\n\n🌍 Bienvenue dans une communauté où l’amitié nous rassemble ! 🤝\n✨ Fais de nouvelles connaissances.\n🌎 Rencontre des personnes de différents pays.\n❤️ Partage, discute et crée de belles amitiés.\n😂 Humour, bonne humeur et respect au rendez-vous.\n\n📌 Respect obligatoire • Pas d’insultes ni de discrimination • Pas de spam.\n🌐 Peu importe ton pays, ta langue ou ta culture, ici tout le monde a sa place !\n\nMerci de lire les règles et de participer aux discussions !\n▬▬▬▬▬▬▬▬▬▬▬▬\n> POWERED BY JOKER.MD',
            en: '🌟 {user} Welcome to the group that makes NASA glitch when everyone talks at once! 🌟\n\n📅 Joined: {date} at {time}\n👥 Members: {members}\n📌 Group: {group}\n📝 Description: {description}\n\n🌍 Welcome to a community where friendship brings us together! 🤝\n✨ Make new friends.\n🌎 Meet people from different countries.\n❤️ Share, chat and build great friendships.\n😂 Good vibes, humor and respect are always welcome.\n\n📌 Respect everyone • No insults or discrimination • No spam.\n🌐 Whatever your country, language or culture, you belong here!\n\nPlease read the rules and join the conversation!\n▬▬▬▬▬▬▬▬▬▬▬▬\n> POWERED BY JOKER.MD',
            ht: '🌟 {user} Byenveni nan gwoup ki ka fè NASA sezi lè tout moun ap pale an menm tan! 🌟\n\n📅 Antre nan dat : {date} a {time}\n👥 Manm yo : {members}\n📌 Gwoup : {group}\n📝 Deskripsyon : {description}\n\n🌍 Byenveni nan yon kominote kote zanmitay ini nou! 🤝\n✨ Fè nouvo zanmi.\n🌎 Rankontre moun ki soti nan diferan peyi.\n❤️ Pataje, pale epi kreye bèl amitye.\n😂 Imè, bon anbyans ak respè toujou la.\n\n📌 Respekte tout moun • Pa gen jouman ni diskriminasyon • Pa fè spam.\n🌐 Kèlkeswa peyi w, lang ou oswa kilti w, ou gen plas ou isit la!\n\nTanpri li règ yo epi patisipe nan diskisyon yo!\n▬▬▬▬▬▬▬▬▬▬▬▬\n> POWERED BY JOKER.MD'
          };
          const txt = (settings.welcomeText || welcomeTemplates[settings.language] || welcomeTemplates.fr)
            .split('{user}').join(name).split('{group}').join(meta.subject)
            .split('{date}').join(date).split('{time}').join(time)
            .split('{members}').join(String(meta.participants.length))
            .split('{description}').join(description);
          await sock.sendMessage(id, { image: fs.readFileSync(LOGO), caption: txt, mentions: [p] });
        }
        if (action === 'remove' && settings.goodbye) {
          const goodbyeTemplates = {
            fr: '👋 Au revoir {user} ! Le groupe *{group}* te souhaite bonne continuation.',
            en: '👋 Goodbye {user}! *{group}* wishes you all the best.',
            ht: '👋 Orevwa {user} ! Gwoup *{group}* la swete w bon chans.'
          };
          const txt = (settings.goodbyeText || goodbyeTemplates[settings.language] || goodbyeTemplates.fr).replace('{user}', name).replace('{group}', meta.subject);
          await sock.sendMessage(id, { image: fs.readFileSync(LOGO), caption: txt, mentions: [p] });
        }
      }
    } catch (e) { console.error('welcome/goodbye:', e.message); }
  });

  return sock;
}

async function downloadViewOnce(sock, quotedMsg) {
  const buffer = await downloadMediaMessage(
    { message: quotedMsg }, 'buffer', {},
    { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage }
  );
  return buffer;
}

function listSessions() { return fs.existsSync(SESSIONS) ? fs.readdirSync(SESSIONS) : []; }
async function restoreAll() {
  for (const n of listSessions()) {
    if (fs.existsSync(path.join(SESSIONS, n, 'creds.json'))) await startSession(n);
  }
}
async function revokeSession(number) {
  const sock = active.get(number);
  try { if (sock) await sock.logout(); } catch {}
  active.delete(number);
  fs.rmSync(path.join(SESSIONS, number), { recursive: true, force: true });
}

module.exports = {
  startSession, logPairingCode, listSessions, restoreAll, revokeSession,
  downloadViewOnce, isOwnerJid, active, BANNER, LOGO
};
