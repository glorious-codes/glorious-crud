const { MongoDBCollectionMock } = require('./mongodb-collection');

const mongoDBMock = {};

const mongoDBClientMockInstance = {
  db: jest.fn(() => mongoDBMock),
  close: jest.fn()
};

class MongoDBClientMock {
  constructor({ err, response }){
    mongoDBMock.collection = jest.fn(() => {
      return new MongoDBCollectionMock(err, response)
    });
    return mongoDBClientMockInstance;
  }
};

module.exports = {
  MongoDBClientMock,
  mongoDBClientMockInstance
};
