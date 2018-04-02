const fs = require('fs'),
  filename = process.env.NODE_ENV || 'development',
  env = JSON.parse(fs.readFileSync(`${__dirname}/../environments/${filename}.json`), 'UTF-8');

module.exports = env;
