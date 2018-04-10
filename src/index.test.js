const app = require('./app');

describe('Index', () => {
  beforeEach(() => {
    spyOn(app, 'init');
  });

  it('should initialize app', () => {
    const index = require('./index');
    expect(app.init).toHaveBeenCalled();
  });
});
