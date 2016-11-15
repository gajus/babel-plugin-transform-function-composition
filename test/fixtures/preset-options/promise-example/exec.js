const map = async (callback, promise) => {
  const values = await promise;

  return values.map(callback);
};

const filter = async (callback, promise) => {
  const values = await promise;

  return values.filter(callback);
};

return Promise
  .resolve([
    'foo',
    'bar',
    'baz'
  ])
  ::map((currentValue) => {
    return currentValue.toUpperCase();
  })
  ::filter((currentValue) => {
    return currentValue.indexOf('B') === 0;
  })
  .then((values) => {
    assert.deepEqual(values, [
      'BAR',
      'BAZ'
    ]);
  });
