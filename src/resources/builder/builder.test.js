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
    resourceBuilder.build(app, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', undefined, undefined);
  });

  it('should get a single resources of a collection', () => {
    mockRequest({params: {id: 123}});
    stubBaseResource('get', 'success');
    stubAppMethod('get', true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', 123, undefined);
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

  it('should save a new resources in a collection', () => {
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdService(123);
    stubBaseResource('post', 'success');
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.post).toHaveBeenCalledWith('users', {
      _id: 123,
      name: 'Rafael'
    });
  });

  it('should handle success when saving a new resource in a collection', () => {
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdService(123);
    stubBaseResource('post', 'success');
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(201);
    expect(responseMock.send).toHaveBeenCalledWith({
      _id: 123
    });
  });

  it('should handle error when trying to save a new resource in a collection', () => {
    const err = {status: 400, body: {message: 'some kind of bad request'}};
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdService(123);
    stubBaseResource('post', 'error', err);
    stubAppMethod('post', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
  });

  it('should update resource in a collection', () => {
    const user = {name: 'Rafael'};
    mockRequest({params: {id: 123}, body: user});
    stubBaseResource('put', 'success');
    stubAppMethod('put', true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.put).toHaveBeenCalledWith('users', 123, user);
  });

  it('should handle success when updating resource in a collection', () => {
    const user = {name: 'Rafael'};
    mockRequest({params: {id: 123}, body: user});
    stubBaseResource('put', 'success');
    stubAppMethod('put', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(204);
    expect(responseMock.send).toHaveBeenCalledWith();
  });

  it('should handle error when trying to update a resource in a collection', () => {
    const err = {status: 400, body: {message: 'some kind of bad request'}};
    const user = {name: 'Rafael'};
    mockRequest({params: {id: 123}, body: user});
    stubBaseResource('put', 'error', err);
    stubAppMethod('put', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
  });

  it('should remove resource in a collection', () => {
    mockRequest({params: {id: 123}});
    stubBaseResource('remove', 'success');
    stubAppMethod('delete', true);
    resourceBuilder.build(app, 'users');
    expect(baseResource.remove).toHaveBeenCalledWith('users', 123);
  });

  it('should handle success when updating resource in a collection', () => {
    mockRequest({params: {id: 123}});
    stubBaseResource('remove', 'success');
    stubAppMethod('delete', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(204);
    expect(responseMock.send).toHaveBeenCalledWith();
  });

  it('should handle error when trying to update a resource in a collection', () => {
    const err = {status: 400, body: {message: 'some kind of bad request'}};
    mockRequest({params: {id: 123}});
    stubBaseResource('remove', 'error', err);
    stubAppMethod('delete', true);
    resourceBuilder.build(app, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(err.status);
    expect(responseMock.send).toHaveBeenCalledWith(err.body);
  });
});
