const assert = require('node:assert/strict');
const commands = require('./commands/extra30');
const cases = {
  trimtext: ['un   texte', 'un texte'], noaccents: ['école', 'ecole'],
  initials: ['Joker Md Bot', 'JMB'], camelcase: ['Joker Md Bot', 'jokerMdBot'],
  snakecase: ['Joker Md Bot', 'joker_md_bot'], sortwords: ['zèbre chat abeille', 'abeille chat zèbre'],
  uniquewords: ['chat CHAT chien', 'chat chien'], wordfreq: ['chat chat chien', 'chat : 2\nchien : 1'],
  extractnumbers: ['Prix 12.50 et -20', '12.50, -20'], extractemails: ['nom@example.com nom@example.com', 'nom@example.com'],
  median: ['1 9 3', '3'], range: ['2 9 4', '7'], product: ['2 3 4', '24'],
  variance: ['2 4 6', '2.666667'], stddev: ['2 4 6', '1.632993'], cbrt: ['-27', '-3'],
  hypot: ['3 4', '5'], log10: ['100', '2'], primefactors: ['60', '2 × 2 × 3 × 5'], fraction: ['12 -18', '-2/3'],
  cm2in: ['2.54', '2.54 cm = 1 in'], in2cm: ['1', '1 in = 2.54 cm'],
  m2ft: ['0.3048', '0.3048 m = 1 ft'], ft2m: ['1', '1 ft = 0.3048 m'],
  l2gal: ['3.785411784', '3.785412 L = 1 gal US'], gal2l: ['1', '1 gal US = 3.785412 L'],
  kmh2ms: ['36', '36 km/h = 10 m/s'], ms2kmh: ['10', '10 m/s = 36 km/h'],
  deg2rad: ['180', '180 ° = 3.141593 rad'], rad2deg: [String(Math.PI), '3.141593 rad = 180 °']
};
async function run() {
  assert.equal(Object.keys(commands).length, 30, 'Exactly 30 new commands');
  const loaded = new Set();
  for (const file of require('fs').readdirSync(require('path').join(__dirname, 'commands'))) {
    if (!file.endsWith('.js')) continue;
    for (const name of Object.keys(require('./commands/' + file))) {
      if (Object.hasOwn(commands, name)) assert.equal(loaded.has(name), false, `Duplicate new command: ${name}`);
      loaded.add(name);
    }
  }
  for (const [name, [input, expected]] of Object.entries(cases)) {
    let output;
    await commands[name]({ args: input.split(/\s+/), config: { prefix: '!' }, reply: async value => { output = value; } });
    assert.equal(output, expected, name);
    await commands[name]({ args: [], config: { prefix: '!' }, reply: async value => { output = value; } });
    assert.match(output, /Exemple/, `${name} handles missing input`);
  }
  for (const [name, input] of [['fraction', '1 0'], ['log10', '-1'], ['primefactors', '1000000001'], ['hypot', '3'], ['median', 'abc']]) {
    let output;
    await commands[name]({ args: input.split(' '), config: { prefix: '.' }, reply: async value => { output = value; } });
    assert.match(output, /Exemple/, `${name} rejects invalid input`);
  }
  console.log('30 nouvelles commandes : résultats et entrées invalides vérifiés.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });