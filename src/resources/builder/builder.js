const requestService = require('../../services/request/request');
const idService = require('../../services/id/id');

const _public = {};

_public.build = (app, baseResource, collection, options = {}) => {

  buildEndpoint(app.get, `/${collection}/:id?`, (options.get || get));
  buildEndpoint(app.post, `/${collection}`, (options.post || post));
  buildEndpoint(app.put, `/${collection}/:id`, (options.put || put));
  buildEndpoint(app.delete, `/${collection}/:id`,(options.delete || del));

  function buildEndpoint(method, path, action){
    method(path, (req, res) => {
      action(req, res, options);
    });
  }

  function get(req, res, options){
    const err = requestService.validate('get', req);
    if(err)
      return throwError(req, res, err, options.onGetError);
    baseResource.get(collection, req.params.id, req.query).then(result => {
      respond(req, res, {status: 200, body: result}, options.onGetSuccess);
    }, err => {
      throwError(req, res, err, options.onGetError);
    });
  }

  function post(req, res, options){
    const err = requestService.validate('post', req);
    if(err)
      return throwError(req, res, err, options.onPostError);
    req.body._id = idService.generate();
    baseResource.post(collection, req.body).then(() => {
      const result = {_id: req.body._id};
      respond(req, res, {status: 201, body: result}, options.onPostSuccess);
    }, err => {
      throwError(req, res, err, options.onPostError);
    });
  }

  function put(req, res, options){
    const err = requestService.validate('put', req);
    if(err)
      return throwError(req, res, err, options.onPutError);
    baseResource.put(collection, req.params.id, req.body).then(() => {
      respond(req, res, {status: 204}, options.onPutSuccess);
    }, err => {
      throwError(req, res, err, options.onPutError);
    });
  }

  function del(req, res, options){
    const err = requestService.validate('delete', req);
    if(err)
      return throwError(req, res, err, options.onDeleteError);
    baseResource.remove(collection, req.params.id).then(() => {
      respond(req, res, {status: 204}, options.onDeleteSuccess);
    }, err => {
      throwError(req, res, err, options.onDeleteError);
    });
  }

  function respond(req, res, response, customSuccessAction){
    if(customSuccessAction)
      return customSuccessAction(req, res, response);
    res.status(response.status).send(response.body);
  }

  function throwError(req, res, err, customErrorAction){
    if(customErrorAction)
      return customErrorAction(req, res, err);
    res.status(err.status).send(err.body);
  }

  return app;

};

module.exports = _public;
