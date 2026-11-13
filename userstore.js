const fs = require('fs');
const path = require('path');
const FILE = path.join(process.env.DATA_DIR || __dirname, 'data', 'users.json');
function load(){ try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(x){fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE,JSON.stringify(x,null,2));}
function get(id){return load()[id] || {language:'fr', autoReply:false, autoGreetings:true};}
function set(id, patch){const all=load();all[id]={...get(id),...patch};save(all);return all[id];}
module.exports={get,set};
