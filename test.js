const fs = require('fs');

console.time('readFile');
fs.readFileSync('./lib/tests/data/npmFeed1.json', {encoding: 'utf-8'});
console.timeEnd('readFile');