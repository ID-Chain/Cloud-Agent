/**
 * LevelDB Setup 
 */

const fs = require('fs');
const dir = '../data';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
const level = require('level');
const db = level('../data/db');
module.exports = db;