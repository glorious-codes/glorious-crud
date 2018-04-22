const ENV = require('../../environment')();
const ERRORS = require('../../constants/errors');
const mongodb = require('mongodb');
const dateService = require('../../services/date/date');

const _public = {};

_public.get = (collection, id, query = {}) => {
  return connect((db, onComplete) => {
    collection = db.collection(collection);
    if (id)
      getSingleResource(collection, id, query, onComplete);
    else
      getAllResources(collection, query, onComplete)
  });
};

_public.post = (collection, data) => {
  return connect((db, onComplete) => {
    data.createdAt = dateService.getNow().toJSON();
    db.collection(collection).save(data, onComplete);
  });
};

_public.put = (collection, id, data) => {
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
        reject(ERRORS.DB_UNAVAILABLE);
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
    onComplete(ERRORS.UNEXPECTED_ERROR);
  } else if (!Array.isArray(result) && !result){
    onComplete(ERRORS.RESOURCE_NOT_FOUND);
  } else {
    onComplete(null, result);
  }
}

module.exports = _public;
