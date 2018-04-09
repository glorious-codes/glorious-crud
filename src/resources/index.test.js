const express = require('express');
const usersResource = require('./users');
const resourceIndex = require('./');

describe('Resource Index', () => {
  const app = express();

  beforeEach(() => {
    spyOn(usersResource, 'buildEndpoints');
  });

  it('should register users resource', () => {
    resourceIndex.registerAll(app);
    expect(usersResource.buildEndpoints).toHaveBeenCalledWith(app)
  });
});
