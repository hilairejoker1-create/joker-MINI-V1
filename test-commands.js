// Test automatique : charge toutes les commandes et exécute chacune avec un faux WhatsApp.
process.env.DATA_DIR = require('fs').mkdtempSync(require('path').join(require('os').tmpdir(), 'joker-'));
const handler = require('./handler');
const fs = require('fs'), path = require('path');
const cmds = {};
for (const f of fs.readdirSync(path.join(__dirname, 'commands'))) if (f.endsWith('.js')) Object.assign(cmds, require('./commands/' + f));
const sample = { reverse:'abc', upper:'abc', lower:'ABC', capitalize:'joker md', count:'abc', wordcount:'a b', repeat:'2 hi', mock:'hello', clap:'a b', bold:'Joker', italic:'Joker', mono:'Joker', bubble:'Joker', square:'Joker', strike:'ab', upsidedown:'hello', leet:'joker', morse:'sos', unmorse:'... --- ...', binary:'hi', unbinary:'01101000 01101001', base64:'hi', unbase64:'aGk=', hex:'hi', unhex:'6869', urlencode:'a b', urldecode:'a%20b', rot13:'Hello', slug:'Mon Titre', palindrome:'kayak', sqrt:'16', pow:'2 10', percent:'15 200', avg:'10 20', sum:'1 2 3', max:'4 9', min:'4 9', random:'1 6', isprime:'17', factorial:'5', fibo:'8', gcd:'12 18', lcm:'4 6', roman:'2026', unroman:'MMXXVI', temp:'30 c', km2mi:'10', mi2km:'10', kg2lb:'70', lb2kg:'150', bmi:'70 175', age:'2000-05-21', tip:'1000 15 4', countdown:'2030-01-01', day:'2026-12-25', '8ball':'oui ?', rps:'pierre', horoscope:'lion', dicex:'3d6', calc:'2+2*3', choose:'a, b', fancy:'joker', rate:'pizza', language:'fr', repondre:'on', salutations:'on', weather:'Paris', wiki:'Haïti', define:'happy', translate:'en Bonjour', crypto:'bitcoin', github:'torvalds', ipinfo:'8.8.8.8', poll:'Q | A | B' };
const expect = { reverse:'cba', upper:'ABC', unmorse:'sos', unbinary:'hi', unbase64:'hi', unhex:'hi', rot13:'Uryyb', slug:'mon-titre', sqrt:'√ 4', roman:'🏛️ MMXXVI', unroman:'🔢 2026', gcd:'PGCD : 6', lcm:'PPCM : 12', factorial:'5! = 120', calc:'🧮 8', urldecode:'a b' };
Object.assign(sample, {
  trimtext:'un texte', noaccents:'école', initials:'Joker Md Bot', camelcase:'Joker Md Bot', snakecase:'Joker Md Bot',
  sortwords:'zèbre chat abeille', uniquewords:'chat chat chien', wordfreq:'chat chat chien', extractnumbers:'Prix 12.50 et 20', extractemails:'nom@example.com',
  median:'1 9 3', range:'2 9 4', product:'2 3 4', variance:'2 4 6', stddev:'2 4 6', cbrt:'27', hypot:'3 4', log10:'100', primefactors:'60', fraction:'12 18',
  cm2in:'2.54', in2cm:'1', m2ft:'0.3048', ft2m:'1', l2gal:'3.785411784', gal2l:'1', kmh2ms:'36', ms2kmh:'10', deg2rad:'180', rad2deg:String(Math.PI)
});
Object.assign(expect, {
  trimtext:'un texte', noaccents:'ecole', initials:'JMB', camelcase:'jokerMdBot', snakecase:'joker_md_bot',
  sortwords:'abeille chat zèbre', uniquewords:'chat chien', wordfreq:'chat : 2', extractnumbers:'12.50, 20', extractemails:'nom@example.com',
  median:'3', range:'7', product:'24', variance:'2.666667', stddev:'1.632993', cbrt:'3', hypot:'5', log10:'2', primefactors:'2 × 2 × 3 × 5', fraction:'2/3',
  cm2in:'2.54 cm = 1 in', in2cm:'1 in = 2.54 cm', m2ft:'0.3048 m = 1 ft', ft2m:'1 ft = 0.3048 m', l2gal:'3.785412 L = 1 gal US', gal2l:'1 gal US = 3.785412 L',
  kmh2ms:'36 km/h = 10 m/s', ms2kmh:'10 m/s = 36 km/h', deg2rad:'180 ° = 3.141593 rad', rad2deg:'3.141593 rad = 180 °'
});
const fakeMeta = { subject:'Test', desc:'d', id:'1@g.us', participants:[{id:'111@s.whatsapp.net',admin:'admin'},{id:'222@s.whatsapp.net'},{id:'333@s.whatsapp.net'}] };
const sock = { sendMessage: async (j,c)=>{ out.push(c.text||c.caption||(c.poll?'poll':'')||'media'); }, groupMetadata: async()=>fakeMeta,
  groupParticipantsUpdate: async()=>{}, groupSettingUpdate: async()=>{}, groupInviteCode: async()=>'ABC', groupRevokeInvite: async()=>{}, groupUpdateSubject: async()=>{}, groupUpdateDescription: async()=>{} };
let out = [];
const skip = new Set(['menu','system','help']); // envoie des médias, testé à part
const quiet = new Set(['vv','reagchtoff']);
(async () => {
  let fail = 0;
  const names = Object.keys(cmds).sort();
  for (const n of names) {
    out = [];
    const text = '.' + n + (sample[n] ? ' ' + sample[n] : (n === 'reagcht' ? ' 1@newsletter 🔥' : n === 'reactstatus' ? ' on' : ['welcome','goodbye'].includes(n) ? ' on' : ''));
    const m = { key:{ remoteJid:'1@g.us', participant:'111@s.whatsapp.net', fromMe:false, id:'x' }, message:{ extendedTextMessage:{ text, contextInfo:{ mentionedJid:['222@s.whatsapp.net','333@s.whatsapp.net'], participant:'222@s.whatsapp.net', stanzaId:'abc' } } } };
    try { await handler(sock, m, { isOwnerJid: j => j.startsWith('111') }); } catch (e) { out.push('THROW ' + e.message); }
    const res = out.join(' | ');
    const bad = (!out.length && !skip.has(n) && !quiet.has(n)) || /THROW|❌ Erreur|undefined|NaN/.test(res) || (expect[n] && !res.includes(expect[n]));
    if (bad) { fail++; console.log('✗', n, '→', res.slice(0, 150)); }
  }
  console.log(`\n${names.length} commandes chargées, ${names.length - fail} OK, ${fail} en échec`);
  process.exit(fail ? 1 : 0);
})();
