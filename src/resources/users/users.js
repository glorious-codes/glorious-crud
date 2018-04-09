const resourceBuilder = require('../builder/builder');
const RESOURCE = 'users';

const _public = {};

_public.buildEndpoints = app => {
  const resource = resourceBuilder.build(app, RESOURCE);
};

module.exports = _public;
