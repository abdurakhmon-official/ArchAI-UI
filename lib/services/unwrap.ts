const unwrap = async <T,>(promise: Promise<{ data: { data: T } }>): Promise<T> =>
  (await promise).data.data;

export { unwrap };
