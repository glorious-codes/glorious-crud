const express = require('express');
const resourceBuilder = require('./builder');
const usersResource = require('./users');

describe('Users Resource', () => {
  let app = express();

  beforeEach(() => {
    spyOn(resourceBuilder, 'build');
  });

  it('should build users endpoints', () => {
    usersResource.buildEndpoints(app)
    expect(resourceBuilder.build).toHaveBeenCalledWith(app, 'users');
  });
});
