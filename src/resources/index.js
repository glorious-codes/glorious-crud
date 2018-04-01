const usersResource = require('./users');

const _public = {};

_public.registerAll = (app, resource) => {
  usersResource(app);
};

module.exports = _public;
