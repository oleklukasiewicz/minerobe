export class PagedResponse<Type> {
  page: number;
  pageSize: number;
  total: number;
  items: Type[];
  constructor(page: number, pageSize: number, total: number, items: Type[]) {
    this.page = page;
    this.pageSize = pageSize;
    this.total = total;
    this.items = items;
  }
}
export class ValueData {
  value: any;
  label: string;
  constructor(value: any, label: string) {
    this.value = value;
    this.label = label;
  }
}
