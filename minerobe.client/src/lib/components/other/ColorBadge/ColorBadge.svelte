<script lang="ts">
  import { COLORS } from "$src/data/consts";

  export let color: string;
  export let style: string = "";

  let normalizedColor;
  const normalizeColor = function () {
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
  $: normalizeColor();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<span
  on:click
  class="color-badge"
  title={color}
  style={`background-color: ${normalizedColor} ` + style}
></span>

<style lang="scss">
  .color-badge {
    width: 16px;
    height: 16px;
    display: table;
    aspect-ratio: 1;
    border: 2px solid var(--color-theme-D2);
    &:hover {
      border-color: var(--color-accent-L2);
    }
  }
</style>
