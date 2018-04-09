const _public = {};

_public.buildEndpoints = app => {
  app.get('/status', (req, res) => {
    res.send({
      status: 'ok'
    });
  });
};

module.exports = _public;
