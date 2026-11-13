const os = require('os');

function fmtUptime(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 3600)}h ${Math.floor(s / 60) % 60}m ${s % 60}s`;
}

module.exports = {
  version: async ({ reply, config }) => reply('📦 ' + config.botName + ' — v' + config.version),

  owner: async ({ reply, config }) => reply(
    config.ownerNumber
      ? '👑 Propriétaire : +' + config.ownerNumber
      : '⚠️ Pa gen OWNER_NUMBER mete nan Secrets.'
  ),

  jid: async ({ reply, jid }) => reply('🆔 ' + jid),
  cid: async ({ reply, jid }) => reply('🆔 ' + jid),
  chatid: async ({ reply, jid }) => reply('🆔 ' + jid),
  id: async ({ reply, sender }) => reply('🆔 ' + sender),

  cpu: async ({ reply }) => {
    const load = os.loadavg()[0].toFixed(2);
    reply(`🖥️ CPU: ${os.cpus().length} core(s)\n📊 Charge: ${load}`);
  },
  ram: async ({ reply }) => {
    const total = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const free = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
    reply(`🧠 RAM: ${(total - free).toFixed(2)}GB / ${total}GB`);
  },
  health: async ({ reply, config }) => reply(
    `✅ ${config.botName}\n⏱ Uptime: ${fmtUptime(Date.now() - config.startTime)}\n🟢 Status: OK`
  ),
  stats: async ({ reply, config, cmds }) => reply(
    `📊 Kòmand aktif: ${Object.keys(cmds).length}\n⏱ Uptime: ${fmtUptime(Date.now() - config.startTime)}`
  ),

  fancy: async ({ reply, args }) => {
    const map = { a:'ᴀ',b:'ʙ',c:'ᴄ',d:'ᴅ',e:'ᴇ',f:'ꜰ',g:'ɢ',h:'ʜ',i:'ɪ',j:'ᴊ',k:'ᴋ',l:'ʟ',m:'ᴍ',
      n:'ɴ',o:'ᴏ',p:'ᴘ',q:'ǫ',r:'ʀ',s:'s',t:'ᴛ',u:'ᴜ',v:'ᴠ',w:'ᴡ',x:'x',y:'ʏ',z:'ᴢ' };
    const out = args.join(' ').toLowerCase().split('').map(c => map[c] || c).join('');
    reply(out || '❗ Exemple : .fancy Joker Dev');
  }
};
