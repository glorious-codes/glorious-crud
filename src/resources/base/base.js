const ENV = require('../../environment')();
const mongodb = require('mongodb');
const dateService = require('../../services/date/date');

const _public = {};

_public.get = (collection, id, query = {}) => {
  if(id && !isValidId(id))
    return throwInvalidIdError();
  return connect((db, onComplete) => {
    collection = db.collection(collection);
    if (id)
      getSingleResource(collection, id, query, onComplete);
    else
      getAllResources(collection, query, onComplete)
  });
};

_public.post = (collection, data) => {
  if(!data)
    return throwEmptyPayloadError();
  return connect((db, onComplete) => {
    data.createdAt = dateService.getNow().toJSON();
    db.collection(collection).save(data, onComplete);
  });
};

_public.put = (collection, id, data) => {
  if (!isValidId(id))
    return throwInvalidIdError();
  if (!data)
    return throwEmptyPayloadError();
  return connect((db, onComplete) => {
    data.updatedAt = dateService.getNow().toJSON();
    _public.get(collection, id).then(() => {
      db.collection(collection).update({'_id': mongodb.ObjectID(id)}, {$set: data}, onComplete);
    }, err => {
      onComplete(err);
    });
  });
};

_public.remove = (collection, id) => {
  if (!isValidId(id))
    return throwInvalidIdError();
  return connect((db, onComplete) => {
    _public.get(collection, id).then(() => {
      db.collection(collection).deleteOne({'_id': mongodb.ObjectID(id)}, onComplete);
    }, err => {
      onComplete(err);
    });
  });
};

function connect(query){
  return new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(ENV.DB.BASE_URL, (err, client) => {
      if (err)
        reject(buildDatabaseConnectionError());
      else
        query(client.db(ENV.DB.NAME), (err, result) => {
          if (err)
            reject(err);
          else
            resolve(result);
          client.close();
        });
    });
  });
}

function isValidId(id){
  const regex = new RegExp(/^[a-f|0-9]+$/);
  return id.length === 24 && regex.test(id);
}

function getSingleResource(collection, id, query, onComplete){
  query._id = mongodb.ObjectID(id);
  collection.findOne(query, (err, result) => {
    onGetComplete(err, result, onComplete);
  });
}

function getAllResources(collection, query, onComplete){
  collection.find(query).toArray((err, result) => {
    onGetComplete(err, result, onComplete);
  });
}

function onGetComplete(err, result, onComplete){
  if(err) {
    onComplete({status: 500, body: { message: err }});
  } else if (!Array.isArray(result) && !result){
    onComplete({status: 404});
  } else {
    onComplete(null, result);
  }
}

function throwInvalidIdError(){
  return throwError(buildInvalidIdError());
}

function throwEmptyPayloadError(){
  return throwError(buildEmptyPayloadError());
}

function buildDatabaseConnectionError(){
  return buildError(500, 'Failed on connect to the database.');
}

function buildInvalidIdError(){
  return buildError(400, 'Id should be a string of 24 hex characters.');
}

function buildEmptyPayloadError(){
  return buildError(400, 'Request payload cannot be empty.');
}

function buildError(status, message){
  return {
    status,
    body: { message }
  };
}

function throwError(err){
  return new Promise(function(resolve, reject) {
    reject(err);
  });
}

module.exports = _public;
