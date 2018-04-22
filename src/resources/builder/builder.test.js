const express = require('express');
const baseResource = require('../base/base');
const idService = require('../../services/id/id');
const resourceBuilder = require('./builder');

describe('Resource Builder', () => {
  let app, requestMock, responseMock;

  function mockApp(){
    app = {
      get: jasmine.createSpy(),
      post: jasmine.createSpy(),
      put: jasmine.createSpy(),
      delete: jasmine.createSpy()
    };
  }

  function mockRequest(options = {}){
    options.params = options.params || {};
    requestMock = options;
  }

  function mockResponse(){
    responseMock = {
      send: jasmine.createSpy(),
      status: jasmine.createSpy()
    };
    responseMock.status.and.returnValue(responseMock);
  }

  function stubBaseResource(method, responseType, response){
    spyOn(baseResource, method).and.returnValue({
      then(successCallback, errorCallback){
        if(responseType == 'success')
          successCallback(response);
        else
          errorCallback(response);
      }
    });
  }

  function stubAppMethod(method, shouldCallEndpoint){
    app[method].and.callFake((endpoint, callback) => {
      callback(requestMock, responseMock)
    });
  }

  function stubIdValidation(isValid){
    spyOn(idService, 'isValid').and.returnValue(isValid);
  }

  function stubIdService(id){
    spyOn(idService, 'generate').and.returnValue(id);
  }

  beforeEach(() => {
    mockApp();
    mockRequest();
    mockResponse();
  });

  it('should build an endpoint to get some resource', () => {
    resourceBuilder.build(app, 'users');
    expect(app.get).toHaveBeenCalledWith('/users/:id?', jasmine.any(Function));
  });

  it('should build an endpoint to save some resource', () => {
    resourceBuilder.build(app, 'users');
    expect(app.post).toHaveBeenCalledWith('/users', jasmine.any(Function));
  });

  it('should build an endpoint to update some resource', () => {
    resourceBuilder.build(app, 'users');
    expect(app.put).toHaveBeenCalledWith('/users/:id', jasmine.any(Function));
  });

  it('should build an endpoint to delete some resource', () => {
    resourceBuilder.build(app, 'users');
    expect(app.delete).toHaveBeenCalledWith('/users/:id', jasmine.any(Function));
  });

  it('should get all resources of a collection', () => {
    stubBaseResource('get', 'success');
    stubAppMethod('get', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', undefined, undefined);
  });

  it('should get a single resources of a collection', () => {
    const id = 123;
    mockRequest({params: {id}});
    stubBaseResource('get', 'success');
    stubAppMethod('get', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', id, undefined);
  });

  it('should throw an invalid id error when trying to get a single resource with an invalid id', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'Id should be a string of 24 hex characters.'}};
    mockRequest({params: {id}});
    stubBaseResource('get');
    stubAppMethod('get', true);
    stubIdValidation(false);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
    expect(baseResource.get).not.toHaveBeenCalled();
  });

  it('should be able to filter resources of a collection', () => {
    const query = {createdAt: '2018-04-21T18:30:40.263Z'};
    mockRequest({query});
    stubBaseResource('get', 'success');
    stubAppMethod('get', true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', undefined, query);
  });

  it('should handle success when getting resources of a collection', () => {
    const users = [{some: 'user'}, {another: 'users'}];
    stubBaseResource('get', 'success', users);
    stubAppMethod('get', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.send).toHaveBeenCalledWith(users);
  });

  it('should handle error when trying to get resources of a collection', () => {
    const err = {status: 400, body: {message: 'some kind of bad request'}};
    stubBaseResource('get', 'error', err);
    stubAppMethod('get', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
  });

  it('should save a new resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdService(id);
    stubBaseResource('post', 'success');
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.post).toHaveBeenCalledWith('users', {
      _id: id,
      name: 'Rafael'
    });
  });

  it('should handle success when saving a new resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdService(id);
    stubBaseResource('post', 'success');
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(201);
    expect(responseMock.send).toHaveBeenCalledWith({
      _id: id
    });
  });

  it('should handle error when trying to save a new resource in a collection', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'some kind of bad request.'}};
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdService(id);
    stubBaseResource('post', 'error', err);
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
  });

  it('should throw empty request body error when trying to save a new resource with no data', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
    const user = {};
    mockRequest({body: user});
    stubBaseResource('post');
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
    expect(baseResource.post).not.toHaveBeenCalled();
  });

  it('should throw empty request body error when trying to save a new resource with no attributes other than prototype attributes', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
    const protoObj = {someProto: 'attribute'};
    const user = Object.create(protoObj);
    mockRequest({body: user});
    stubBaseResource('post');
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
    expect(baseResource.post).not.toHaveBeenCalled();
  });

  it('should update resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put', 'success');
    stubAppMethod('put', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.put).toHaveBeenCalledWith('users', id, user);
  });

  it('should handle success when updating resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put', 'success');
    stubAppMethod('put', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(204);
    expect(responseMock.send).toHaveBeenCalledWith();
  });

  it('should handle error when trying to update a resource in a collection', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'some kind of bad request.'}};
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put', 'error', err);
    stubAppMethod('put', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
  });

  it('should throw invalid id error when trying to update a resource with an invalid id', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'Id should be a string of 24 hex characters.'}};
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put');
    stubAppMethod('put', true);
    stubIdValidation(false);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
    expect(baseResource.put).not.toHaveBeenCalled();
  });

  it('should throw empty request body error when trying to update a resource with no data', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
    const user = {};
    mockRequest({body: user});
    stubBaseResource('put');
    stubAppMethod('put', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
    expect(baseResource.put).not.toHaveBeenCalled();
  });

  it('should throw empty request body error when trying to update a resource with no attributes other than prototype attributes', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
    const protoObj = {someProto: 'attribute'};
    const user = Object.create(protoObj);
    mockRequest({body: user});
    stubBaseResource('put');
    stubAppMethod('put', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
    expect(baseResource.put).not.toHaveBeenCalled();
  });

  it('should remove resource in a collection', () => {
    const id = 123;
    mockRequest({params: {id}});
    stubBaseResource('remove', 'success');
    stubAppMethod('delete', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.remove).toHaveBeenCalledWith('users', id);
  });

  it('should handle success when removing resource in a collection', () => {
    const id = 123;
    mockRequest({params: {id}});
    stubBaseResource('remove', 'success');
    stubAppMethod('delete', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(204);
    expect(responseMock.send).toHaveBeenCalledWith();
  });

  it('should handle error when trying to remove a resource in a collection', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'some kind of bad request'}};
    mockRequest({params: {id}});
    stubBaseResource('remove', 'error', err);
    stubAppMethod('delete', true);
    stubIdValidation(true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
  });

  it('should throw invalid id error when trying to remove a resource with an invalid id', () => {
    const id = 123;
    const err = {status: 400, body: {message: 'Id should be a string of 24 hex characters.'}};
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('remove');
    stubAppMethod('delete', true);
    stubIdValidation(false);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
    expect(baseResource.remove).not.toHaveBeenCalled();
  });
});
