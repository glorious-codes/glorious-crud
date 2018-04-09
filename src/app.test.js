const $ = require('./providers/base');
const resources = require('./resources');
const app = require('./app');

describe('App', () => {
  beforeEach(() => {
    spyOn(resources, 'registerAll');
    spyOn(console, 'log');
    spyOn($.app, 'use');
    spyOn($.app, 'listen').and.callFake((port, callback) => {callback();});
  });

  it('should configure app cors', () => {
    app.init();
    expect($.app.use).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should config request body parser as json', () => {
    app.init();
    expect($.app.use).toHaveBeenCalledWith(jasmine.any(Function));
  });

  it('should register all resources', () => {
    app.init();
    expect(resources.registerAll).toHaveBeenCalledWith($.app);
  });

  it('should expose app on port 80 in production environment', () => {
    process.env.NODE_ENV = 'production';
    app.init();
    expect(console.log).toHaveBeenCalledWith('Running on port 80...');
  });

  it('should expose app on port 9000 in development environment', () => {
    process.env.NODE_ENV = '';
    app.init();
    expect(console.log).toHaveBeenCalledWith('Running on port 9000...');
  });
});
