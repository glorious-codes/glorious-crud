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

  it('should query filter not contain page param', () => {
    const queryParams = buildQueryParams();
    queryParams.$page = 2;
    expect(queryService.build(queryParams).filter).toEqual({username: 'rafaelcamargo'});
  });

  it('should query filter not contain page size param', () => {
    const queryParams = buildQueryParams();
    queryParams.$pageSize = 40;
    expect(queryService.build(queryParams).filter).toEqual({username: 'rafaelcamargo'});
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

  it('should skip resources if page param has been provided', () => {
    const queryParams = buildQueryParams();
    queryParams.$page = 2;
    expect(queryService.build(queryParams).skip).toEqual(30);
  });

  it('should build query limit with limit param if it has been provided', () => {
    const query = queryService.build(buildQueryParams());
    expect(query.limit).toEqual(10);
  });

  it('should build query limit with page size if it has been provided', () => {
    const queryParams = buildQueryParams();
    delete queryParams.$limit;
    queryParams.$pageSize = 40;
    expect(queryService.build(queryParams).limit).toEqual(40);
  });

  it('should build query limit with default page size if no limit nor page size params have been provided', () => {
    const DEFAULT_PAGE_SIZE = 30;
    const queryParams = buildQueryParams();
    delete queryParams.$limit;
    expect(queryService.build(queryParams).limit).toEqual(DEFAULT_PAGE_SIZE);
  });
});
