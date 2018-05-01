const bodyParser = require('body-parser');
const express = require('express');
const BaseResource = require('./resources/base/base');
const resourceBuilder = require('./resources/builder/builder');
const GCrud = require('./');

describe('Index', () => {
  let app, dbUrl, dbName;

  beforeEach(() => {
    dbUrl = 'mongodb://test:27017';
    dbName = 'testdb';
    app = express();
    spyOn(resourceBuilder, 'build');
    spyOn(app, 'use');
  });

  it('should instantiate a glorious crud', () => {
    const gCrud = new GCrud(dbUrl, dbName, app);
    expect(gCrud.baseResource instanceof BaseResource).toEqual(true);
    expect(gCrud.app).toEqual(app);
  });

  it('should use body parser as json', () => {
    const gCrud = new GCrud(dbUrl, dbName, app);
    expect(gCrud.app.use).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should have a build method defined', () => {
    const gCrud = new GCrud(dbUrl, dbName, app);
    expect(gCrud.build).toBeDefined();
  });

  it('should build a resource', () => {
    const gCrud = new GCrud(dbUrl, dbName, app);
    gCrud.build('users');
    expect(resourceBuilder.build).toHaveBeenCalledWith(gCrud.app, gCrud.baseResource, 'users', undefined);
  });
});
