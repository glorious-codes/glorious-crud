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
});
