const resourceBuilder = require('./builder');
const RESOURCE = 'users';

module.exports = function(app){
  const resource = resourceBuilder(app, RESOURCE);
};
