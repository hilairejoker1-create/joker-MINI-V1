const users = require('../userstore');
const groups = require('../groupstore');

module.exports = {
  repondre: async ({jid,sender,args,reply,isOwner,isAdmin}) => {
    const value=(args[0]||'').toLowerCase();
    if(!['on','off'].includes(value)) return reply('💬 *Répondeur automatique*\n.repondre on — répondre automatiquement aux messages\n.repondre off — arrêter le répondeur\n\nDans un groupe, seuls les admins peuvent modifier ce réglage.');
    if(jid.endsWith('@g.us')) {
      if(!isOwner&&!isAdmin) return reply('❌ Seuls les administrateurs du groupe peuvent modifier ce réglage.');
      groups.set(jid,{autoReply:value==='on'});
    } else users.set(sender,{autoReply:value==='on'});
    return reply(value==='on'?'✅ Répondeur automatique activé.':'🛑 Répondeur automatique désactivé.');
  },
  respond: async ctx => module.exports.repondre(ctx),
  language: async ({jid,sender,args,reply,isOwner,isAdmin}) => {
    const l=(args[0]||'').toLowerCase();
    const names={fr:'Français 🇫🇷',en:'English 🇬🇧',ht:'Kreyòl ayisyen 🇭🇹'};
    if(!names[l]) return reply('🌐 Choisis une langue :\n.language fr\n.language en\n.language ht');
    if(jid.endsWith('@g.us')) {
      if(!isOwner&&!isAdmin) return reply('❌ Seuls les admins peuvent changer la langue du groupe.');
      groups.set(jid,{language:l});
    } else users.set(sender,{language:l});
    return reply('✅ Langue définie : '+names[l]);
  },
  langue: async ctx => module.exports.language(ctx),
  salutations: async ({jid,sender,args,reply,isOwner,isAdmin}) => {
    const value=(args[0]||'').toLowerCase();
    if(!['on','off'].includes(value)) return reply('👋 Exemple : .salutations on ou .salutations off');
    if(jid.endsWith('@g.us')) {
      if(!isOwner&&!isAdmin) return reply('❌ Seuls les admins du groupe peuvent modifier les salutations.');
      groups.set(jid,{autoGreetings:value==='on'});
    } else users.set(sender,{autoGreetings:value==='on'});
    return reply(value==='on'?'✅ Réponses aux salutations activées.':'🛑 Réponses aux salutations désactivées.');
  },
  welcome: async ({jid,args,reply,isOwner,isAdmin}) => {
    if(!jid.endsWith('@g.us')) return reply('❗ Cette commande fonctionne dans un groupe.');
    if(!isOwner&&!isAdmin) return reply('❌ Réservé aux admins du groupe.');
    if(!['on','off'].includes((args[0]||'').toLowerCase())) return reply('Exemple : .welcome on ou .welcome off');
    groups.set(jid,{welcome:args[0].toLowerCase()==='on'});
    return reply('✅ Message de bienvenue : '+args[0].toUpperCase());
  },
  goodbye: async ({jid,args,reply,isOwner,isAdmin}) => {
    if(!jid.endsWith('@g.us')) return reply('❗ Cette commande fonctionne dans un groupe.');
    if(!isOwner&&!isAdmin) return reply('❌ Réservé aux admins du groupe.');
    if(!['on','off'].includes((args[0]||'').toLowerCase())) return reply('Exemple : .goodbye on ou .goodbye off');
    groups.set(jid,{goodbye:args[0].toLowerCase()==='on'});
    return reply('✅ Message de départ : '+args[0].toUpperCase());
  }
};
