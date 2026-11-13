// Shared channel attribution and localized command suggestions for chat replies.
function channelText(config, lang='fr') {
  const label = {fr:'Chaîne WhatsApp',en:'WhatsApp channel',ht:'Chanèl WhatsApp'}[lang] || 'Chaîne WhatsApp';
  return config.channelUrl ? `${label} : ${config.channelUrl}` : '';
}
function withChannel(text, config, lang) {
  const link = channelText(config, lang);
  return link && !String(text).includes(config.channelUrl) ? `${text}\n\n${link}` : String(text);
}
function suggestions(config, lang='fr', type='text') {
  const p = config.prefix;
  const title = {fr:'Suggestions',en:'Suggestions',ht:'Sijesyon'}[lang] || 'Suggestions';
  const examples = {
    image:[`${p}sticker`,`${p}grayscale`,`${p}imagine Un paysage tropical`],
    audio:[`${p}toaudio`,`${p}bass`,`${p}compose Piano instrumental`],
    video:[`${p}thumbnail`,`${p}mutevideo`,`${p}aivideo Une plage au coucher du soleil`],
    text:[`${p}menu`,`${p}photo`,`${p}music`,`${p}imagine Un paysage tropical`,`${p}compose Piano instrumental`,`${p}aivideo Une plage au coucher du soleil`]
  };
  return `*${title}*\n${(examples[type] || examples.text).join('\n')}`;
}
function channelSocket(sock, config, lang) {
  return { ...sock, sendMessage: async (jid, content, options) => {
    if (content.text !== undefined) return sock.sendMessage(jid, {...content,text:withChannel(content.text,config,lang)},options);
    if (content.image || content.video) return sock.sendMessage(jid, {...content,caption:withChannel(content.caption || '',config,lang).trim()},options);
    const result = await sock.sendMessage(jid,content,options);
    if (content.audio && config.channelUrl) await sock.sendMessage(jid,{text:channelText(config,lang)},options);
    return result;
  }};
}
module.exports = {channelText,withChannel,suggestions,channelSocket};