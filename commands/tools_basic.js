const quotes = [
  "Siksè se rezilta efò ki repete chak jou.",
  "Aucun rêve n’est trop grand pour celui qui est prêt à travailler.",
  "Chak echèk se yon leson, pa yon fen.",
  "Pasyans se kle a pou tout bon rezilta."
];
const facts = [
  "Yon jou sou Venis pi long pase yon ane sou Venis.",
  "Myèl ka rekonèt figi moun.",
  "Kè yon baleine ka gwosè yon machin.",
  "Bannann se yon bè, pa yon fwi."
];

module.exports = {
  calc: async ({ reply, args }) => {
    const expr = args.join('');
    if (!/^[0-9+\-*/.() ]+$/.test(expr)) return reply('❗ Utilise uniquement des chiffres et les opérateurs + - * / ( ).');
    try { reply('🧮 ' + Function('"use strict";return (' + expr + ')')()); }
    catch { reply('❌ Opération invalide.'); }
  },

  roll: async ({ reply }) => reply('🎲 ' + (Math.floor(Math.random() * 6) + 1)),

  flip: async ({ reply }) => reply(Math.random() < 0.5 ? '🪙 Pile' : '🪙 Face'),

  choose: async ({ reply, args, text, config }) => {
    const opts = text.slice(config.prefix.length + 7).split(',').map(s => s.trim()).filter(Boolean);
    if (opts.length < 2) return reply('❗ Exemple : .choose pizza, sushi, griyo');
    reply('👉 ' + opts[Math.floor(Math.random() * opts.length)]);
  },

  quote: async ({ reply }) => reply('💬 ' + quotes[Math.floor(Math.random() * quotes.length)]),
  fact: async ({ reply }) => reply('📌 ' + facts[Math.floor(Math.random() * facts.length)]),

  qr: async ({ sock, jid, reply, m, args, text, config }) => {
    const data = text.slice(config.prefix.length + 3).trim();
    if (!data) return reply('❗ Exemple : .qr https://sitwèb.com');
    const url = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(data);
    await sock.sendMessage(jid, { image: { url }, caption: '✅ QR Code' }, { quoted: m });
  },

  shorturl: async ({ reply, args }) => {
    if (!args[0]) return reply('❗ Exemple : .shorturl https://sitwèb.com');
    try {
      const res = await fetch('https://is.gd/create.php?format=simple&url=' + encodeURIComponent(args[0]));
      reply('🔗 ' + await res.text());
    } catch { reply('❌ Pa kapab kout URL la.'); }
  }
};
