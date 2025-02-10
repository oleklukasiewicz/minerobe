export class PagedResponse<Type> {
  options: PageOptions;
  items: Type[];
  sort: SortOption[] = [];
}
export class SortOption {
  value: string;
  isDesc: boolean;
}
export class PageOptions {
  page: number;
  pageSize: number;
  total: number;
}
export class ValueData {
  value: any;
  label: string;
  constructor(value: any, label: string) {
    this.value = value;
    this.label = label;
  }
}
