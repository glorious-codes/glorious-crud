const ENV = require('../environment');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const _public = {};

_public.get = (collection, id, query = {}) => {
  return connect((db, onComplete) => {
    collection = db.collection(collection);
    if(id){
      query._id = ObjectID(id);
      collection.findOne(query, onComplete);
    } else {
      collection.find(query).toArray(onComplete);
    }
  });
};

_public.post = (collection, data) => {
  return connect((db, onComplete) => {
    db.collection(collection).insertOne(data, onComplete);
  });
};

_public.put = (collection, id, data) => {
  return connect((db, onComplete) => {
    db.collection(collection).update({'_id': ObjectID(id)}, {$set: data}, onComplete);
  });
};

_public.remove = (collection, id) => {
  return connect((db, onComplete) => {
    db.collection(collection).deleteOne({'_id': ObjectID(id)}, onComplete);
  });
};

function connect(query){
  return new Promise(function(resolve, reject) {
    MongoClient.connect(ENV.DB.BASE_URL, (err, client) => {
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
