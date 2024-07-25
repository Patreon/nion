export const delay = async (duration) => new Promise((resolve) => setTimeout(resolve, duration));

export function getMockedComponentProps(mockedComponent) {
  if (mockedComponent.mock.calls.length === 0) {
    return undefined;
  }
  const latestCall = mockedComponent.mock.calls[mockedComponent.mock.calls.length - 1];
  return latestCall[0];
}
