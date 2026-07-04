export const resolveURL = (pathname: string, baseURL: string) => {
  const base = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
  const path = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  return new URL(path, base).href;
};
