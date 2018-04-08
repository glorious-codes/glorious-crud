const dateService = require('./date-service');

describe('Date Service', () => {
  it('should get now date', () => {
    const date = dateService.getNow();
    expect(date.getFullYear()).toEqual(new Date().getFullYear());
    expect(date.getMonth()).toEqual(new Date().getMonth());
    expect(date.getDate()).toEqual(new Date().getDate());
    expect(date.getHours()).toEqual(new Date().getHours());
    expect(date.getMinutes()).toEqual(new Date().getMinutes());
    expect(date.getSeconds()).toEqual(new Date().getSeconds());
  });
});
