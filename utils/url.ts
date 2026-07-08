const REGEX_DOUBLE_SLASH = /\/\//g;

export const resolveURL = (pathname: string, baseURL: string) => {
  return `${baseURL}${pathname}`.replace(REGEX_DOUBLE_SLASH, '/');
};
