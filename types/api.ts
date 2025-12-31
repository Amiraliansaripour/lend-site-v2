export type APIData<T> = { data: T };

export type PaginatedAPIData<T> = APIData<{
  data: T;
  total: number;
  per_page: number;
  last_page: number;
  current_page: number;
}>;

export type FlatPaginatedAPIData<T> = PaginatedAPIData<T>['data'];

export type Params = Record<string, string>;
