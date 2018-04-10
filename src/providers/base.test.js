const $ = require('./base');

describe('Appp Provider', () => {
  it('should contain an app', () => {
    expect($.app).toEqual(jasmine.any(Function));
  });
});
