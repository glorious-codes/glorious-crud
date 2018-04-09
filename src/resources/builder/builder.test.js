const express = require('express');
const baseResource = require('../base/base');
const resourceBuilder = require('./builder');
const app = express();

describe('Resource Builder', () => {
  let requestMock, responseMock;

  function mockRequest(options = {}){
    options.params = options.params || {};
    requestMock = options;
  }

  function mockResponse(){
    responseMock = {
      send: jasmine.createSpy()
    };
  }

  function stubBaseResource(responseType, response){
    const methods = ['get', 'post', 'put', 'remove'];
    for(let i = 0; i < methods.length; i++)
      spyOn(baseResource, methods[i]).and.returnValue({
        then(successCallback, errorCallback){
          if(responseType == 'success')
            successCallback(response);
          else
            errorCallback(response);
        }
      });
  }

  function stubApp(){
    const methods = ['get', 'post', 'put', 'delete'];
    for(let i = 0; i < methods.length; i++)
      spyOn(app, methods[i]).and.callFake(registerEndpointStub);
  }

  function registerEndpointStub(uri, callback){
    callback(requestMock, responseMock);
  }

  beforeEach(() => {
    mockResponse();
    stubApp();
  });

  it('should build an endpoint to get the all resources of a collection', () => {
    const users = [{some: 'user'}, {another: 'users'}];
    mockRequest();
    stubBaseResource('success', users);
    resourceBuilder.build(app, 'users');
    expect(app.get).toHaveBeenCalledWith('/users/:id?', jasmine.any(Function));
    expect(baseResource.get).toHaveBeenCalledWith('users', undefined, undefined);
    expect(responseMock.send).toHaveBeenCalledWith(users);
  });

  it('should build an endpoint to get one resource of a collection', () => {
    mockRequest({params: {id: 123}});
    stubBaseResource('success');
    resourceBuilder.build(app, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', 123, undefined);
  });

  it('should build an endpoint to save one resource in a collection', () => {
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubBaseResource('success');
    resourceBuilder.build(app, 'users');
    expect(app.post).toHaveBeenCalledWith('/users', jasmine.any(Function));
    expect(baseResource.post).toHaveBeenCalledWith('users', user);
  });

  it('should build an endpoint to update one resource of a collection', () => {
    const user = {name: 'Pedro'};
    mockRequest({params: {id: 123}, body: user});
    stubBaseResource('success');
    resourceBuilder.build(app, 'users');
    expect(app.put).toHaveBeenCalledWith('/users/:id', jasmine.any(Function));
    expect(baseResource.put).toHaveBeenCalledWith('users', 123, user);
  });

  it('should build an endpoint to remove one resource of a collection', () => {
    mockRequest({params: {id: 123}});
    stubBaseResource('success');
    resourceBuilder.build(app, 'users');
    expect(app.delete).toHaveBeenCalledWith('/users/:id', jasmine.any(Function));
    expect(baseResource.remove).toHaveBeenCalledWith('users', 123);
  });

  it('should respond error when request fails', () => {
    const err = {some: 'error'};
    mockRequest();
    stubBaseResource('error', err);
    resourceBuilder.build(app, 'users');
    expect(responseMock.send).toHaveBeenCalledWith(err);
  });

  it('should return app instance', () => {
    mockRequest();
    stubBaseResource('success');
    const appInstance = resourceBuilder.build(app, 'users');
    expect(appInstance.get).toBeDefined();
    expect(appInstance.post).toBeDefined();
    expect(appInstance.put).toBeDefined();
    expect(appInstance.delete).toBeDefined();
  });
});
