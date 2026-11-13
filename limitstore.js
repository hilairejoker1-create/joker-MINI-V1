const fs = require('fs');
const path = require('path');
const FILE = path.join(process.env.DATA_DIR || __dirname, 'data', 'usage.json');
function load(){try{return JSON.parse(fs.readFileSync(FILE,'utf8'));}catch{return {};}}
function save(x){fs.mkdirSync(path.dirname(FILE),{recursive:true});fs.writeFileSync(FILE,JSON.stringify(x,null,2));}
function today(){return new Date().toISOString().slice(0,10);}
function consume(user, bucket, limit){
  const all=load(), key=today()+':'+user, row=all[key]||{buckets:{}};
  row.buckets ||= {};
  const used=row.buckets[bucket]||0;
  if(used>=limit) return {ok:false,remaining:0,limit};
  row.buckets[bucket]=used+1; all[key]=row; save(all);
  return {ok:true,remaining:limit-used-1,limit};
}
module.exports={consume};
