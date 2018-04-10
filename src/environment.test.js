describe('Environment', () => {
  it('should export development environment if no env argument is given', () => {
    process.env.NODE_ENV = '';
    const DEV = require('../environments/development.json');
    const ENV = require('./environment')();
    expect(ENV).toEqual(DEV);
  });

  it('should export production environment if production env argument is given', () => {
    process.env.NODE_ENV = 'production';
    const PROD = require('../environments/production.json');
    const ENV = require('./environment')();
    expect(ENV).toEqual(PROD);
  });
});
