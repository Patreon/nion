import parseApiResponse from './index';

describe('Generic parseApiResponse', () => {
  it('should behave consistently', () => {
    expect(parseApiResponse({ camelize_this: true })).toMatchSnapshot();
  });
});
