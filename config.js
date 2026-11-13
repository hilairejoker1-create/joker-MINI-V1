const ownerNumber = (process.env.OWNER_NUMBER || '50955550066').replace(/\D/g, '');
let savedChannel = '';
try { savedChannel = JSON.parse(require('fs').readFileSync(require('path').join(process.env.DATA_DIR || __dirname,'data','media','channel.json'),'utf8')).url || ''; } catch {}

module.exports = {
  token: process.env.TELEGRAM_TOKEN,
  channelUrl: process.env.CHANNEL_URL || savedChannel || 'https://whatsapp.com/channel/0029VbDxbVnDTkK6xgnh7L1L',
  ownerNumber,
  prefix: process.env.BOT_PREFIX || '.',
  botName: 'Joker.md bot',
  version: '1.1.0',
  startTime: Date.now(),
  defaultLanguage: 'fr',
  // Les quotas ne concernent que les commandes coûteuses/populaires.
  dailyLimits: { media: 20, fun: 50 },
  autoReplyCooldownMs: 20000,
  greetingCooldownMs: 12000,
  reactStatus: false,
  autoReactChannels: {}
};
