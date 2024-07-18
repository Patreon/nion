import GenericError from './index';

describe('GenericError', () => {
  let error;
  beforeEach(() => {
    const status = 500;
    const statusText = 'Server Error';
    const response = { errors: [{ something_happened: 'boo hoo' }] };
    error = new GenericError(status, statusText, response);
  });
  it('should behave consistently', () => {
    expect(error).toMatchSnapshot();
  });
});
