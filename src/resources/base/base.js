const ENV = require('../../environment')();
const mongodb = require('mongodb');
const dateService = require('../../services/date/date');

const _public = {};

_public.get = (collection, id, query = {}) => {
  return connect((db, onComplete) => {
    collection = db.collection(collection);
    if(id){
      query._id = mongodb.ObjectID(id);
      collection.findOne(query, onComplete);
    } else {
      collection.find(query).toArray(onComplete);
    }
  });
};

_public.post = (collection, data) => {
  return connect((db, onComplete) => {
    data.createdAt = dateService.getNow().toJSON();
    db.collection(collection).insertOne(data, onComplete);
  });
};

_public.put = (collection, id, data) => {
  return connect((db, onComplete) => {
    data.updatedAt = dateService.getNow().toJSON();
    db.collection(collection).update({'_id': mongodb.ObjectID(id)}, {$set: data}, onComplete);
  });
};

_public.remove = (collection, id) => {
  return connect((db, onComplete) => {
    db.collection(collection).deleteOne({'_id': mongodb.ObjectID(id)}, onComplete);
  });
};

function connect(query){
  return new Promise(function(resolve, reject) {
    mongodb.MongoClient.connect(ENV.DB.BASE_URL, (err, client) => {
      if (err)
        reject(err);
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

module.exports = _public;
