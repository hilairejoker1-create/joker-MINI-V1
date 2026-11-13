const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const run = promisify(execFile);
const root = () => path.join(process.env.DATA_DIR || __dirname, 'data', 'media');
function unwrap(message) {
  for (let i = 0; i < 5; i++) {
    const next = message?.ephemeralMessage?.message;
    if (!next) break;
    message = next;
  }
  return message || {};
}
function info(message) {
  message = unwrap(message);
  for (const [key, type] of [['imageMessage','image'],['audioMessage','audio'],['videoMessage','video'],['stickerMessage','sticker']]) {
    if (message[key]) return { type, node: message[key], message };
  }
  return null;
}
async function download(ctx, types) {
  const media = info(ctx.quoted || ctx.m.message);
  if (!media || !types.includes(media.type)) throw new Error('Reponn sou yon medya ki apwopriye pou kòmand sa a.');
  const { downloadMediaMessage } = require('@whiskeysockets/baileys');
  const bytes = ctx.downloadMedia ? await ctx.downloadMedia(media.message) : await downloadMediaMessage({ ...ctx.m, message: media.message }, 'buffer', {}, {
    logger: require('pino')({ level: 'silent' }), reuploadRequest: ctx.sock.updateMediaMessage
  });
  if (!bytes.length || bytes.length > 40 * 1024 * 1024) throw new Error('Medya a vid oswa li depase 40 Mo.');
  return { ...media, bytes };
}
async function transform(ctx, types, flags, ext, kind) {
  const media = await download(ctx, types);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'joker-media-'));
  try {
    const input = path.join(dir, 'input');
    const output = path.join(dir, 'output.' + ext);
    fs.writeFileSync(input, media.bytes);
    await run(process.env.FFMPEG_PATH || require('ffmpeg-static'), ['-hide_banner','-loglevel','error','-y','-i',input,...flags,output], { timeout: 120000 });
    const bytes = fs.readFileSync(output);
    return ctx.sock.sendMessage(ctx.jid, { [kind]: bytes, ...(kind === 'audio' ? { mimetype: 'audio/mpeg', ptt: false } : {}) }, { quoted: ctx.m });
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
}
function folder(sender) {
  return path.join(root(), crypto.createHash('sha256').update(sender).digest('hex'));
}
function save(sender, id, ext, bytes) {
  const dir = folder(sender); fs.mkdirSync(dir, { recursive: true });
  const name = crypto.createHash('sha256').update(id).digest('hex') + '.' + ext;
  fs.writeFileSync(path.join(dir, name), bytes);
  return name;
}
function library(sender) { const dir = folder(sender); return fs.existsSync(dir) ? fs.readdirSync(dir).filter(n => /\.(png|mp3|mp4)$/.test(n)).sort() : []; }
function state() {
  try { return JSON.parse(fs.readFileSync(path.join(root(),'gateway.json'),'utf8')); } catch { return {}; }
}
function pause(error) {
  fs.mkdirSync(root(), { recursive: true });
  fs.writeFileSync(path.join(root(),'gateway.json'), JSON.stringify({ status: error.status, message: error.message, type: error.type }));
}
async function request(endpoint, body, options = {}) {
  const blocked = state();
  if (blocked.status) throw new Error(blocked.message);
  if (!process.env.LOVABLE_API_KEY) throw new Error('Kreyasyon IA poko konfigire sou Railway: mete LOVABLE_API_KEY nan Variables, pa nan chat.');
  const response = await fetch('https://ai.gateway.lovable.dev/v1' + endpoint, {
    method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), ...options
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const error = Object.assign(new Error(payload.message || payload.error?.message || `Sèvis medya: ${response.status}`), { status: response.status, type: payload.type });
    if ([402,403].includes(response.status)) pause(error);
    throw error;
  }
  return response;
}
async function generateImage(prompt) {
  // A chat bot has no partial-preview canvas; consume the documented buffered result.
  const response = await request('/images/generations', { model:'openai/gpt-image-2.5-sunburst', prompt });
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message);
  const data = payload.data?.[0]?.b64_json;
  if (!data) throw new Error('Sèvis foto a pa retounen yon foto.');
  return Buffer.from(data, 'base64');
}
async function generateMusic(prompt) {
  const response = await request('/music', { model:'google/lyria-3-clip-preview', input:[{ type:'user_input', content:[{ type:'text', text:prompt }] }] });
  if (!response.headers.get('content-type')?.includes('audio/')) throw new Error('Sèvis mizik la pa retounen odyo.');
  return Buffer.from(await response.arrayBuffer());
}
async function generateVideo(prompt, onJob) {
  let job = await (await request('/videos', { model:'google/gemini-omni-1.1-flash', input:prompt, response_format:{ type:'video', resolution:'720p', duration:'5s' } })).json();
  if (!job.id) throw new Error(job.message || 'Sèvis videyo a pa retounen yon travay.');
  onJob(job.id);
  while (['queued','in_progress'].includes(job.status)) {
    await new Promise(resolve => setTimeout(resolve, 8000));
    job = await (await request('/videos/' + encodeURIComponent(job.id))).json();
  }
  if (job.status !== 'completed') throw new Error(job.error?.message || 'Kreyasyon videyo a echwe.');
  return Buffer.from(await (await request('/videos/' + encodeURIComponent(job.id) + '/content')).arrayBuffer());
}
// Durable message claims prevent a repeated WhatsApp delivery from billing twice.
let queue = Promise.resolve();
function generate(ctx, kind, prompt) {
  const work = queue.then(async () => {
    const dir = folder(ctx.sender); fs.mkdirSync(dir, { recursive:true });
    const id = `${ctx.jid}:${ctx.m.key.id}:${kind}`;
    const file = path.join(dir, crypto.createHash('sha256').update(id).digest('hex') + '.json');
    let record; try { record = JSON.parse(fs.readFileSync(file,'utf8')); } catch {}
    const ext = { image:'png', audio:'mp3', video:'mp4' }[kind];
    if (record?.file) return ctx.sock.sendMessage(ctx.jid, { [kind]:fs.readFileSync(path.join(dir,record.file)), ...(kind==='audio'?{mimetype:'audio/mpeg'}:{}) }, {quoted:ctx.m});
    if (record) return ctx.reply(record.error || 'Travay sa a deja resevwa; li p ap lanse ankò.');
    const write = value => fs.writeFileSync(file,JSON.stringify(value));
    write({status:'running',kind});
    await ctx.reply('Kreyasyon an kòmanse…');
    try {
      const bytes = kind === 'image' ? await generateImage(prompt) : kind === 'audio' ? await generateMusic(prompt) : await generateVideo(prompt, job => write({status:'running',kind,job}));
      const saved = save(ctx.sender,id,ext,bytes); write({status:'completed',file:saved,kind});
      await ctx.sock.sendMessage(ctx.jid,{[kind]:bytes,...(kind==='audio'?{mimetype:'audio/mpeg'}:{})},{quoted:ctx.m});
    } catch(error) {
      // A transport failure must not discard a completed recording's replay reference.
      const current = JSON.parse(fs.readFileSync(file,'utf8'));
      if (!current.file) write({status:'failed',error:error.message,kind});
      await ctx.reply(error.message);
    }
  });
  queue = work.catch(() => {}); return work;
}
module.exports = { info, download, transform, generate, generateImage, generateMusic, generateVideo, library, folder, state, root };