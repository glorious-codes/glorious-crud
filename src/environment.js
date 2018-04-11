const PROD = require('../environments/production.json');
const DEV = require('../environments/development.json');

module.exports = function(){
  if(process.env.NODE_ENV == 'production'){
    PROD.DB.BASE_URL = PROD.DB.BASE_URL.replace('<USER>', process.env.DB_USER).replace('<PASS>', process.env.DB_PASS);
    return PROD;
  }
  return DEV;
};
