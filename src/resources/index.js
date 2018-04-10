const docsResource = require('./docs/docs');
const statusResource = require('./status/status');
const usersResource = require('./users/users');

const _public = {};

_public.registerAll = (app) => {
  docsResource.buildEndpoints(app);
  statusResource.buildEndpoints(app);
  usersResource.buildEndpoints(app);
};

module.exports = _public;
