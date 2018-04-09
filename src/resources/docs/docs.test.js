const ENV = require('../../environment')();
const express = require('express');
const docsResource = require('./docs');
const app = express();

describe('Docs Resource', () => {
  let responseMock;

  function mockResponse(){
    responseMock = {
      send: jasmine.createSpy()
    };
  }

  beforeEach(() => {
    mockResponse();
    spyOn(app, 'get').and.callFake((uri, callback) => {
      callback(null, responseMock);
    });
  });

  it('should build users endpoints', () => {
    docsResource.buildEndpoints(app)
    expect(app.get).toHaveBeenCalledWith('/', jasmine.any(Function));
    expect(responseMock.send).toHaveBeenCalledWith({
      users: `${ENV.APP.BASE_URL}/users{/id}`,
      status: `${ENV.APP.BASE_URL}/status`
    });
  });
});
