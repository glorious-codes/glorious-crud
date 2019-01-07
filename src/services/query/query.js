const QUERY_PARAMS = require('../../constants/query-params');

const _public = {};

_public.build = queryParams => {
  return {
    filter: buildFilter(queryParams),
    sort: buildQuerySort(queryParams[QUERY_PARAMS.SORT_BY], queryParams[QUERY_PARAMS.ORDER]),
    limit: buildQueryLimit(queryParams[QUERY_PARAMS.LIMIT])
  };
}

function buildFilter(queryParams){
  const filter = {};
  for(let key in queryParams) {
    if(!isBuiltInQueryParam(key))
      filter[key] = queryParams[key];
  }
  return filter;
}

function isBuiltInQueryParam(key){
  const { SORT_BY, ORDER, LIMIT } = QUERY_PARAMS;
  return [SORT_BY, ORDER, LIMIT].includes(key);
}

function buildQuerySort(sortByParam, orderParam){
  return sortByParam ? {
    [sortByParam]: buildQueryOrderValue(orderParam)
  } : {};
}

function buildQueryOrderValue(orderParam){
  return orderParam == 'asc' ? 1 : -1;
}

function buildQueryLimit(limitParam){
  return parseInt(limitParam) || 0;
}

module.exports = _public;
