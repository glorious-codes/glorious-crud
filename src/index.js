const BaseResource = require('./resources/base/base');
const resourceBuilder = require('./resources/builder/builder');

module.exports = class GCrud {
  constructor(dbUrl, dbName, app){
    this.baseResource = new BaseResource(dbUrl, dbName);
    this.app = app;
  }

  build(collectionName){
    resourceBuilder.build(this.app, this.baseResource, collectionName);
  }
}
