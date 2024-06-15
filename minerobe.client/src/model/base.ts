export class PagedResponse {
  page: number;
  pageSize: number;
  total: number;
  items: any[];
  constructor(page: number, pageSize: number, total: number, items: any[]) {
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
    this.items = items;
  }
}
