export interface IPaginate<T> {
  count: number;
  limit: number;
  page: number;
  currentPage: number;
  docs: T[];
}