<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //consts
  import { COLORS } from "$src/data/consts/color";

  const dispatch = createEventDispatcher();

  export let color: string;
  export let colorName: string;
  export let selected: boolean = false;
  export let selectable: boolean = true;
  export let style: string = "";

  let normalizedColor;
  const normalizeColor = function (v) {
    const colorFromArray = COLORS[color];
    if (colorFromArray)
      normalizedColor =
        "rgb(" +
        colorFromArray.r +
        "," +
        colorFromArray.g +
        "," +
        colorFromArray.b +
        ")";
    else normalizedColor = color;
  };
  $: normalizeColor(color);

  const onClick = function (e) {
    if (!selectable) return;
    e.stopPropagation();
    dispatch("click", { color: color });
  };
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  on:click={onClick}
  class="color-badge"
  title={colorName || color}
  class:selected
  class:selectable
  style={`background-color: ${normalizedColor}; ` + style}
></span>

<style lang="scss">
  .color-badge {
    width: 16px;
    height: 16px;
    display: table;
    aspect-ratio: 1;
    border: 2px solid var(--color-theme-D2);
    &.selectable {
      &:hover {
        border-color: var(--color-accent-L1);
      }
      &.selected {
        border-color: var(--color-accent-L2);
      }
    }
  }
</style>
