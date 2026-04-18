<script lang="ts">
  //consts
  import { COLORS } from "$src/data/consts/color";
  interface ColorBadgeProps {
    color: string;
    colorName: string;
    selected?: boolean;
    selectable?: boolean;
    style?: string;
    onclick?: (event?: any) => void;
  }

  let {
    color,
    colorName,
    selected = false,
    selectable = true,
    style = "",
    onclick = null,
  }: ColorBadgeProps = $props();

  let normalizedColor = $state();
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
  $effect(() => normalizeColor(color));

  const onClick = function (e) {
    if (!selectable) return;
    e.stopPropagation();
    onclick?.({ detail: { color: color } });
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
  onclick={onClick}
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
