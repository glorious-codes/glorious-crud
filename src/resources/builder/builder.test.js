const express = require('express');
const BaseResource = require('../base/base');
const idService = require('../../services/id/id');
const requestService = require('../../services/request/request');
const resourceBuilder = require('./builder');

describe('Resource Builder', () => {
  let app, baseResource, requestMock, responseMock, errorMock;

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

  function mockError(){
    errorMock = {status: 400, body: {message: 'error details'}};
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

  function stubIdGeneration(id){
    spyOn(idService, 'generate').and.returnValue(id);
  }

  function stubRequestValidation(err){
    spyOn(requestService, 'validate').and.returnValue(err);
  }

  beforeEach(() => {
    baseResource = new BaseResource('mongodb://test:27017', 'testdb');
    mockApp();
    mockRequest();
    mockResponse();
    mockError();
  });

  it('should build an endpoint to get some resource', () => {
    resourceBuilder.build(app, baseResource, 'users');
    expect(app.get).toHaveBeenCalledWith('/users/:id?', jasmine.any(Function));
  });

  it('should build an endpoint to save some resource', () => {
    resourceBuilder.build(app, baseResource, 'users');
    expect(app.post).toHaveBeenCalledWith('/users', jasmine.any(Function));
  });

  it('should build an endpoint to update some resource', () => {
    resourceBuilder.build(app, baseResource, 'users');
    expect(app.put).toHaveBeenCalledWith('/users/:id', jasmine.any(Function));
  });

  it('should build an endpoint to delete some resource', () => {
    resourceBuilder.build(app, baseResource, 'users');
    expect(app.delete).toHaveBeenCalledWith('/users/:id', jasmine.any(Function));
  });

  it('should get all resources of a collection', () => {
    stubBaseResource('get', 'success');
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', undefined, undefined);
  });

  it('should get a single resources of a collection', () => {
    const id = 123;
    mockRequest({params: {id}});
    stubBaseResource('get', 'success');
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', id, undefined);
  });

  it('should be able to filter resources of a collection', () => {
    const query = {createdAt: '2018-04-21T18:30:40.263Z'};
    mockRequest({query});
    stubBaseResource('get', 'success');
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(baseResource.get).toHaveBeenCalledWith('users', undefined, query);
  });

  it('should be able to overwrite default get action with a custom one', () => {
    const options = {get: jasmine.createSpy()};
    stubBaseResource('get');
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.get).toHaveBeenCalledWith(requestMock, responseMock, options);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
    expect(baseResource.get).not.toHaveBeenCalled();
  });

  it('should throw error when get request is not valid', () => {
    stubBaseResource('get');
    stubAppMethod('get', true);
    stubRequestValidation(errorMock);
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
    expect(baseResource.get).not.toHaveBeenCalled();
  });

  it('should call custom error action when trying to get resources of a collection, if it was given', () => {
    const options = {onGetError: jasmine.createSpy()};
    stubBaseResource('get', 'error', errorMock);
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onGetError).toHaveBeenCalledWith(requestMock, responseMock, errorMock);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  it('should handle error when trying to get resources of a collection', () => {
    stubBaseResource('get', 'error', errorMock);
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
  });

  it('should handle success when getting resources of a collection', () => {
    const users = [{some: 'user'}, {another: 'users'}];
    stubBaseResource('get', 'success', users);
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.send).toHaveBeenCalledWith(users);
  });

  it('should call get success callback if it was given', () => {
    const users = [{some: 'user'}, {another: 'users'}];
    const options = {onGetSuccess: jasmine.createSpy()};
    stubBaseResource('get', 'success', users);
    stubAppMethod('get', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onGetSuccess).toHaveBeenCalledWith(requestMock, responseMock, {
      status: 200,
      body: users
    });
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  it('should save a new resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('post', 'success');
    stubAppMethod('post', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(baseResource.post).toHaveBeenCalledWith('users', {
      _id: id,
      name: 'Rafael'
    });
  });

  it('should be able to overwrite default post action with a custom one', () => {
    const options = {post: jasmine.createSpy()};
    stubBaseResource('post');
    stubAppMethod('post', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.post).toHaveBeenCalledWith(requestMock, responseMock, options);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
    expect(baseResource.post).not.toHaveBeenCalled();
  });

  it('should throw error when post request is not valid', () => {
    stubBaseResource('post');
    stubAppMethod('post', true);
    stubRequestValidation(errorMock);
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
    expect(baseResource.post).not.toHaveBeenCalled();
  });

  it('should call save error callback if it was given', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    options = {onPostError: jasmine.createSpy()};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('post', 'error', errorMock);
    stubAppMethod('post', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onPostError).toHaveBeenCalledWith(requestMock, responseMock, errorMock);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  it('should handle success when saving a new resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('post', 'success');
    stubAppMethod('post', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(201);
    expect(responseMock.send).toHaveBeenCalledWith({
      _id: id
    });
  });

  it('should call post success callback if it was given', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    const options = {onPostSuccess: jasmine.createSpy()};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('post', 'success');
    stubAppMethod('post', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onPostSuccess).toHaveBeenCalledWith(requestMock, responseMock, {
      status: 201,
      body: {_id: id}
    });
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  it('should handle error when trying to save a new resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('post', 'error', errorMock);
    stubAppMethod('post', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
  });

  it('should call custom error action when trying to save resource in a collection, if it was given', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    const options = {onPostError: jasmine.createSpy()};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('post', 'error', errorMock);
    stubAppMethod('post', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onPostError).toHaveBeenCalledWith(requestMock, responseMock, errorMock);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  // it('should throw empty request body error when trying to save a new resource with no data', () => {
  //   const id = 123;
  //   const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
  //   const user = {};
  //   mockRequest({body: user});
  //   stubBaseResource('post');
  //   stubAppMethod('post', true);
  //   resourceBuilder.build(app, baseResource, 'users');
  //   expect(responseMock.status).toHaveBeenCalledWith(err.status);
  //   expect(responseMock.send).toHaveBeenCalledWith(err.body);
  //   expect(baseResource.post).not.toHaveBeenCalled();
  // });
  //
  // it('should throw empty request body error when trying to save a new resource with no attributes other than prototype attributes', () => {
  //   const id = 123;
  //   const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
  //   const protoObj = {someProto: 'attribute'};
  //   const user = Object.create(protoObj);
  //   mockRequest({body: user});
  //   stubBaseResource('post');
  //   stubAppMethod('post', true);
  //   resourceBuilder.build(app, baseResource, 'users');
  //   expect(responseMock.status).toHaveBeenCalledWith(err.status);
  //   expect(responseMock.send).toHaveBeenCalledWith(err.body);
  //   expect(baseResource.post).not.toHaveBeenCalled();
  // });
  //
  it('should update resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put', 'success');
    stubAppMethod('put', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(baseResource.put).toHaveBeenCalledWith('users', id, user);
  });

  it('should be able to overwrite default put action with a custom one', () => {
    const options = {put: jasmine.createSpy()};
    stubBaseResource('put');
    stubAppMethod('put', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.put).toHaveBeenCalledWith(requestMock, responseMock, options);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
    expect(baseResource.put).not.toHaveBeenCalled();
  });

  it('should throw error when put request is not valid', () => {
    stubBaseResource('put');
    stubAppMethod('put', true);
    stubRequestValidation(errorMock);
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
    expect(baseResource.put).not.toHaveBeenCalled();
  });

  it('should handle success when updating resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put', 'success');
    stubAppMethod('put', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(204);
    expect(responseMock.send).toHaveBeenCalledWith(undefined);
  });

  it('should call put success callback if it was given', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    const options = {onPutSuccess: jasmine.createSpy()};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put', 'success');
    stubAppMethod('put', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onPutSuccess).toHaveBeenCalledWith(requestMock, responseMock, {
      status: 204
    });
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  it('should handle error when trying to update a resource in a collection', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    mockRequest({params: {id}, body: user});
    stubBaseResource('put', 'error', errorMock);
    stubAppMethod('put', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
  });

  it('should call custom error action when trying to update resource in a collection, if it was given', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    const options = {onPutError: jasmine.createSpy()};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('put', 'error', errorMock);
    stubAppMethod('put', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onPutError).toHaveBeenCalledWith(requestMock, responseMock, errorMock);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  // it('should throw invalid id error when trying to update a resource with an invalid id', () => {
  //   const id = 123;
  //   const err = {status: 400, body: {message: 'Id should be a string of 24 hex characters.'}};
  //   const user = {name: 'Rafael'};
  //   mockRequest({params: {id}, body: user});
  //   stubBaseResource('put');
  //   stubAppMethod('put', true);
  //   stubIdValidation(false);
  //   resourceBuilder.build(app, baseResource, 'users');
  //   expect(responseMock.status).toHaveBeenCalledWith(err.status);
  //   expect(responseMock.send).toHaveBeenCalledWith(err.body);
  //   expect(baseResource.put).not.toHaveBeenCalled();
  // });
  //
  // it('should throw empty request body error when trying to update a resource with no data', () => {
  //   const id = 123;
  //   const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
  //   const user = {};
  //   mockRequest({body: user});
  //   stubBaseResource('put');
  //   stubAppMethod('put', true);
  //   stubIdValidation(true);
  //   resourceBuilder.build(app, baseResource, 'users');
  //   expect(responseMock.status).toHaveBeenCalledWith(err.status);
  //   expect(responseMock.send).toHaveBeenCalledWith(err.body);
  //   expect(baseResource.put).not.toHaveBeenCalled();
  // });
  //
  // it('should throw empty request body error when trying to update a resource with no attributes other than prototype attributes', () => {
  //   const id = 123;
  //   const err = {status: 400, body: {message: 'Request body cannot be empty.'}};
  //   const protoObj = {someProto: 'attribute'};
  //   const user = Object.create(protoObj);
  //   mockRequest({body: user});
  //   stubBaseResource('put');
  //   stubAppMethod('put', true);
  //   stubIdValidation(true);
  //   resourceBuilder.build(app, baseResource, 'users');
  //   expect(responseMock.status).toHaveBeenCalledWith(err.status);
  //   expect(responseMock.send).toHaveBeenCalledWith(err.body);
  //   expect(baseResource.put).not.toHaveBeenCalled();
  // });
  //
  it('should remove resource in a collection', () => {
    const id = 123;
    mockRequest({params: {id}});
    stubBaseResource('remove', 'success');
    stubAppMethod('delete', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(baseResource.remove).toHaveBeenCalledWith('users', id);
  });

  it('should be able to overwrite default delete action with a custom one', () => {
    const options = {delete: jasmine.createSpy()};
    stubBaseResource('remove');
    stubAppMethod('delete', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.delete).toHaveBeenCalledWith(requestMock, responseMock, options);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
    expect(baseResource.remove).not.toHaveBeenCalled();
  });

  it('should throw error when delete request is not valid', () => {
    stubBaseResource('remove');
    stubAppMethod('delete', true);
    stubRequestValidation(errorMock);
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
    expect(baseResource.remove).not.toHaveBeenCalled();
  });

  it('should handle success when removing resource in a collection', () => {
    const id = 123;
    mockRequest({params: {id}});
    stubBaseResource('remove', 'success');
    stubAppMethod('delete', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(204);
    expect(responseMock.send).toHaveBeenCalledWith(undefined);
  });

  it('should call delete success callback if it was given', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    const options = {onDeleteSuccess: jasmine.createSpy()};
    mockRequest({params: {id}, body: user});
    stubBaseResource('remove', 'success');
    stubAppMethod('delete', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onDeleteSuccess).toHaveBeenCalledWith(requestMock, responseMock, {
      status: 204
    });
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  it('should handle error when trying to remove a resource in a collection', () => {
    const id = 123;
    mockRequest({params: {id}});
    stubBaseResource('remove', 'error', errorMock);
    stubAppMethod('delete', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users');
    expect(responseMock.status).toHaveBeenCalledWith(errorMock.status);
    expect(responseMock.send).toHaveBeenCalledWith(errorMock.body);
  });

  it('should call custom error action when trying to update resource in a collection, if it was given', () => {
    const id = 123;
    const user = {name: 'Rafael'};
    const options = {onDeleteError: jasmine.createSpy()};
    mockRequest({body: user});
    stubIdGeneration(id);
    stubBaseResource('remove', 'error', errorMock);
    stubAppMethod('delete', true);
    stubRequestValidation();
    resourceBuilder.build(app, baseResource, 'users', options);
    expect(options.onDeleteError).toHaveBeenCalledWith(requestMock, responseMock, errorMock);
    expect(responseMock.status).not.toHaveBeenCalled();
    expect(responseMock.send).not.toHaveBeenCalled();
  });

  // it('should throw invalid id error when trying to remove a resource with an invalid id', () => {
  //   const id = 123;
  //   const err = {status: 400, body: {message: 'Id should be a string of 24 hex characters.'}};
  //   const user = {name: 'Rafael'};
  //   mockRequest({params: {id}, body: user});
  //   stubBaseResource('remove');
  //   stubAppMethod('delete', true);
  //   stubIdValidation(false);
  //   resourceBuilder.build(app, baseResource, 'users');
  //   expect(responseMock.status).toHaveBeenCalledWith(err.status);
  //   expect(responseMock.send).toHaveBeenCalledWith(err.body);
  //   expect(baseResource.remove).not.toHaveBeenCalled();
  // });
});
