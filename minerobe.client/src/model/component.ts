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
export class ToastItem {
  message: string;
  icon: string;
  duration: number;
  action: any;
  closeable: boolean;
  type: string;
  constructor(
    message: string,
    icon: string = null,
    type: "success" | "error" | "warning" | "info" = "success",
    action: any = () => {},
    closeable: boolean = true,
    duration: number = 3000
  ) {
    this.message = message;
    this.icon = icon;
    this.duration = duration;
    this.action = action;
    this.closeable = closeable;
    this.type = type;
  }
}
