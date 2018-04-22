const mongodb = require('mongodb');

const _public = {};

_public.generate = () => {
  return mongodb.ObjectID();
};

_public.isValid = id => {
  const regex = new RegExp(/^[a-f|0-9]+$/);
  return id.length === 24 && regex.test(id);
};

module.exports = _public;
