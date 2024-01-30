<script lang="ts">
  export let href: string = null;
  export let label: string = null;
  export let icon: string = null;
  export let selected: boolean = false;
  export let size: "small" | "medium" | "large" = "medium";
  export let iconSize: "small" | "medium" | "large" = size;
  export let disabled: boolean = false;
  export let onlyIcon: boolean = false;
</script>

<a
on:click
on:contextmenu
  class="button"
  {href}
  class:link={href != null}
  class:icon={onlyIcon && icon != null}
  class:with-label={label != null && !onlyIcon}
  class:selected={selected}
  class:unselected={!selected}
  class:small={size === "small"}
  class:medium={size === "medium"}
  class:large={size === "large"}
  class:disabled
>
  {#if icon != null}
    <div
      class="icon"
      class:b-icon-small={iconSize === "small"}
      class:b-icon-medium={iconSize === "medium"}
      class:b-icon-large={iconSize === "large"}
    >
      {@html icon}
    </div>
  {/if}
  {#if label != null && !onlyIcon}
    <span>{label}</span>
  {/if}
  <slot />
</a>

<style lang="scss">
  @import "RatioButton.scss";
</style>
