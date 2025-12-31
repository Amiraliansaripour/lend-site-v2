export const debounce = <T extends unknown[] = unknown[]>(
  fn: (...args: T) => unknown,
  timeout: number = 300,
) => {
  let timer: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
    }, timeout);
  };
};
