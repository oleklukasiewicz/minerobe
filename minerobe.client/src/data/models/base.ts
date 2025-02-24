export class PagedResponse<Type> {
  options: PageOptions;
  items: Type[];
  sort: SortOption[] = [];
}
export class PagedModel<Type> {
  page: number;
  pageSize: number;
  filter: Type;
  sort: SortOption[] = [];
  FromPagedResponse(response: PagedResponse<any>) {
    this.page = response.options.page;
    this.pageSize = response.options.pageSize;
  }
}
export class SortOption {
  value: string;
  isDesc: boolean;
}
export class PageOptions {
  page: number;
  pageSize: number;
  total: number;
  constructor(page: number, pageSize: number) {
    this.page = page;
    this.pageSize = pageSize;
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
