/**
 * LevelDB Setup 
 */
const fs = require('fs');
const dir = process.env.IDC_CA_DB_PATH;
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
const level = require('level');
const db = level(dir+'/db', {keyEncoding:'json',valueEncoding:'json'});
module.exports = db;