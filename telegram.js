const { Telegraf } = require('telegraf');
const config = require('./config');
const { startSession, listSessions, revokeSession } = require('./whatsapp');

const bot = new Telegraf(config.token);

bot.start(ctx => ctx.reply(
  `👋 Bienvenue sur ${config.botName}\n\n` +
  `/pair 22501234567 → connecter ton WhatsApp (numéro avec indicatif, sans +)\n` +
  `/listpair → voir les sessions\n` +
  `/revokepair 22501234567 → supprimer une session`
));

bot.command('pair', async ctx => {
  const num = (ctx.message.text.split(' ')[1] || '').replace(/\D/g, '');
  if (num.length < 8) return ctx.reply('❌ Exemple : /pair 22501234567');
  await ctx.reply('⏳ Génération du code...');
  startSession(
    num,
    code => ctx.reply(
      `🔑 Ton code : <code>${code}</code>\n\n` +
      `WhatsApp → Appareils connectés → Connecter un appareil → ` +
      `Connecter avec le numéro de téléphone → saisis le code.`,
      { parse_mode: 'HTML' }
    ),
    msg => ctx.reply(msg)
  );
});

bot.command('listpair', ctx => {
  const l = listSessions();
  ctx.reply(l.length ? '📱 Sessions :\n' + l.map(n => '• ' + n).join('\n') : 'Aucune session.');
});

bot.command('revokepair', async ctx => {
  const num = (ctx.message.text.split(' ')[1] || '').replace(/\D/g, '');
  if (!num) return ctx.reply('❌ Exemple : /revokepair 22501234567');
  await revokeSession(num);
  ctx.reply('🗑️ Session supprimée : ' + num);
});

async function launchTelegram() {
  if (!config.token) { console.warn('⚠️ TELEGRAM_TOKEN absent : Telegram désactivé, WhatsApp et le site restent disponibles.'); return; }
  bot.launch();
  console.log('✅ Bot Telegram lancé');
}

module.exports = { launchTelegram };
