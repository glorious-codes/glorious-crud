const idService = require('../../services/id/id');
const requestService = require('./request');

describe('Request Service', () => {
  const ERRORS = {
    INVALID_ID: {
      status: 400,
      body: {
        message: 'Id should be a string of 24 hex characters.'
      }
    },
    EMPTY_REQUEST_BODY: {
      status: 400,
      body: {
        message: 'Request body cannot be empty.'
      }
    }
  };

  function mockRequest(){
    return {
      params: {},
      body: {}
    };
  }

  function stubIdValidation(isValid){
    spyOn(idService, 'isValid').and.returnValue(isValid);
  }

  it('should throw error for get requests with an invalid id', () => {
    const req = mockRequest();
    req.params.id = 123;
    stubIdValidation(false);
    const err = requestService.validate('get', req);
    expect(err).toEqual(ERRORS.INVALID_ID);
  });

  it('should not throw error for get requests without id', () => {
    const req = mockRequest();
    const err = requestService.validate('get', req);
    expect(err).toEqual(undefined);
  });

  it('should throw error for put requests without id', () => {
    const req = mockRequest();
    const err = requestService.validate('put', req);
    expect(err).toEqual(ERRORS.INVALID_ID);
  });

  it('should throw error for put requests containing an invalid id', () => {
    const req = mockRequest();
    req.params.id = 123;
    stubIdValidation(false);
    const err = requestService.validate('put', req);
    expect(err).toEqual(ERRORS.INVALID_ID);
  });

  it('should throw error for put requests with empty body', () => {
    stubIdValidation(true);
    const req = mockRequest();
    req.params.id = 123;
    const err = requestService.validate('put', req);
    expect(err).toEqual(ERRORS.EMPTY_REQUEST_BODY);
  });

  it('should not throw error for put requests containing some body and a valid id', () => {
    const req = mockRequest();
    req.params.id = 123;
    req.body = {name: 'Rafael'};
    stubIdValidation(true);
    const err = requestService.validate('put', req);
    expect(err).toEqual(undefined);
  });

  it('should throw error for delete requests without id', () => {
    const req = mockRequest();
    const err = requestService.validate('delete', req);
    expect(err).toEqual(ERRORS.INVALID_ID);
  });

  it('should throw error for delete requests containing an invalid id', () => {
    const req = mockRequest();
    req.params.id = 123;
    stubIdValidation(false);
    const err = requestService.validate('delete', req);
    expect(err).toEqual(ERRORS.INVALID_ID);
  });

  it('should not throw error for delete requests containing a valid id', () => {
    const req = mockRequest();
    req.params.id = 123;
    stubIdValidation(true);
    const err = requestService.validate('delete', req);
    expect(err).toEqual(undefined);
  });

  it('should throw error for post requests with empty body', () => {
    const req = mockRequest();
    const err = requestService.validate('post', req);
    expect(err).toEqual(ERRORS.EMPTY_REQUEST_BODY);
  });

  it('should throw error for post requests containing only prototype attributes in body', () => {
    const req = mockRequest();
    const protoObj = {someProto: 'attribute'};
    const user = Object.create(protoObj);
    req.body = user;
    const err = requestService.validate('post', req);
    expect(err).toEqual(ERRORS.EMPTY_REQUEST_BODY);
  });

  it('should not throw error for post requests containing some body', () => {
    const req = mockRequest();
    req.body = {name: 'Rafael'};
    stubIdValidation(true);
    const err = requestService.validate('post', req);
    expect(err).toEqual(undefined);
  });
});
