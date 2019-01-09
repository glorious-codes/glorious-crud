const QUERY_PARAMS = require('../../constants/query-params');
const DEFAULT_PAGE_SIZE = 30;

const _public = {};

_public.build = queryParams => {
  return {
    filter: buildFilter(queryParams),
    sort: buildQuerySort(queryParams[QUERY_PARAMS.SORT_BY], queryParams[QUERY_PARAMS.ORDER]),
    skip: buildQuerySkip(queryParams[QUERY_PARAMS.PAGE], queryParams[QUERY_PARAMS.PAGE_SIZE]),
    limit: buildQueryLimit(queryParams[QUERY_PARAMS.LIMIT], queryParams[QUERY_PARAMS.PAGE_SIZE])
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
  const { SORT_BY, ORDER, PAGE, PAGE_SIZE, LIMIT } = QUERY_PARAMS;
  return [SORT_BY, ORDER, PAGE, PAGE_SIZE, LIMIT].includes(key);
}

function buildQuerySort(sortByParam, orderParam){
  return sortByParam ? {
    [sortByParam]: buildQueryOrderValue(orderParam)
  } : {};
}

function buildQueryOrderValue(orderParam){
  return orderParam == 'asc' ? 1 : -1;
}

function buildQuerySkip(pageParam, pageSizeParam){
  return pageParam ?
    parseIntegerParam(pageParam - 1, 0) * parseIntegerParam(pageSizeParam, DEFAULT_PAGE_SIZE) :
    0;
}

function buildQueryLimit(limitParam, pageSizeParam){
  return parseIntegerParam(limitParam) || parseIntegerParam(pageSizeParam, DEFAULT_PAGE_SIZE);
}

function parseIntegerParam(param, fallbackValue){
  return Math.abs(parseInt(param)) || fallbackValue;
}

module.exports = _public;
