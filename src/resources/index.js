const usersResource = require('./users');

const _public = {};

_public.registerAll = (app) => {
  usersResource.buildEndpoints(app);
};

module.exports = _public;
