const { launchTelegram } = require('./telegram');
const fs = require('fs');
const path = require('path');
const { restoreAll, startSession } = require('./whatsapp');
const { launchSite } = require('./site');

(async () => {
  await launchTelegram();
  await restoreAll();
  // Premier démarrage : afficher le code de connexion du propriétaire dans les logs Railway.
  const config = require('./config');
  const owner = config.ownerNumber;
  const creds = path.join(process.env.DATA_DIR || __dirname, 'sessions', owner, 'creds.json');
  if (!fs.existsSync(creds)) {
    console.log('⏳ Génération du code de connexion WhatsApp pour +' + owner + '...');
    startSession(owner, () => {}, s => console.log(s)).catch(e => console.error('pairage:', e.message));
  } else console.log('✅ Session WhatsApp déjà enregistrée pour +' + owner);
  launchSite();
  console.log('✅ Joker.md bot V1.1 demaré nèt: Telegram + WhatsApp + Sit web');
})();

process.on('uncaughtException', e => console.error('Erè:', e));
process.on('unhandledRejection', e => console.error('Rejè:', e));
