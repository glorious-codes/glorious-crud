const ENV = require('../../environment')();

const _public = {};

_public.buildEndpoints = app => {
  app.get('/', (req, res) => {
    res.send({
      users: `${ENV.APP.BASE_URL}/users{/id}`,
      status: `${ENV.APP.BASE_URL}/status`
    });
  });
};

module.exports = _public;
