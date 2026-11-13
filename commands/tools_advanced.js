// Chargement différé : évite la dépendance circulaire whatsapp → handler → commands
const downloadViewOnce = (...a) => require('../whatsapp').downloadViewOnce(...a);

module.exports = {
  // .vv -> reponn (reply) sou yon foto/videyo "view once" pou l anvwaye'l san limit
  vv: async ({ sock, jid, reply, quoted, m, isOwner, config }) => {
    if (!quoted) return reply('❗ Reponn (reply) sou foto/videyo "vue unique" la ak .vv');
    const type = quoted.imageMessage ? 'image' : quoted.videoMessage ? 'video' : null;
    if (!type) return reply('❗ Mesaj ou reponn lan pa yon foto/videyo vue unique.');
    try {
      const buffer = await downloadViewOnce(sock, quoted);
      await sock.sendMessage(jid, type === 'image'
        ? { image: buffer, caption: isOwner ? '✅ (Owner - san limit)' : '✅' }
        : { video: buffer, caption: isOwner ? '✅ (Owner - san limit)' : '✅' }
      );
    } catch (e) {
      reply('❌ Erè pandan .vv: ' + e.message);
    }
  },

  // .reagcht <lien oswa jid chanèl> <emoji>  — SÈLMAN admin/owner bot la ka itilize l
  reagcht: async ({ reply, args, isOwner, config, sender }) => {
    if (!isOwner) return reply('❌ Sèl Owner/Admin bot la ka itilize .reagcht');
    if (args.length < 2) return reply('❗ Exemple : .reagcht 123456789@newsletter 🔥');
    const [channelJid, emoji] = args;
    config.autoReactChannels[channelJid] = emoji;
    reply(`✅ Bot la pral reyaji ak ${emoji} sou chak nouvo pòs nan ${channelJid}.\n` +
          `ℹ️ Nòt: yon sèl kont = yon sèl reyaksyon pa pòs (WhatsApp travay konsa). Pa gen mwayen "fo" anpil reyaksyon ak yon sèl bot san kreye plizyè fo kont — sa Joker.md bot p ap fè paske sa ka fè kont lan banni.`);
  },

  reagchtoff: async ({ reply, args, isOwner, config }) => {
    if (!isOwner) return reply('❌ Sèl Owner/Admin bot la ka itilize .reagchtoff');
    const channelJid = args[0];
    if (!channelJid) return reply('❗ Exemple : .reagchtoff 123456789@newsletter');
    delete config.autoReactChannels[channelJid];
    reply('🛑 Auto-react retire pou: ' + channelJid);
  },

  // .reactstatus on/off — li ak reyaji otomatikman sou estati moun
  reactstatus: async ({ reply, args, isOwner, config }) => {
    if (!isOwner) return reply('❌ Sèl Owner bot la ka chanje sa.');
    if (!['on', 'off'].includes(args[0])) return reply('Exemple : .reactstatus on');
    config.reactStatus = args[0] === 'on';
    reply('✅ Lekti/reyaksyon otomatik sou estati: ' + (config.reactStatus ? 'ON' : 'OFF'));
  }
};
