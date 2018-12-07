const mongodb = require('mongodb');
const dateService = require('../../services/date/date');
const BaseResource = require('./base');

describe('Base Resource', () => {
  let mongoDBClientMock,
    mongoDBClientCollectionMock,
    userMock,
    baseResource;

  function mockUser(){
    userMock = {
      _id: '5ad25c91d44a096d26a280be',
      name: 'Rafael',
      createdAt: '2018-04-07T00:00:00.000Z'
    };
  }

  function mockMongoDBClientCollection(responseType, response){
    const err = responseType == 'error' ? response : null;
    const result = responseType == 'success' ? response : null;
    const toArrayStub = jasmine.createSpy();
    const findOneStub = jasmine.createSpy();
    const saveStub = jasmine.createSpy();
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
      save: saveStub.and.callFake((data, callback) => {
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
    baseResource = new BaseResource('mongodb://test:27017', 'testdb');
    mockUser();
    spyOn(mongodb, 'ObjectID').and.callFake(id => id);
    spyOn(dateService, 'getNow').and.returnValue(new Date('2018-04-07'));
  });

  afterEach(() => {
    mongoDBClientCollectionMock = null;
  });

  it('should connect to mongo db client trough the proper database url', () => {
    stubMongoClientConnect('success', userMock);
    baseResource.get('users');
    expect(mongodb.MongoClient.connect).toHaveBeenCalledWith('mongodb://test:27017', jasmine.any(Function));
  });

  it('should return a promise after connecting to the mongo db client', () => {
    stubMongoClientConnect('success', userMock);
    const promise = baseResource.get('users');
    expect(promise.then).toBeDefined();
  });

  it('should get all resources of a collection', () => {
    const users = [{first: 'user'}, {second: 'user'}];
    mongoDBClientCollectionMock = mockMongoDBClientCollection('success', users);
    stubMongoClientConnect('success', userMock);
    baseResource.get('users').then(response => {
      expect(response).toEqual(users);
    });
  });

  it('should get a single resource of a collection', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect('success', userMock);
    baseResource.get('users', _id);
    expect(mongodb.ObjectID).toHaveBeenCalledWith(_id);
    expect(mongoDBClientCollectionMock.findOne).toHaveBeenCalledWith({
      _id
    }, jasmine.any(Function));
  });

  it('should throw resource not found error when trying to get a non existing resource', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect('success', userMock);
    mongoDBClientCollectionMock.findOne.and.callFake((query, callback) => {
      callback(null, null)
    });
    baseResource.get('users', _id).then(() => {}, err => {
      expect(err).toEqual({status: 404});
    });
  });

  it('should save a new resource into a collection', () => {
    stubMongoClientConnect('success', userMock);
    baseResource.post('users', {name: 'Rafael'});
    expect(mongoDBClientCollectionMock.save).toHaveBeenCalledWith({
      name: 'Rafael',
      createdAt: '2018-04-07T00:00:00.000Z'
    }, jasmine.any(Function));
  });

  it('should update a resource of a collection', () => {
    const _id = mongodb.ObjectID('5ad25c91d44a096d26a280be');
    stubMongoClientConnect('success', userMock);
    baseResource.put('users', _id, {_id, name: 'Fernando'}).then(() => {
      expect(mongoDBClientCollectionMock.update).toHaveBeenCalledWith({
        _id
      }, {
        _id,
        name: 'Fernando',
        updatedAt: '2018-04-07T00:00:00.000Z'
      }, jasmine.any(Function));
    });
  });

  it('should throw resource not found error when trying to update a non existing resource', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect('success', userMock);
    mongoDBClientCollectionMock.findOne.and.callFake((query, callback) => {
      callback(null, null)
    });
    baseResource.put('users', _id, {name: 'Fernando'}).then(() => {}, err => {
      expect(err).toEqual({status: 404});
    });
  });

  it('should remove a resource of a collection', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect('success', userMock);
    baseResource.remove('users', _id).then(() => {
      expect(mongodb.ObjectID).toHaveBeenCalledWith(_id);
      expect(mongoDBClientCollectionMock.deleteOne).toHaveBeenCalledWith({
        _id
      }, jasmine.any(Function));
    });
  });

  it('should throw resource not found error when trying to remove a non existing resource', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect('success', userMock);
    mongoDBClientCollectionMock.findOne.and.callFake((query, callback) => {
      callback(null, null)
    });
    baseResource.remove('users', _id).then(() => {}, err => {
      expect(err).toEqual({status: 404});
    });
  });

  it('should disconnect from mongo db client after performing query operation', () => {
    stubMongoClientConnect('success', userMock);
    baseResource.get('users').then(() => {
      expect(mongoDBClientMock.close).toHaveBeenCalled();
    });
  });

  it('should reject promise when connection to mongo db fails', () => {
    stubMongoClientConnect('error', {some: 'error'});
    baseResource.get('users').then(() => {}, err => {
      expect(err).toEqual({
        status: 503,
        body: {
          message: 'Failed to connect to database.'
        }
      });
    });
  });

  it('should reject promise when server throw some unexpected error', () => {
    mongoDBClientCollectionMock = mockMongoDBClientCollection('error', {some: 'error'});
    stubMongoClientConnect('success', userMock);
    baseResource.get('users').then(() => {}, err => {
      expect(err).toEqual({
        status: 500,
        body: {
          message: 'Unexpected server error.'
        }
      });
    });
  });
});
