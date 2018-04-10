const prod = require('../environments/production.json');
const dev = require('../environments/development.json');

module.exports = function(){
  return process.env.NODE_ENV == 'production' ? prod : dev;
};
