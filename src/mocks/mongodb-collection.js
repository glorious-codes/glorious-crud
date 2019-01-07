const mongoDBCollectionMockInstance = {};

class MongoDBCollectionMock {
  constructor(err, result){
    const callbackCaller = function(){
      const callback = arguments[arguments.length - 1];
      callback(err, result);
    };
    mongoDBCollectionMockInstance.deleteOne = jest.fn(callbackCaller);
    mongoDBCollectionMockInstance.findOne = jest.fn(callbackCaller);
    mongoDBCollectionMockInstance.find = jest.fn(() => mongoDBCollectionMockInstance);
    mongoDBCollectionMockInstance.limit = jest.fn(() => mongoDBCollectionMockInstance);
    mongoDBCollectionMockInstance.save = jest.fn(callbackCaller);
    mongoDBCollectionMockInstance.sort = jest.fn(() => mongoDBCollectionMockInstance);
    mongoDBCollectionMockInstance.toArray = jest.fn(callbackCaller);
    mongoDBCollectionMockInstance.update = jest.fn(callbackCaller);
    return mongoDBCollectionMockInstance;
  }
}

module.exports = {
  MongoDBCollectionMock,
  mongoDBCollectionMockInstance
};
