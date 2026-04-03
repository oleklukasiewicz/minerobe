export interface BaseProps {
  disabled?: boolean;
}
export interface BaseButtonProps extends BaseProps {
  label?: string;
  icon?: string;
  href?: string;
  onclick?: (event: MouseEvent) => void;
}
export interface BaseSelectableProps {
  value?: any;
  selected?: boolean;
  onselect?: (event?: any) => void;
  onunselect?: (event?: any) => void;
  onchange?: (event?: any) => void;
}

export interface BaseSelectProps extends BaseProps
{
    items?: any[];
    placeholder?: string;
    value?: any;
    opened?: boolean;
    itemText?: string;
    itemValue?: string;
    clearable?: boolean;
    dropDownStyle?: any;
    autocomplete?: boolean;
    defaultValue?: any;
    onclear?: (event?: any) => void;
    onselect?: (event?: any) => void;
}