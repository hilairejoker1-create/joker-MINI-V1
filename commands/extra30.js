// 30 outils locaux : aucune API ni clé supplémentaire nécessaire.
const text = args => args.join(' ').trim();
const format = value => Number(value.toFixed(6)).toString();
const example = (reply, config, command, input) => reply(`❗ Exemple : ${config.prefix}${command} ${input}`);
const words = input => input.match(/[\p{L}\p{N}]+/gu) || [];

function textCommand(name, input, transform) {
  return async ({ args, reply, config }) => {
    const value = text(args);
    if (!value) return example(reply, config, name, input);
    return reply(transform(value) || 'Aucun résultat.');
  };
}
function numericCommand(name, input, calculate, validate = values => values.length > 0) {
  return async ({ args, reply, config }) => {
    const values = args.map(Number);
    if (!values.every(Number.isFinite) || !validate(values)) return example(reply, config, name, input);
    const result = calculate(values);
    if (typeof result === 'number' && !Number.isFinite(result)) return reply('❌ Résultat hors limites.');
    return reply(typeof result === 'number' ? format(result) : result);
  };
}
const one = values => values.length === 1;
const pair = values => values.length === 2;
const average = values => values.reduce((a, b) => a + b, 0) / values.length;
const variance = values => {
  const mean = average(values);
  return average(values.map(value => (value - mean) ** 2));
};
const conversion = (name, factor, from, to) => numericCommand(name, '10', ([value]) => {
  const result = value * factor;
  return Number.isFinite(result) ? `${format(value)} ${from} = ${format(result)} ${to}` : '❌ Résultat hors limites.';
}, one);

module.exports = {
  trimtext: textCommand('trimtext', 'un   texte', value => value.replace(/\s+/g, ' ')),
  noaccents: textCommand('noaccents', 'école', value => value.normalize('NFD').replace(/\p{M}/gu, '')),
  initials: textCommand('initials', 'Joker Md Bot', value => words(value).map(word => [...word][0]).join('').toUpperCase()),
  camelcase: textCommand('camelcase', 'Joker Md Bot', value => words(value).map((word, index) => index ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase()).join('')),
  snakecase: textCommand('snakecase', 'Joker Md Bot', value => words(value).join('_').toLowerCase()),
  sortwords: textCommand('sortwords', 'zèbre chat abeille', value => words(value).sort((a, b) => a.localeCompare(b, 'fr')).join(' ')),
  uniquewords: textCommand('uniquewords', 'chat chat chien', value => [...new Set(words(value).map(word => word.toLowerCase()))].join(' ')),
  wordfreq: textCommand('wordfreq', 'chat chat chien', value => {
    const counts = new Map();
    for (const word of words(value.toLowerCase())) counts.set(word, (counts.get(word) || 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1]).map(([word, count]) => `${word} : ${count}`).join('\n');
  }),
  extractnumbers: textCommand('extractnumbers', 'Prix 12.50 et 20', value => (value.match(/[-+]?\d+(?:[.,]\d+)?/g) || []).join(', ')),
  extractemails: textCommand('extractemails', 'Contact : nom@example.com', value => [...new Set(value.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [])].join('\n')),
  median: numericCommand('median', '1 9 3', values => {
    const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }),
  range: numericCommand('range', '2 9 4', values => Math.max(...values) - Math.min(...values)),
  product: numericCommand('product', '2 3 4', values => values.reduce((a, b) => a * b, 1)),
  variance: numericCommand('variance', '2 4 6', variance),
  stddev: numericCommand('stddev', '2 4 6', values => Math.sqrt(variance(values))),
  cbrt: numericCommand('cbrt', '27', ([value]) => Math.cbrt(value), one),
  hypot: numericCommand('hypot', '3 4', values => Math.hypot(...values), pair),
  log10: numericCommand('log10', '100', ([value]) => Math.log10(value), values => one(values) && values[0] > 0),
  primefactors: numericCommand('primefactors', '60', ([value]) => {
    const factors = [];
    for (let divisor = 2; divisor * divisor <= value; divisor++) {
      while (value % divisor === 0) { factors.push(divisor); value /= divisor; }
    }
    if (value > 1) factors.push(value);
    return factors.join(' × ');
  }, values => one(values) && Number.isSafeInteger(values[0]) && values[0] >= 2 && values[0] <= 1000000000),
  fraction: numericCommand('fraction', '12 18', ([numerator, denominator]) => {
    let a = Math.abs(numerator), b = Math.abs(denominator);
    while (b) { const remainder = a % b; a = b; b = remainder; }
    const sign = denominator < 0 ? -1 : 1;
    return `${numerator / a * sign}/${Math.abs(denominator) / a}`;
  }, values => pair(values) && values.every(Number.isSafeInteger) && values[1] !== 0),
  cm2in: conversion('cm2in', 1 / 2.54, 'cm', 'in'),
  in2cm: conversion('in2cm', 2.54, 'in', 'cm'),
  m2ft: conversion('m2ft', 1 / 0.3048, 'm', 'ft'),
  ft2m: conversion('ft2m', 0.3048, 'ft', 'm'),
  l2gal: conversion('l2gal', 1 / 3.785411784, 'L', 'gal US'),
  gal2l: conversion('gal2l', 3.785411784, 'gal US', 'L'),
  kmh2ms: conversion('kmh2ms', 1 / 3.6, 'km/h', 'm/s'),
  ms2kmh: conversion('ms2kmh', 3.6, 'm/s', 'km/h'),
  deg2rad: conversion('deg2rad', Math.PI / 180, '°', 'rad'),
  rad2deg: conversion('rad2deg', 180 / Math.PI, 'rad', '°')
};