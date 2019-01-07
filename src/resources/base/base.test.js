const mongodb = require('mongodb');
const dateService = require('../../services/date/date');
const queryService = require('../../services/query/query');
const { MongoDBClientMock, mongoDBClientMockInstance } = require('../../mocks/mongodb-client');
const { mongoDBCollectionMockInstance } = require('../../mocks/mongodb-collection');
const BaseResource = require('./base');

describe('Base Resource', () => {
  const DB_URL = 'mongodb://test:27017';
  const DB_NAME = 'testdb';
  let baseResource;

  function mockUser(){
    return {
      _id: '5ad25c91d44a096d26a280be',
      name: 'Rafael',
      createdAt: '2018-04-07T00:00:00.000Z'
    };
  }

  function stubMongoClientConnect({ connectionErr, err, response } = {}){
    mongodb.MongoClient.connect = jest.fn((url, callback) => {
      const mongoDBClientMock = new MongoDBClientMock({ err, response });
      return connectionErr ? callback(connectionErr) : callback(null, mongoDBClientMock);
    });
  }

  beforeEach(() => {
    baseResource = new BaseResource(DB_URL, DB_NAME);
    mongodb.ObjectID = jest.fn(id => id);
    dateService.getNow = jest.fn(() => new Date('2018-04-07'));
    queryService.build = jest.fn(() => { return {}; });
  });

  it('should connect to mongo db client trough the proper database url', () => {
    stubMongoClientConnect({ response: mockUser() });
    baseResource.get('users');
    expect(mongodb.MongoClient.connect).toHaveBeenCalledWith(DB_URL, jasmine.any(Function));
  });

  it('should return a promise after connecting to the mongo db client', () => {
    stubMongoClientConnect({ response: mockUser() });
    const promise = baseResource.get('users');
    expect(promise.then).toBeDefined();
  });

  it('should get all resources of a collection', () => {
    const users = [{first: 'user'}, {second: 'user'}];
    stubMongoClientConnect({ response: users });
    baseResource.get('users').then(response => {
      expect(response).toEqual(users);
    });
  });

  it('should get all resources of a collection with built in query params', () => {
    const users = [{first: 'user'}, {second: 'user'}];
    stubMongoClientConnect({ response: users });
    queryService.build = jest.fn(() => {
      return { filter: {username: 'rafael'}, sort: {createdAt: -1}, limit: 0 };
    });
    baseResource.get('users').then(() => {
      expect(mongoDBCollectionMockInstance.find).toHaveBeenCalledWith({username: 'rafael'});
      expect(mongoDBCollectionMockInstance.sort).toHaveBeenCalledWith({createdAt: -1});
      expect(mongoDBCollectionMockInstance.limit).toHaveBeenCalledWith(0);
    });
  });

  it('should get a single resource of a collection', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect({ response: mockUser() });
    baseResource.get('users', _id);
    expect(mongodb.ObjectID).toHaveBeenCalledWith(_id);
    expect(mongoDBCollectionMockInstance.findOne).toHaveBeenCalledWith({
      _id
    }, jasmine.any(Function));
  });

  it('should throw resource not found error when trying to get a non existing resource', () => {
    stubMongoClientConnect();
    baseResource.get('users', '5ad25c91d44a096d26a280be').then(() => {}, err => {
      expect(err).toEqual({status: 404});
    });
  });

  it('should save a new resource into a collection', () => {
    stubMongoClientConnect({ response: mockUser() });
    baseResource.post('users', {name: 'Rafael'});
    expect(mongoDBCollectionMockInstance.save).toHaveBeenCalledWith({
      name: 'Rafael',
      createdAt: '2018-04-07T00:00:00.000Z'
    }, jasmine.any(Function));
  });

  it('should update a resource of a collection', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect({ response: mockUser() });
    baseResource.put('users', _id, {_id, name: 'Fernando'}).then(() => {
      expect(mongoDBCollectionMockInstance.update).toHaveBeenCalledWith({
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
    stubMongoClientConnect();
    baseResource.put('users', _id, {name: 'Fernando'}).then(() => {}, err => {
      expect(err).toEqual({status: 404});
    });
  });

  it('should remove a resource of a collection', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect({response: {}});
    baseResource.remove('users', _id).then(() => {
      expect(mongodb.ObjectID).toHaveBeenCalledWith(_id);
      expect(mongoDBCollectionMockInstance.deleteOne).toHaveBeenCalledWith({
        _id
      }, jasmine.any(Function));
    });
  });

  it('should throw resource not found error when trying to remove a non existing resource', () => {
    const _id = '5ad25c91d44a096d26a280be';
    stubMongoClientConnect();
    baseResource.remove('users', _id).then(() => {}, err => {
      expect(err).toEqual({status: 404});
    });
  });

  it('should disconnect from mongo db client after performing query operation', () => {
    stubMongoClientConnect({ response: mockUser() });
    baseResource.get('users').then(() => {
      expect(mongoDBClientMockInstance.close).toHaveBeenCalled();
    });
  });

  it('should reject promise when connection to mongo db fails', done => {
    stubMongoClientConnect({connectionErr: 'error'});
    baseResource.get('users').then(() => {}, err => {
      expect(err).toEqual({
        status: 503,
        body: {
          message: 'Failed to connect to database.'
        }
      });
      done();
    });
  });

  it('should reject promise when db throws some unexpected error', () => {
    stubMongoClientConnect({ err: 'err' });
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
