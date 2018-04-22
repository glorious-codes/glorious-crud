const mongodb = require('mongodb');
const idService = require('./id');

describe('Date Service', () => {
  beforeEach(() => {
    spyOn(mongodb, 'ObjectID');
  });

  it('should generate an id', () => {
    idService.generate();
    expect(mongodb.ObjectID).toHaveBeenCalled();
  });

  it('should id be 24 hexadecimal characters long', () => {
    const id = '5adccd330a5b7e4ffc5bf1dc';
    expect(idService.isValid(id)).toEqual(true);
  });

  it('should id not to have more than 24 characters', () => {
    const id = '5adccd330a5b7e4ffc5bf1dc0';
    expect(idService.isValid(id)).toEqual(false);
  });

  it('should id not to have less than 24 characters', () => {
    const id = '5adccd330a5b7e4ffc5bf1d';
    expect(idService.isValid(id)).toEqual(false);
  });

  it('should id not to have any character other than hexadecimal characters', () => {
    const id = '5adccd330a5b7e4ffc5bf1dg';
    expect(idService.isValid(id)).toEqual(false);
  });
});
