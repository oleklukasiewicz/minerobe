export class MenuItem {
  label: string;
  icon: string;
  value: string;
  type: string;
  constructor(
    label: string,
    value: string,
    icon: string = null,
    type: string = null
  ) {
    this.label = label;
    this.icon = icon;
    this.value = value;
    this.type = type;
  }
}
