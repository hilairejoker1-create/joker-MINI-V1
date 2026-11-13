const jokes = [
  "Poukisa òdinatè a te al wè doktè? Paske li te gen yon viris.",
  "Kisa yon sadik di lè l ap di orevwa? 'Rete byen mal.'",
  "Poukisa pwason pa jwe tenis? Paske yo pè filè a."
];
const truths = [
  "Ki pi gwo mantò ou janm di?",
  "Ki bagay ki fè w pè pi plis?",
  "Ki moun ou admire anpil an silans?"
];
const dares = [
  "Voye yon vwa mesaj w ap chante pou 10 segond.",
  "Ekri non w à l'anvè nan chat la.",
  "Voye yon foto drol de ou."
];
const compliments = [
  "Ou gen yon enèji ki enspire moun otou w! ✨",
  "Smile ou ka klere yon chanm antye! 😄",
  "Ou pi fò pase sa ou panse a! 💪"
];
const roasts = [
  "Ou gen plis potansyèl pase wifi vwazen w — men ou pa janm konekte.",
  "Si bon santiman te yon sijè lekòl, ou ta double."
];

module.exports = {
  joke: async ({ reply }) => reply('😂 ' + jokes[Math.floor(Math.random() * jokes.length)]),
  truth: async ({ reply }) => reply('🤔 ' + truths[Math.floor(Math.random() * truths.length)]),
  dare: async ({ reply }) => reply('🔥 ' + dares[Math.floor(Math.random() * dares.length)]),
  compliment: async ({ reply }) => reply('💖 ' + compliments[Math.floor(Math.random() * compliments.length)]),
  roast: async ({ reply }) => reply('🔥 ' + roasts[Math.floor(Math.random() * roasts.length)]),

  love: async ({ reply }) => reply('❤️ Nivo lanmou: ' + (Math.floor(Math.random() * 101)) + '%'),
  rate: async ({ reply, args }) => reply(`⭐ "${args.join(' ') || '...'}" : ${Math.floor(Math.random()*11)}/10`),
  ship: async ({ reply, m }) => {
    const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length < 2) return reply('❗ Mansyone 2 moun: .ship @yon @lòt');
    reply('💘 Konpatibilite: ' + Math.floor(Math.random() * 101) + '%');
  }
};
