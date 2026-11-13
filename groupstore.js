const fs = require('fs');
const path = require('path');
const FILE = path.join(process.env.DATA_DIR || __dirname, 'data', 'groups.json');
function load() { try { return JSON.parse(fs.readFileSync(FILE, 'utf8')); } catch { return {}; } }
function save(data) { fs.mkdirSync(path.dirname(FILE), { recursive: true }); fs.writeFileSync(FILE, JSON.stringify(data, null, 2)); }
function get(id) { return load()[id] || { welcome:true, goodbye:true, autoReply:false, autoGreetings:true, language:'fr', welcomeText:null, goodbyeText:null }; }
function set(id, patch) { const all=load(); all[id]={...get(id),...patch}; save(all); return all[id]; }
module.exports={get,set};
