export type OverrideExtend<T, U> = Omit<T, keyof U> & U;

export type StrictOmit<T, U extends keyof T> = {
  [K in keyof T as K extends U ? never : K]: T[K];
};
