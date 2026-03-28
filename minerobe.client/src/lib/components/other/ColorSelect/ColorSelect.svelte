<script lang="ts">
  //components
  import Button from "$lib/components/base/Button/Button.svelte";
  import Select from "$lib/components/base/Select/Select.svelte";
  //icons
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";
  import ColorBadge from "../ColorBadge/ColorBadge.svelte";

  interface Props {
    items?: any[];
    placeholder?: string;
    selectedItem?: any;
    opened?: boolean;
    itemText?: string;
    itemValue?: string;
    clearable?: boolean;
    dropDownStyle?: any;
    disabled?: boolean;
    multiple?: boolean;
    autocomplete?: boolean;
    onselect?: (event?: any) => void;
    onclear?: (event?: any) => void;
  }

  let {
    items = $bindable([]),
    placeholder = $bindable("Select"),
    selectedItem = $bindable(null),
    opened = $bindable(false),
    itemText = $bindable("label"),
    itemValue = $bindable("value"),
    clearable = $bindable(false),
    dropDownStyle = $bindable(null),
    disabled = $bindable(false),
    multiple = $bindable(false),
    autocomplete = $bindable(false),
    onselect = null,
    onclear = null
  }: Props = $props();
</script>

<Select
  {onselect}
  {onclear}
  {items}
  {placeholder}
  bind:selectedItem
  bind:opened
  {itemText}
  {itemValue}
  {clearable}
  {dropDownStyle}
  {disabled}
  {autocomplete}
  {multiple}
  
  
  
  
  
  
>
  {#snippet children({ item, selectedItemValue, comparer, multiple, index, focusedIndex })}
    <Button
      size="medium"
      flat
      noBorder
      style="height: 40px;"
      focused={index === focusedIndex}
      type={comparer(selectedItemValue, item, multiple)
        ? "primary"
        : "quaternary"}
      icon={multiple
        ? comparer(selectedItemValue, item, multiple)
          ? CheckBoxIcon
          : CheckBoxOffIcon
        : null}
      label={itemText == null ? item : item[itemText]}
      textAlign="left"
    >
      <div>
        <ColorBadge
          color={item.name}
          colorName={item.name}
          style={"margin-right:4px;"}
        />
      </div>
    </Button>
  {/snippet}
</Select>
