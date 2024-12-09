<script lang="ts">
export let variant: "unique" | "rare" | "common" |"legendary"|"ancient"  = "common";
export let dense: boolean = false;
export let text: string = "";
export let style: string = "";
</script>

<div class="label {variant}" class:dense {style}>
  {text} <slot></slot>
</div>

<style lang="scss">
  .label {
    box-sizing: border-box;
    display: inline-table;
    font-family: minecraft;
    font-size: medium;
    box-shadow: 2px 2px 1px rgba(0, 0, 0, 0.6);
    padding: 2px 8px 2px;
    text-shadow: 0 1px rgba(255, 255, 255, 0.6);
    user-select: none;
    text-align: end;
    color: var(--color-theme-font);
  }
  .label.dense {
    padding: 1px 6px;
    font-size: var(--size-font-caption);
    height: 18px;
  }
  .label.unique {
    background: linear-gradient(var(--color-unique), var(--color-unique-A1));
  }
  .label.rare {
    background: linear-gradient(var(--color-rare), var(--color-rare-A1));
  }
  .label.common {
    background: linear-gradient(var(--color-common), var(--color-common-A1));
  }
  .label.legendary {
    background: linear-gradient(var(--color-legend), var(--color-legend-A1));
  }
  .label.ancient {
    background: linear-gradient(var(--color-ancient), var(--color-ancient-A1));
  }
</style>
