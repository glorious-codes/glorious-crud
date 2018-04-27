const ERRORS = require('../../constants/errors');
const idService = require('../../services/id/id');

const _public = {};

_public.build = (app, baseResource, collection) => {

  app.get(`/${collection}/:id?`, (req, res) => {
    const id = req.params.id;
    if(id && !idService.isValid(id))
      return throwError(res, ERRORS.INVALID_ID);
    baseResource.get(collection, id, req.query).then(result => {
      res.send(result);
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  app.post(`/${collection}`, (req, res) => {
    const item = req.body;
    if(!hasAnyAttribute(item))
      return throwError(res, ERRORS.EMPTY_REQUEST_BODY);
    item._id = idService.generate();
    baseResource.post(collection, item).then(() => {
      res.status(201).send({_id: item._id});
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  app.put(`/${collection}/:id`, (req, res) => {
    const id = req.params.id;
    const item = req.body;
    if(!idService.isValid(id))
      return throwError(res, ERRORS.INVALID_ID);
    if(!hasAnyAttribute(item))
      return throwError(res, ERRORS.EMPTY_REQUEST_BODY);
    baseResource.put(collection, id, item).then(() => {
      res.status(204).send();
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  app.delete(`/${collection}/:id`, (req, res) => {
    const id = req.params.id;
    if(!idService.isValid(id))
      return throwError(res, ERRORS.INVALID_ID);
    baseResource.remove(collection, id).then(() => {
      res.status(204).send();
    }, err => {
      res.status(err.status).send(err.body);
    });
  });

  function hasAnyAttribute(data){
    for(var attr in data) {
      if (data.hasOwnProperty(attr))
        return true;
    }
  }

  function throwError(res, err){
    res.status(err.status).send(err.body);
  }

  return app;

};

module.exports = _public;
