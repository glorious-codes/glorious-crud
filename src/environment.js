const argv = require('yargs').argv;
const PROD = require('../environments/production.json');
const DEV = require('../environments/development.json');

module.exports = function(){
  if(process.env.NODE_ENV == 'production'){
    PROD.DB.BASE_URL = PROD.DB.BASE_URL.replace('<USER>', argv.dbuser).replace('<PASS>', argv.dbpass);
    console.log(PROD);
    return PROD;
  }
  console.log(DEV);
  return DEV;
};
