const queryService = require('./query');

describe('Query Service', () => {
  function buildQueryParams(){
    return {
      username: 'rafaelcamargo',
      $sortBy: 'createdAt',
      $order: 'desc',
      $limit: '10'
    };
  }

  it('should build query filter', () => {
    const query = queryService.build(buildQueryParams());
    expect(query.filter).toEqual({username: 'rafaelcamargo'});
  });

  it('should query filter not contain sort param', () => {
    const query = queryService.build(buildQueryParams());
    expect(query.filter).toEqual({username: 'rafaelcamargo'});
  });

  it('should query filter not contain order param', () => {
    const query = queryService.build(buildQueryParams());
    expect(query.filter).toEqual({username: 'rafaelcamargo'});
  });

  it('should query filter not contain limit param', () => {
    const query = queryService.build(buildQueryParams());
    expect(query.filter).toEqual({username: 'rafaelcamargo'});
  });

  it('should build query sort by descending order', () => {
    const query = queryService.build(buildQueryParams());
    expect(query.sort).toEqual({createdAt: -1});
  });

  it('should build query sort by ascending order', () => {
    const queryParams = {$sortBy: 'createdAt', $order: 'asc'};
    const query = queryService.build(queryParams);
    expect(query.sort).toEqual({createdAt: 1});
  });

  it('should build query sort by descending order if no order has been provided', () => {
    const queryParams = {$sortBy: 'createdAt'};
    const query = queryService.build(queryParams);
    expect(query.sort).toEqual({createdAt: -1});
  });

  it('should not sort results if no sort by query param has been provided', () => {
    const queryParams = {username: 'rafaelcamargo'};
    const query = queryService.build(queryParams);
    expect(query.sort).toEqual({});
  });

  it('should build query limit', () => {
    const query = queryService.build(buildQueryParams());
    expect(query.limit).toEqual(10);
  });

  it('should no limit results if no limit query param has been provided', () => {
    const queryParams = {username: 'rafaelcamargo'};
    const query = queryService.build(queryParams);
    expect(query.limit).toEqual(0);
  });
});
