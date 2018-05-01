const ERRORS = require('../../constants/errors');
const idService = require('../../services/id/id');

const _public = {};

_public.validate = (method, req) => {
  const id = req.params.id;
  const item = req.body;
  if(method == 'get' && id && !idService.isValid(id))
    return ERRORS.INVALID_ID;
  if((method == 'put' || method == 'delete') && (!id || !idService.isValid(id)))
    return ERRORS.INVALID_ID;
  if((method == 'put' || method == 'post') && !hasAnyAttribute(item))
    return ERRORS.EMPTY_REQUEST_BODY;
};

function hasAnyAttribute(data){
  for(var attr in data) {
    if (data.hasOwnProperty(attr))
      return true;
  }
}

module.exports = _public;
