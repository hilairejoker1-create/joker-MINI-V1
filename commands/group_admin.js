const groupstore = require('../groupstore');

function isGroup(jid) { return jid.endsWith('@g.us'); }

const norm = j => (j || '').split('@')[0].split(':')[0];
async function requireAdmin(sock, jid, sender, reply) {
  if (!isGroup(jid)) { reply('❗ Kòmand sa a sèlman mache nan yon gwoup.'); return false; }
  const owner = (require('../config').ownerNumber || '').replace(/\D/g, '');
  if (owner && norm(sender).startsWith(owner)) return true;
  const meta = await sock.groupMetadata(jid);
  const ok = meta.participants.some(p => p.admin && (norm(p.id) === norm(sender) || norm(p.lid) === norm(sender)));
  if (!ok) { reply('❌ Seuls les administrateurs du groupe peuvent utiliser cette commande.'); return false; }
  return true;
}

module.exports = {
  tagall: async ({ sock, jid, reply, sender }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const meta = await sock.groupMetadata(jid);
    const txt = meta.participants.map(p => '@' + p.id.split('@')[0]).join(' ');
    await sock.sendMessage(jid, { text: '📢 ' + txt, mentions: meta.participants.map(p => p.id) });
  },

  hidetag: async ({ sock, jid, reply, sender, text, config }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const meta = await sock.groupMetadata(jid);
    const msg = text.slice(config.prefix.length + 8).trim() || '📢';
    await sock.sendMessage(jid, { text: msg, mentions: meta.participants.map(p => p.id) });
  },

  kick: async ({ sock, jid, reply, sender, m }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) return reply('❗ Mentionne (@) la personne à retirer.');
    await sock.groupParticipantsUpdate(jid, [target], 'remove');
    reply('✅ Retire.');
  },

  promote: async ({ sock, jid, reply, sender, m }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) return reply('❗ Mentionne (@) la personne à promouvoir.');
    await sock.groupParticipantsUpdate(jid, [target], 'promote');
    reply('✅ Fèt admin.');
  },

  demote: async ({ sock, jid, reply, sender, m }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!target) return reply('❗ Mentionne (@) la personne à rétrograder.');
    await sock.groupParticipantsUpdate(jid, [target], 'demote');
    reply('✅ Admin retire.');
  },

  open: async ({ sock, jid, reply, sender }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    await sock.groupSettingUpdate(jid, 'not_announcement');
    reply('🔓 Gwoup la louvri — tout moun ka ekri.');
  },

  close: async ({ sock, jid, reply, sender }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    await sock.groupSettingUpdate(jid, 'announcement');
    reply('🔒 Gwoup la fèmen — sèlman admin ka ekri.');
  },

  link: async ({ sock, jid, reply, sender }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const code = await sock.groupInviteCode(jid);
    reply('🔗 https://chat.whatsapp.com/' + code);
  },

  revoke: async ({ sock, jid, reply, sender }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    await sock.groupRevokeInvite(jid);
    reply('✅ Ansyen lyen anile, nouvo lyen kreye.');
  },

  groupinfo: async ({ sock, jid, reply }) => {
    if (!isGroup(jid)) return reply('❗ Cette commande fonctionne uniquement dans un groupe.');
    const meta = await sock.groupMetadata(jid);
    reply(`📌 *${meta.subject}*\n👥 ${meta.participants.length} manm\n🆔 ${meta.id}\n📝 ${meta.desc || '—'}`);
  },

  admins: async ({ sock, jid, reply }) => {
    if (!isGroup(jid)) return reply('❗ Cette commande fonctionne uniquement dans un groupe.');
    const meta = await sock.groupMetadata(jid);
    const list = meta.participants.filter(p => p.admin).map(p => '• @' + p.id.split('@')[0]).join('\n');
    await sock.sendMessage(jid, { text: '👑 Admin yo:\n' + list,
      mentions: meta.participants.filter(p => p.admin).map(p => p.id) });
  },

  setgname: async ({ sock, jid, reply, sender, text, config }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const name = text.slice(config.prefix.length + 9).trim();
    if (!name) return reply('❗ Exemple : .setgname Nouvo Non');
    await sock.groupUpdateSubject(jid, name);
    reply('✅ Non gwoup chanje.');
  },

  setdesc: async ({ sock, jid, reply, sender, text, config }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const desc = text.slice(config.prefix.length + 8).trim();
    await sock.groupUpdateDescription(jid, desc);
    reply('✅ Deskripsyon gwoup chanje.');
  },

  // welcome / goodbye sont enregistrées uniquement dans settings.js.
  setwelcome: async ({ sock, jid, reply, sender, text, config }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const t = text.slice(config.prefix.length + 11).trim();
    if (!t) return reply('❗ Exemple : .setwelcome Byenveni {user} nan {group}!');
    groupstore.set(jid, { welcomeText: t });
    reply('✅ Mesaj welcome anrejistre.');
  },
  setgoodbye: async ({ sock, jid, reply, sender, text, config }) => {
    if (!(await requireAdmin(sock, jid, sender, reply))) return;
    const t = text.slice(config.prefix.length + 11).trim();
    if (!t) return reply('❗ Exemple : .setgoodbye Orevwa {user}!');
    groupstore.set(jid, { goodbyeText: t });
    reply('✅ Mesaj goodbye anrejistre.');
  }
};
