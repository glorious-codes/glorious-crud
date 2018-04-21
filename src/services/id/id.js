const mongodb = require('mongodb');

const _public = {};

_public.generate = () => {
  return mongodb.ObjectID();
}

module.exports = _public;
