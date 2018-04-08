const ENV = require('../environment');
const mongodb = require('mongodb');
const dateService = require('../services/date-service');
const baseResource = require('./base');

describe('Base Resource', () => {
  let mongoDBClientMock,
    mongoDBClientCollectionMock;

  function mockMongoDBClientCollection(responseType, response){
    const err = responseType == 'error' ? response : null;
    const result = responseType == 'success' ? response : null;
    const getError = () => { if(responseType == 'error') return response; };
    const getResult = () => { if(responseType == 'success') return response;}
    const toArrayStub = jasmine.createSpy();
    const findOneStub = jasmine.createSpy();
    const insertOneStub = jasmine.createSpy();
    const updateStub = jasmine.createSpy();
    const deleteOneStub = jasmine.createSpy();
    return {
      findOne: findOneStub.and.callFake((query, callback) => {
        callback(err, result);
      }),
      find(){
        return {
          toArray: toArrayStub.and.callFake(callback => {
            callback(err, result);
          })
        };
      },
      insertOne: findOneStub.and.callFake((data, callback) => {
        callback(err, result);
      }),
      update: updateStub.and.callFake((query, data, callback) => {
        callback(err, result);
      }),
      deleteOne: deleteOneStub.and.callFake((query, callback) => {
        callback(err, result);
      }),
    };
  }

  function mockMogoDBClient(responseType, response){
    mongoDBClientCollectionMock = mongoDBClientCollectionMock || mockMongoDBClientCollection(responseType, response);
    mongoDBClientMock = {
      db(){
        return {
          collection(){
            return mongoDBClientCollectionMock;
          }
        };
      },
      close: jasmine.createSpy()
    };
  }

  function stubMongoClientConnect(responseType, response){
    mockMogoDBClient(responseType, response);
    spyOn(mongodb.MongoClient, 'connect').and.callFake((url, callback) => {
      if(responseType == 'error')
        callback(response);
      else
        callback(null, mongoDBClientMock);
    });
  }

  beforeEach(() => {
    spyOn(mongodb, 'ObjectID').and.returnValue(123);
    spyOn(dateService, 'getNow').and.returnValue(new Date('2018-04-07'));
  });

  afterEach(() => {
    mongoDBClientCollectionMock = null;
  });

  it('should connect to mongo db client trough the proper database url', () => {
    stubMongoClientConnect('success');
    baseResource.get('users');
    expect(mongodb.MongoClient.connect).toHaveBeenCalledWith(ENV.DB.BASE_URL, jasmine.any(Function));
  });

  it('should return a promise after connecting to mongo db client', () => {
    stubMongoClientConnect('success');
    const promise = baseResource.get('users');
    expect(promise.then).toBeDefined();
  });

  it('should get all resources of a collection', () => {
    const users = [{first: 'user'}, {second: 'user'}];
    mongoDBClientCollectionMock = mockMongoDBClientCollection('success', users);
    stubMongoClientConnect('success');
    baseResource.get('users').then(response => {
      expect(response).toEqual(users);
    });
  });

  it('should get a single resource of a collection', () => {
    stubMongoClientConnect('success');
    baseResource.get('users', 123);
    expect(mongodb.ObjectID).toHaveBeenCalledWith(123);
    expect(mongoDBClientCollectionMock.findOne).toHaveBeenCalledWith({
      _id: 123
    }, jasmine.any(Function));
  });

  it('should save a new resource into a collection', () => {
    stubMongoClientConnect('success');
    baseResource.post('users', {name: 'Rafael'});
    expect(mongoDBClientCollectionMock.insertOne).toHaveBeenCalledWith({
      name: 'Rafael',
      createdAt: '2018-04-07T00:00:00.000Z'
    }, jasmine.any(Function));
  });

  it('should update a resource of a collection', () => {
    stubMongoClientConnect('success');
    baseResource.put('users', 123, {name: 'Fernando'});
    expect(mongodb.ObjectID).toHaveBeenCalledWith(123);
    expect(mongoDBClientCollectionMock.update).toHaveBeenCalledWith({
      _id: 123
    }, {
      $set: {
        name: 'Fernando',
        updatedAt: '2018-04-07T00:00:00.000Z'
      }
    }, jasmine.any(Function));
  });

  it('should remove a resource of a collection', () => {
    stubMongoClientConnect('success');
    baseResource.remove('users', 123);
    expect(mongodb.ObjectID).toHaveBeenCalledWith(123);
    expect(mongoDBClientCollectionMock.deleteOne).toHaveBeenCalledWith({
      _id: 123
    }, jasmine.any(Function));
  });

  it('should disconnect from mongo db client after performing query operation', () => {
    stubMongoClientConnect('success');
    baseResource.get('users').then(() => {
      expect(mongoDBClientMock.close).toHaveBeenCalled();
    });
  });

  it('should reject promise when connection to mongo db fails', () => {
    stubMongoClientConnect('error', {some: 'error'});
    baseResource.get('users').then(() => {}, err => {
      expect(err).toEqual({some: 'error'});
    });
  });

  it('should reject promise when database operation fails', () => {
    mongoDBClientCollectionMock = mockMongoDBClientCollection('error', {another: 'error'});
    stubMongoClientConnect('success');
    baseResource.get('users').then(() => {}, err => {
      expect(err).toEqual({another: 'error'});
    });
  });
});
