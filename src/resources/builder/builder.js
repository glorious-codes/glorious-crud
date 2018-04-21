const idService = require('../../services/id/id');
const baseResource = require('../base/base');

const _public = {};

_public.build = (app, collection) => {

  app.get(`/${collection}/:id?`, (req, res) => {
    baseResource.get(collection, req.params.id, req.query).then(result => {
      res.send(result);
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  app.post(`/${collection}`, (req, res) => {
    const item = req.body;
    item._id = idService.generate();
    baseResource.post(collection, item).then(() => {
      res.status(201).send({_id: item._id});
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  app.put(`/${collection}/:id`, (req, res) => {
    baseResource.put(collection, req.params.id, req.body).then(() => {
      res.status(204).send();
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  app.delete(`/${collection}/:id`, (req, res) => {
    baseResource.remove(collection, req.params.id).then(() => {
      res.status(204).send();
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  return app;

};

module.exports = _public;
