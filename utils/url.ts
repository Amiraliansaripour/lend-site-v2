export const resolveURL = (pathname: string, baseURL: string) => {
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  return new URL(pathname, base).href;
};
