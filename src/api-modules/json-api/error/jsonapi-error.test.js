import JSONApiError from './index';

describe('JSONApiError', () => {
  let error;
  beforeEach(() => {
    const status = 500,
      statusText = 'Server Error',
      response = { errors: [{ something_happened: 'boo hoo' }] };
    error = new JSONApiError(status, statusText, response);
  });
  it('should behave consistently', () => {
    expect(error).toMatchSnapshot();
  });
});
