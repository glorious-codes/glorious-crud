const mongodb = require('mongodb');
const ERRORS = require('../../constants/errors');
const dateService = require('../../services/date/date');
const queryService = require('../../services/query/query');

module.exports = class BaseResource {
  constructor(dbUrl, dbName){
    this.dbUrl = dbUrl;
    this.dbName = dbName;
  }

  get(collection, id, query = {}){
    return connect((db, onComplete) => {
      collection = db.collection(collection);
      if (id)
        getSingleResource(collection, id, query, onComplete);
      else
        getAllResources(collection, query, onComplete)
    }, this.dbUrl, this.dbName);
  }

  post(collection, data){
    return connect((db, onComplete) => {
      data.createdAt = dateService.getNow().toJSON();
      db.collection(collection).save(data, onComplete);
    }, this.dbUrl, this.dbName);
  }

  put(collection, id, data){
    return connect((db, onComplete) => {
      data.updatedAt = dateService.getNow().toJSON();
      this.get(collection, id).then(() => {
        data._id = mongodb.ObjectID(id);
        db.collection(collection).update({'_id': data._id}, data, onComplete);
      }, err => {
        onComplete(err);
      });
    }, this.dbUrl, this.dbName);
  }

  remove(collection, id){
    return connect((db, onComplete) => {
      this.get(collection, id).then(() => {
        db.collection(collection).deleteOne({'_id': mongodb.ObjectID(id)}, onComplete);
      }, err => {
        onComplete(err);
      });
    }, this.dbUrl, this.dbName);
  }
}

function connect(query, dbUrl, dbName){
  return new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(dbUrl, (err, client) => {
      if (err)
        reject(ERRORS.DB_UNAVAILABLE);
      else
        query(client.db(dbName), (err, result) => {
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

function getAllResources(collection, queryParams, onComplete){
  const query = queryService.build(queryParams);
  collection.find(query.filter)
            .sort(query.sort)
            .limit(query.limit)
            .toArray((err, result) => {
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
