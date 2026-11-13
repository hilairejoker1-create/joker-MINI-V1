// 100 commandes supplémentaires — toutes réelles et testées (Joker.md bot V1.1)
const os = require('os');
const groupstore = require('../groupstore');

const R = a => a[Math.floor(Math.random() * a.length)];
const T = args => args.join(' ').trim();
const ex = (reply, s) => reply('❗ Exemple : ' + s);
const mapChars = (s, from, to) => [...s].map(c => { const i = from.indexOf(c); return i >= 0 ? [...to][i] : c; }).join('');
const ABC = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const styles = {
  bold: '𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵',
  italic: '𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡0123456789',
  mono: '𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿',
  bubble: 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩⒶⒷⒸⒹⒺⒻⒼⒽⒾⒿⓀⓁⓂⓃⓄⓅⓆⓇⓈⓉⓊⓋⓌⓍⓎⓏ⓪①②③④⑤⑥⑦⑧⑨',
  square: '🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉🄰🄱🄲🄳🄴🄵🄶🄷🄸🄹🄺🄻🄼🄽🄾🄿🅀🅁🅂🅃🅄🅅🅆🅇🅈🅉0123456789'
};
const styled = (name, ex1) => async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, ex1); reply(mapChars(t, ABC, styles[name])); };
const MORSE = { a:'.-',b:'-...',c:'-.-.',d:'-..',e:'.',f:'..-.',g:'--.',h:'....',i:'..',j:'.---',k:'-.-',l:'.-..',m:'--',n:'-.',o:'---',p:'.--.',q:'--.-',r:'.-.',s:'...',t:'-',u:'..-',v:'...-',w:'.--',x:'-..-',y:'-.--',z:'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.' };
const nums = args => args.map(Number).filter(n => !isNaN(n));
const fmtN = n => Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
const isPrime = n => { if (n < 2 || !Number.isInteger(n)) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const ROM = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
const conv = (f, unitA, unitB, exs) => async ({ reply, args }) => { const n = parseFloat(args[0]); if (isNaN(n)) return ex(reply, exs); reply(`🔁 ${fmtN(n)} ${unitA} = ${fmtN(f(n))} ${unitB}`); };
const mentionedOf = m => m.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
const targetOf = m => mentionedOf(m)[0] || m.message?.extendedTextMessage?.contextInfo?.participant || null;
const tag = j => '@' + j.split('@')[0].split(':')[0];
async function getJson(url) { const r = await fetch(url, { headers: { 'User-Agent': 'JokerMdBot/1.1' } }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
const needGroup = (jid, reply) => { if (!jid.endsWith('@g.us')) { reply('❗ Cette commande fonctionne uniquement dans un groupe.'); return false; } return true; };
const needAdmin = (ctx) => { if (!needGroup(ctx.jid, ctx.reply)) return false; if (!ctx.isAdmin) { ctx.reply('❌ Réservé aux admins du groupe.'); return false; } return true; };

const riddles = [['Plus j’ai de gardiens, moins je suis gardé. Qui suis-je ?','Un secret'],['Qu’est-ce qui a des clés mais n’ouvre aucune porte ?','Un piano / un clavier'],['Plus on m’enlève, plus je deviens grand.','Un trou'],['Je parle sans bouche et j’entends sans oreilles.','L’écho'],['Kisa ki gen dan men ki pa janm mòde ?','Yon peny']];
const motiv = ['N’abandonne jamais : les grandes choses prennent du temps. 💪','Chak ti pa konte. Kontinye mache ! 🚀','Le succès commence là où finit ta zone de confort. 🔥','Believe in yourself — you are stronger than you think. ✨','Travay di jodi a, rekòlte demen. 🌱'];
const pickups = ['Tu crois au coup de foudre ou je dois repasser ? 😏','Es-tu un wifi ? Parce que je sens une connexion. 📶','Si ou te yon zetwal, ou ta pi klere pase solèy la. ⭐','Are you a magician? Every time I look at you, everyone else disappears. ✨'];
const fortunes = ['Une bonne nouvelle arrive bientôt. 📩','Ta patience sera récompensée. 🍀','Une rencontre va changer ta semaine. 🤝','Un projet ancien va enfin réussir. 🏆','Prends soin de toi, une belle énergie arrive. 🌈'];
const wyr = ['Tu préfères voler ou être invisible ?','Tu préfères vivre sans musique ou sans films ?','Tu préfères connaître le futur ou changer le passé ?','Ou pito manje diri chak jou oswa pa janm manje l ankò ?'];
const nhie = ['Je n’ai jamais menti à mes parents.','Je n’ai jamais dormi en classe.','Je n’ai jamais envoyé un message à la mauvaise personne.','M pa janm manje yon bagay ki tonbe atè.'];
const signs = { belier:'♈',taureau:'♉',gemeaux:'♊',cancer:'♋',lion:'♌',vierge:'♍',balance:'♎',scorpion:'♏',sagittaire:'♐',capricorne:'♑',verseau:'♒',poissons:'♓' };
const horo = ['Journée idéale pour avancer sur tes projets.','Évite les disputes, la patience sera ta force.','Une surprise financière est possible.','L’amour est à l’honneur aujourd’hui.','Repose-toi, ton énergie doit remonter.','Une opportunité professionnelle se présente.'];
const nicks = ['Shadow','Phoenix','Viper','Blaze','Ghost','Storm','Titan','Nova','Raven','Joker','Falcon','Zeus'];
const emojis = ['😀','😂','🔥','💯','😎','🥶','👑','🎉','🤖','🦁','🌈','💎','🚀','⚡','🍀'];

module.exports = {
  // ───── TEXTE (30)
  reverse: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.reverse bonjour'); reply([...t].reverse().join('')); },
  upper: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.upper bonjour'); reply(t.toUpperCase()); },
  lower: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.lower BONJOUR'); reply(t.toLowerCase()); },
  capitalize: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.capitalize joker md bot'); reply(t.toLowerCase().replace(/(^|\s)\S/g, c => c.toUpperCase())); },
  count: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.count texte'); reply(`🔢 Caractères : ${[...t].length}\n🔤 Sans espaces : ${t.replace(/\s/g, '').length}`); },
  wordcount: async ({ reply, args }) => { if (!args.length) return ex(reply, '.wordcount un deux trois'); reply('📝 Mots : ' + args.length); },
  repeat: async ({ reply, args }) => { const n = parseInt(args[0]); const t = T(args.slice(1)); if (!n || !t) return ex(reply, '.repeat 3 salut'); reply(Array(Math.min(n, 20)).fill(t).join('\n')); },
  mock: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.mock texte'); reply([...t].map((c, i) => i % 2 ? c.toUpperCase() : c.toLowerCase()).join('')); },
  clap: async ({ reply, args }) => { if (!args.length) return ex(reply, '.clap ou se yon chanpyon'); reply(args.join(' 👏 ') + ' 👏'); },
  bold: styled('bold', '.bold Joker'),
  italic: styled('italic', '.italic Joker'),
  mono: styled('mono', '.mono Joker'),
  bubble: styled('bubble', '.bubble Joker'),
  square: styled('square', '.square Joker'),
  strike: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.strike texte'); reply([...t].map(c => c + '\u0336').join('')); },
  upsidedown: async ({ reply, args }) => { const t = T(args).toLowerCase(); if (!t) return ex(reply, '.upsidedown hello'); reply([...mapChars(t, 'abcdefghijklmnopqrstuvwxyz!?.', 'ɐqɔpǝɟƃɥᴉɾʞlɯuodbɹsʇnʌʍxʎz¡¿˙')].reverse().join('')); },
  leet: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.leet joker'); reply(mapChars(t.toLowerCase(), 'aeiost', '43105+')); },
  morse: async ({ reply, args }) => { const t = T(args).toLowerCase(); if (!t) return ex(reply, '.morse sos'); reply([...t].map(c => c === ' ' ? '/' : MORSE[c] || '').filter(Boolean).join(' ')); },
  unmorse: async ({ reply, args }) => { if (!args.length) return ex(reply, '.unmorse ... --- ...'); const inv = Object.fromEntries(Object.entries(MORSE).map(([k, v]) => [v, k])); reply(args.map(c => c === '/' ? ' ' : inv[c] || '?').join('')); },
  binary: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.binary hi'); reply([...Buffer.from(t)].map(b => b.toString(2).padStart(8, '0')).join(' ')); },
  unbinary: async ({ reply, args }) => { if (!args.length || args.some(b => !/^[01]{1,8}$/.test(b))) return ex(reply, '.unbinary 01101000 01101001'); reply(Buffer.from(args.map(b => parseInt(b, 2))).toString()); },
  base64: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.base64 texte'); reply(Buffer.from(t).toString('base64')); },
  unbase64: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.unbase64 dGV4dGU='); reply(Buffer.from(t, 'base64').toString()); },
  hex: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.hex texte'); reply(Buffer.from(t).toString('hex')); },
  unhex: async ({ reply, args }) => { const t = args.join(''); if (!/^([0-9a-f]{2})+$/i.test(t)) return ex(reply, '.unhex 6869'); reply(Buffer.from(t, 'hex').toString()); },
  urlencode: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.urlencode a b&c'); reply(encodeURIComponent(t)); },
  urldecode: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.urldecode a%20b'); try { reply(decodeURIComponent(t)); } catch { reply('❌ Texte encodé invalide.'); } },
  rot13: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.rot13 texte'); reply(t.replace(/[a-z]/gi, c => String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))); },
  slug: async ({ reply, args }) => { const t = T(args); if (!t) return ex(reply, '.slug Mon Super Titre'); reply(t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')); },
  palindrome: async ({ reply, args }) => { const t = T(args).toLowerCase().replace(/[^a-z0-9]/g, ''); if (!t) return ex(reply, '.palindrome kayak'); reply(t === [...t].reverse().join('') ? '✅ C’est un palindrome.' : '❌ Ce n’est pas un palindrome.'); },

  // ───── MATHS & CONVERSIONS (23)
  sqrt: async ({ reply, args }) => { const n = parseFloat(args[0]); if (isNaN(n) || n < 0) return ex(reply, '.sqrt 16'); reply('√ ' + fmtN(Math.sqrt(n))); },
  pow: async ({ reply, args }) => { const [a, b] = nums(args); if (a === undefined || b === undefined) return ex(reply, '.pow 2 10'); reply(`🧮 ${a}^${b} = ${fmtN(a ** b)}`); },
  percent: async ({ reply, args }) => { const [p, n] = nums(args); if (p === undefined || n === undefined) return ex(reply, '.percent 15 200'); reply(`📊 ${p}% de ${n} = ${fmtN(p * n / 100)}`); },
  avg: async ({ reply, args }) => { const a = nums(args); if (!a.length) return ex(reply, '.avg 10 15 20'); reply('📊 Moyenne : ' + fmtN(a.reduce((x, y) => x + y, 0) / a.length)); },
  sum: async ({ reply, args }) => { const a = nums(args); if (!a.length) return ex(reply, '.sum 1 2 3'); reply('➕ Somme : ' + fmtN(a.reduce((x, y) => x + y, 0))); },
  max: async ({ reply, args }) => { const a = nums(args); if (!a.length) return ex(reply, '.max 4 9 2'); reply('⬆️ Max : ' + Math.max(...a)); },
  min: async ({ reply, args }) => { const a = nums(args); if (!a.length) return ex(reply, '.min 4 9 2'); reply('⬇️ Min : ' + Math.min(...a)); },
  random: async ({ reply, args }) => { const [a = 1, b = 100] = nums(args); const lo = Math.min(a, b), hi = Math.max(a, b); reply('🎲 ' + (Math.floor(Math.random() * (hi - lo + 1)) + lo)); },
  isprime: async ({ reply, args }) => { const n = Number(args[0]); if (!args[0] || isNaN(n)) return ex(reply, '.isprime 17'); reply(isPrime(n) ? `✅ ${n} est premier.` : `❌ ${n} n’est pas premier.`); },
  factorial: async ({ reply, args }) => { const n = parseInt(args[0]); if (isNaN(n) || n < 0 || n > 170) return ex(reply, '.factorial 5 (0 à 170)'); let r = 1n; for (let i = 2n; i <= BigInt(n); i++) r *= i; reply(`${n}! = ${r}`); },
  fibo: async ({ reply, args }) => { const n = Math.min(parseInt(args[0]) || 10, 50); const f = [0, 1]; while (f.length < n) f.push(f.at(-1) + f.at(-2)); reply('🌀 ' + f.slice(0, n).join(', ')); },
  gcd: async ({ reply, args }) => { const a = nums(args).map(Math.trunc); if (a.length < 2) return ex(reply, '.gcd 12 18'); reply('PGCD : ' + a.reduce(gcd)); },
  lcm: async ({ reply, args }) => { const a = nums(args).map(Math.trunc); if (a.length < 2) return ex(reply, '.lcm 4 6'); reply('PPCM : ' + a.reduce((x, y) => Math.abs(x * y) / gcd(x, y))); },
  roman: async ({ reply, args }) => { let n = parseInt(args[0]); if (!n || n < 1 || n > 3999) return ex(reply, '.roman 2026 (1 à 3999)'); let r = ''; for (const [v, s] of ROM) while (n >= v) { r += s; n -= v; } reply('🏛️ ' + r); },
  unroman: async ({ reply, args }) => { const s = (args[0] || '').toUpperCase(); if (!/^[MDCLXVI]+$/.test(s)) return ex(reply, '.unroman MMXXVI'); const v = { M:1000,D:500,C:100,L:50,X:10,V:5,I:1 }; let r = 0; for (let i = 0; i < s.length; i++) r += v[s[i]] < (v[s[i + 1]] || 0) ? -v[s[i]] : v[s[i]]; reply('🔢 ' + r); },
  temp: async ({ reply, args }) => { const n = parseFloat(args[0]); const u = (args[1] || 'c').toLowerCase(); if (isNaN(n)) return ex(reply, '.temp 30 c  ou  .temp 86 f'); reply(u === 'f' ? `🌡️ ${n}°F = ${fmtN((n - 32) * 5 / 9)}°C` : `🌡️ ${n}°C = ${fmtN(n * 9 / 5 + 32)}°F`); },
  km2mi: conv(n => n * 0.621371, 'km', 'miles', '.km2mi 10'),
  mi2km: conv(n => n / 0.621371, 'miles', 'km', '.mi2km 10'),
  kg2lb: conv(n => n * 2.20462, 'kg', 'lb', '.kg2lb 70'),
  lb2kg: conv(n => n / 2.20462, 'lb', 'kg', '.lb2kg 150'),
  bmi: async ({ reply, args }) => { const [kg, cm] = nums(args); if (!kg || !cm) return ex(reply, '.bmi 70 175 (kg cm)'); const b = kg / ((cm / 100) ** 2); reply(`⚖️ IMC : ${b.toFixed(1)} — ${b < 18.5 ? 'Maigreur' : b < 25 ? 'Normal' : b < 30 ? 'Surpoids' : 'Obésité'}`); },
  age: async ({ reply, args }) => { const d = new Date(args[0]); if (!args[0] || isNaN(d)) return ex(reply, '.age 2000-05-21'); const n = new Date(); let a = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--; reply(`🎂 Âge : ${a} ans`); },
  tip: async ({ reply, args }) => { const [total, pct = 10, people = 1] = nums(args); if (!total) return ex(reply, '.tip 1000 15 4 (total % personnes)'); const t = total * pct / 100; reply(`💵 Pourboire : ${fmtN(t)}\n🧾 Total : ${fmtN(total + t)}\n👥 Par personne : ${fmtN((total + t) / people)}`); },

  // ───── TEMPS & INFOS (10)
  time: async ({ reply, args }) => { const tz = args[0] || 'America/Port-au-Prince'; try { reply(`🕒 ${new Intl.DateTimeFormat('fr-FR', { timeStyle: 'medium', timeZone: tz }).format(new Date())} (${tz})`); } catch { ex(reply, '.time Europe/Paris'); } },
  date: async ({ reply }) => reply('📅 ' + new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeZone: 'America/Port-au-Prince' }).format(new Date())),
  day: async ({ reply, args }) => { const d = args[0] ? new Date(args[0]) : new Date(); if (isNaN(d)) return ex(reply, '.day 2026-12-25'); reply('📆 ' + new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d)); },
  timezone: async ({ reply }) => { const zones = ['America/Port-au-Prince', 'America/New_York', 'Europe/Paris', 'Africa/Abidjan', 'Asia/Tokyo']; reply('🌍 ' + zones.map(z => `${z} : ${new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short', timeZone: z }).format(new Date())}`).join('\n')); },
  countdown: async ({ reply, args }) => { const d = new Date(args[0]); if (!args[0] || isNaN(d)) return ex(reply, '.countdown 2026-12-31'); const ms = d - Date.now(); if (ms < 0) return reply('⌛ Cette date est déjà passée.'); reply(`⏳ ${Math.floor(ms / 864e5)} jours, ${Math.floor(ms / 36e5) % 24} heures restantes.`); },
  year: async ({ reply }) => { const n = new Date(), s = new Date(n.getFullYear(), 0, 1), e = new Date(n.getFullYear() + 1, 0, 1); reply(`📈 ${n.getFullYear()} est passée à ${((n - s) / (e - s) * 100).toFixed(1)} %`); },
  week: async ({ reply }) => { const d = new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())); const day = d.getUTCDay() || 7; d.setUTCDate(d.getUTCDate() + 4 - day); const y = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); reply('🗓️ Semaine n° ' + Math.ceil(((d - y) / 864e5 + 1) / 7)); },
  uptime: async ({ reply }) => { const s = Math.floor(os.uptime()); reply(`🖥️ Serveur allumé depuis ${Math.floor(s / 86400)}j ${Math.floor(s / 3600) % 24}h ${Math.floor(s / 60) % 60}m`); },
  myinfo: async ({ reply, sender, isOwner, isAdmin, lang }) => reply(`👤 Numéro : +${sender.split('@')[0].split(':')[0]}\n👑 Owner : ${isOwner ? 'oui' : 'non'}\n🛡️ Admin : ${isAdmin ? 'oui' : 'non'}\n🌐 Langue : ${lang}`),
  botinfo: async ({ reply, config, cmds }) => reply(`🤖 ${config.botName} v${config.version}\n📦 Commandes : ${Object.keys(cmds).length}\n⌨️ Préfixe : ${config.prefix}\n🟢 Node ${process.version} • ${os.platform()}`),

  // ───── DIVERTISSEMENT (21)
  '8ball': async ({ reply, args }) => { if (!args.length) return ex(reply, '.8ball Est-ce que je vais réussir ?'); reply('🎱 ' + R(['Oui, certainement.', 'Sans aucun doute.', 'Peut-être…', 'Demande plus tard.', 'Je ne pense pas.', 'Non.', 'Les signes disent oui.', 'Très douteux.'])); },
  rps: async ({ reply, args }) => { const c = ['pierre', 'feuille', 'ciseaux'], u = (args[0] || '').toLowerCase(); if (!c.includes(u)) return ex(reply, '.rps pierre'); const b = R(c); const win = (u === 'pierre' && b === 'ciseaux') || (u === 'feuille' && b === 'pierre') || (u === 'ciseaux' && b === 'feuille'); reply(`🤖 Bot : ${b}\n${u === b ? '🤝 Égalité !' : win ? '🎉 Tu gagnes !' : '😈 Le bot gagne !'}`); },
  slot: async ({ reply }) => { const s = ['🍒', '🍋', '🍇', '💎', '7️⃣']; const r = [R(s), R(s), R(s)]; reply(`🎰 | ${r.join(' | ')} |\n${r[0] === r[1] && r[1] === r[2] ? '💰 JACKPOT !' : r[0] === r[1] || r[1] === r[2] || r[0] === r[2] ? '✨ Petit gain !' : '😢 Perdu.'}`); },
  iq: async ({ reply, m, sender }) => { const t = targetOf(m) || sender; reply(`🧠 QI de ${tag(t)} : ${60 + Math.floor(Math.random() * 100)} (pour rire 😄)`); },
  lucky: async ({ reply }) => reply(`🍀 Ta chance aujourd’hui : ${Math.floor(Math.random() * 101)}%\n🔢 Nombre porte-bonheur : ${Math.floor(Math.random() * 99) + 1}`),
  hack: async ({ reply, m }) => { const t = targetOf(m); reply(`💻 Piratage de ${t ? tag(t) : 'la cible'}…\n[▓▓▓░░░░] 40%\n[▓▓▓▓▓▓▓] 100%\n😂 C’était une blague, aucun piratage réel !`); },
  password: async ({ reply, args }) => { const n = Math.min(Math.max(parseInt(args[0]) || 16, 6), 64); const cs = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?'; const b = require('crypto').randomBytes(n); reply('🔐 ' + [...b].map(x => cs[x % cs.length]).join('')); },
  riddle: async ({ reply }) => { const [q, a] = R(riddles); reply(`🧩 ${q}\n\n||Réponse : ${a}||`); },
  motivation: async ({ reply }) => reply('💪 ' + R(motiv)),
  horoscope: async ({ reply, args }) => { const s = (args[0] || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); if (!signs[s]) return reply('♈ Signes : ' + Object.keys(signs).join(', ')); reply(`${signs[s]} *${s}* : ${R(horo)}`); },
  dicex: async ({ reply, args }) => { const mt = (args[0] || '').match(/^(\d{1,2})d(\d{1,3})$/i); if (!mt) return ex(reply, '.dicex 3d6'); const r = Array.from({ length: +mt[1] }, () => Math.floor(Math.random() * +mt[2]) + 1); reply(`🎲 ${r.join(' + ')} = ${r.reduce((a, b) => a + b, 0)}`); },
  wouldyou: async ({ reply }) => reply('🤔 ' + R(wyr)),
  neverhave: async ({ reply }) => reply('🙈 ' + R(nhie)),
  pickup: async ({ reply }) => reply('😏 ' + R(pickups)),
  fortune: async ({ reply }) => reply('🥠 ' + R(fortunes)),
  yesno: async ({ reply }) => reply(R(['✅ Oui', '❌ Non'])),
  emoji: async ({ reply }) => reply(Array.from({ length: 5 }, () => R(emojis)).join(' ')),
  color: async ({ reply }) => reply('🎨 #' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0').toUpperCase()),
  nickname: async ({ reply }) => reply('🏷️ ' + R(nicks) + R(['X', '_HT', '237', 'Pro', '99', 'King'])),
  top: async ({ sock, jid, reply, args }) => { if (!needGroup(jid, reply)) return; const meta = await sock.groupMetadata(jid); const ps = meta.participants.map(p => p.id).sort(() => Math.random() - 0.5).slice(0, 5); await sock.sendMessage(jid, { text: `🏆 Top 5 ${T(args) || 'du groupe'} :\n` + ps.map((p, i) => `${i + 1}. ${tag(p)}`).join('\n'), mentions: ps }); },
  couple: async ({ sock, jid, reply }) => { if (!needGroup(jid, reply)) return; const meta = await sock.groupMetadata(jid); const ps = meta.participants.map(p => p.id).sort(() => Math.random() - 0.5).slice(0, 2); if (ps.length < 2) return reply('❗ Pas assez de membres.'); await sock.sendMessage(jid, { text: `💑 Couple du jour : ${tag(ps[0])} ❤️ ${tag(ps[1])}`, mentions: ps }); },

  // ───── GROUPES (8)
  members: async ({ sock, jid, reply }) => { if (!needGroup(jid, reply)) return; const meta = await sock.groupMetadata(jid); const a = meta.participants.filter(p => p.admin).length; reply(`👥 Membres : ${meta.participants.length}\n👑 Admins : ${a}`); },
  tagadmin: async ({ sock, jid, reply, args }) => { if (!needGroup(jid, reply)) return; const meta = await sock.groupMetadata(jid); const ad = meta.participants.filter(p => p.admin).map(p => p.id); await sock.sendMessage(jid, { text: `📣 ${T(args) || 'Admins demandés'}\n` + ad.map(tag).join(' '), mentions: ad }); },
  poll: async ({ sock, jid, reply, text, config }) => { const parts = text.slice(config.prefix.length + 4).split('|').map(s => s.trim()).filter(Boolean); if (parts.length < 3) return ex(reply, '.poll Question | Option 1 | Option 2'); await sock.sendMessage(jid, { poll: { name: parts[0], values: parts.slice(1, 13), selectableCount: 1 } }); },
  warn: async (ctx) => { if (!needAdmin(ctx)) return; const { sock, jid, m, reply } = ctx; const t = targetOf(m); if (!t) return reply('❗ Mentionne ou réponds à la personne.'); const g = groupstore.get(jid); const w = { ...(g.warns || {}) }; w[t] = (w[t] || 0) + 1; groupstore.set(jid, { warns: w }); await sock.sendMessage(jid, { text: `⚠️ ${tag(t)} avertissement ${w[t]}/3`, mentions: [t] }); if (w[t] >= 3) { try { await sock.groupParticipantsUpdate(jid, [t], 'remove'); delete w[t]; groupstore.set(jid, { warns: w }); reply('🚫 3 avertissements : membre retiré.'); } catch { reply('❌ Le bot doit être admin pour retirer ce membre.'); } } },
  unwarn: async (ctx) => { if (!needAdmin(ctx)) return; const { jid, m, reply } = ctx; const t = targetOf(m); if (!t) return reply('❗ Mentionne ou réponds à la personne.'); const w = { ...(groupstore.get(jid).warns || {}) }; delete w[t]; groupstore.set(jid, { warns: w }); reply('✅ Avertissements effacés.'); },
  warnings: async ({ jid, reply, sock }) => { if (!needGroup(jid, reply)) return; const w = groupstore.get(jid).warns || {}; const l = Object.entries(w); if (!l.length) return reply('✅ Aucun avertissement.'); await sock.sendMessage(jid, { text: '⚠️ Avertissements :\n' + l.map(([j, n]) => `• ${tag(j)} : ${n}/3`).join('\n'), mentions: l.map(x => x[0]) }); },
  gdesc: async ({ sock, jid, reply }) => { if (!needGroup(jid, reply)) return; const meta = await sock.groupMetadata(jid); reply('📝 ' + (meta.desc || 'Aucune description.')); },
  delete: async (ctx) => { const { sock, jid, m, reply, isOwner, isAdmin } = ctx; const ci = m.message?.extendedTextMessage?.contextInfo; if (!ci?.stanzaId) return reply('❗ Réponds au message à supprimer avec .delete'); if (jid.endsWith('@g.us') && !isAdmin && !isOwner) return reply('❌ Réservé aux admins.'); try { await sock.sendMessage(jid, { delete: { remoteJid: jid, id: ci.stanzaId, participant: ci.participant, fromMe: false } }); } catch { reply('❌ Impossible (le bot doit être admin).'); } },

  // ───── WEB (8) — APIs gratuites sans clé
  weather: async ({ reply, args }) => { const c = T(args); if (!c) return ex(reply, '.weather Port-au-Prince'); try { const r = await fetch('https://wttr.in/' + encodeURIComponent(c) + '?format=%l:+%c+%t,+vent+%w,+humidité+%h&lang=fr'); reply('🌤️ ' + (await r.text()).trim()); } catch { reply('❌ Météo indisponible.'); } },
  wiki: async ({ reply, args }) => { const q = T(args); if (!q) return ex(reply, '.wiki Haïti'); try { const j = await getJson('https://fr.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(q.replace(/ /g, '_'))); reply(`📚 *${j.title}*\n\n${j.extract || 'Aucun résumé.'}\n\n🔗 ${j.content_urls?.desktop?.page || ''}`); } catch { reply('❌ Page introuvable.'); } },
  define: async ({ reply, args }) => { const w = args[0]; if (!w) return ex(reply, '.define happy (anglais)'); try { const j = await getJson('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w)); const d = j[0].meanings.slice(0, 3).map(x => `• (${x.partOfSpeech}) ${x.definitions[0].definition}`).join('\n'); reply(`📖 *${j[0].word}*\n${d}`); } catch { reply('❌ Mot introuvable.'); } },
  translate: async ({ reply, args }) => { const to = args[0]; const t = T(args.slice(1)); if (!to || !t) return ex(reply, '.translate en Bonjour tout le monde'); try { const j = await getJson(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=autodetect|${encodeURIComponent(to)}`); reply('🌐 ' + j.responseData.translatedText); } catch { reply('❌ Traduction indisponible.'); } },
  crypto: async ({ reply, args }) => { const c = (args[0] || 'bitcoin').toLowerCase(); try { const j = await getJson(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(c)}&vs_currencies=usd,eur&include_24hr_change=true`); if (!j[c]) return reply('❌ Crypto inconnue. Exemple : .crypto ethereum'); reply(`💰 ${c} : $${j[c].usd} • €${j[c].eur}\n📉 24h : ${(j[c].usd_24h_change || 0).toFixed(2)}%`); } catch { reply('❌ Prix indisponible.'); } },
  github: async ({ reply, args }) => { if (!args[0]) return ex(reply, '.github torvalds'); try { const u = await getJson('https://api.github.com/users/' + encodeURIComponent(args[0])); reply(`🐙 *${u.name || u.login}*\n📝 ${u.bio || '—'}\n📦 Repos : ${u.public_repos}\n👥 Followers : ${u.followers}\n🔗 ${u.html_url}`); } catch { reply('❌ Utilisateur introuvable.'); } },
  ipinfo: async ({ reply, args }) => { if (!args[0]) return ex(reply, '.ipinfo 8.8.8.8'); try { const j = await getJson('https://ipwho.is/' + encodeURIComponent(args[0])); if (!j.success) return reply('❌ IP invalide.'); reply(`🌐 ${j.ip}\n📍 ${j.city}, ${j.region}, ${j.country} ${j.flag?.emoji || ''}\n🏢 ${j.connection?.isp || '—'}`); } catch { reply('❌ Service indisponible.'); } },
  advice: async ({ reply }) => { try { const j = await getJson('https://api.adviceslip.com/advice'); reply('💡 ' + j.slip.advice); } catch { reply('💡 ' + R(motiv)); } }
};
