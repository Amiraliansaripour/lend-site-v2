export const resolveURL = (pathname: string, baseURL: string) => {
  const base = baseURL.replace(/\/+$/, '');
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${path}`;
};
