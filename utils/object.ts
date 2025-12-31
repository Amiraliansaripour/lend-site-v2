export const merge = <T extends Record<string, unknown>>(src: Record<string, unknown>, dest: T) => {
  const clonedDest = { ...dest } as Record<string, unknown>;

  Object.keys(src).forEach(key => {
    clonedDest[key] = src[key] ?? dest[key];
  });

  return clonedDest as T;
};

export const pick = (obj: Record<string, unknown>, keys: string[]) => {
  return keys.reduce<Record<string, unknown>>((acc, curr) => {
    if (curr in obj) acc[curr] = obj[curr];
    return acc;
  }, {});
};

/**
 * * type-safe version of the `pick` util
 */
export const strictPick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  return keys.reduce(
    (acc, curr) => {
      acc[curr] = obj[curr];
      return acc;
    },
    {} as Pick<T, K>,
  );
};
