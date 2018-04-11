const express = require('express');
const statusResource = require('./status');
const app = express();

describe('Status Resource', () => {
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
    statusResource.buildEndpoints(app)
    expect(app.get).toHaveBeenCalledWith('/status', jasmine.any(Function));
    expect(responseMock.send).toHaveBeenCalledWith({
      status: 'ok'
    });
  });
});
