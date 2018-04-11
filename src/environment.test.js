describe('Environment', () => {
  it('should export development environment if no env argument is given', () => {
    process.env.NODE_ENV = '';
    const DEV = require('../environments/development.json');
    const ENV = require('./environment')();
    expect(ENV).toEqual(DEV);
  });

  it('should export production environment if production env argument is given', () => {
    process.env.NODE_ENV = 'production';
    process.env.DB_USER = 'rafael';
    process.env.DB_PASS = '123';
    const PROD = require('../environments/production.json');
    const ENV = require('./environment')();
    PROD.DB.BASE_URL = PROD.DB.BASE_URL.replace('<USER>', 'rafael').replace('<PASS>', '123');
    expect(ENV).toEqual(PROD);
  });
});
