module.exports = {
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
  },
  RESOURCE_NOT_FOUND: {
    status: 404
  },
  DB_UNAVAILABLE: {
    status: 503,
    body: {
      message: 'Failed to connect to database.'
    }
  },
  UNEXPECTED_ERROR: {
    status: 500,
    body: {
      message: 'Unexpected server error.'
    }
  }
};
