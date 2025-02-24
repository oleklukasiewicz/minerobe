<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Select from "$lib/components/base/Select/Select.svelte";
  //icons
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";
  import ColorBadge from "../ColorBadge/ColorBadge.svelte";

  export let items: any[] = [];
  export let placeholder: string = "Select";
  export let selectedItem = null;
  export let opened = false;
  export let itemText = "label";
  export let itemValue = "value";
  export let clearable = false;
  export let dropDownStyle = null;
  export let disabled = false;
  export let multiple = false;
  export let autocomplete = false;
</script>

<Select
  on:select
  on:clear
  bind:items
  bind:placeholder
  bind:selectedItem
  bind:opened
  bind:itemText
  bind:itemValue
  bind:clearable
  bind:dropDownStyle
  bind:disabled
  bind:autocomplete
  bind:multiple
  let:item
  let:selectedItemValue
  let:comparer
  let:multiple
  let:index
  let:focusedIndex
>
  <Button
    size="small"
    flat
    noBorder
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
</Select>
