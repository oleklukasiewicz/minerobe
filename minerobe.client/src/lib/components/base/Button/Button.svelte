<script lang="ts">
  import { onMount } from "svelte";

  export let href: string = null;
  export let label: string = null;
  export let icon: string = null;
  export let type: "primary" | "secondary" | "tertiary" | "quaternary" =
    "primary";
  export let size: "small" | "medium" | "large" = "medium";
  export let iconSize: "small" | "medium" | "large" = size;
  export let disabled: boolean = false;
  export let onlyIcon: boolean = false;
  export let textAlign: "left" | "center" | "right" = "center";
  export let style = null;
  export let altStyle: boolean = false;
  export let target: "_blank" | "_self" = "_blank";
  export let fab: "static" | "dynamic" | "expanded" | null = null;

  let component = null;
  let componentLabel = null;
  const onHoverOut = function () {
    if (componentLabel && fab === "dynamic") {
      const labelWidth = componentLabel.offsetWidth;
      const marginRight = size === "small" ? 6 : size === "medium" ? 12 : 14;
      componentLabel.style.marginRight = `-${labelWidth + marginRight}px`;
    }
  };
  const onHover = function () {
    if (componentLabel && fab === "dynamic") {
      componentLabel.style.marginRight = null;
    }
  };
  onMount(() => {
    setTimeout(onHoverOut, 1000);
  });
</script>

<a
  bind:this={component}
  on:click|stopPropagation
  on:contextmenu|stopPropagation
  on:mouseenter={onHover}
  on:mouseleave={onHoverOut}
  class="button"
  title={label}
  {style}
  {href}
  {target}
  class:link={href != null}
  class:icon={onlyIcon && icon != null}
  class:with-label={label != null && !onlyIcon}
  class:primary={type === "primary"}
  class:secondary={type === "secondary"}
  class:tertiary={type === "tertiary"}
  class:quaternary={type === "quaternary"}
  class:small={size === "small"}
  class:medium={size === "medium"}
  class:large={size === "large"}
  class:disabled
  class:text-left={textAlign === "left"}
  class:text-center={textAlign === "center"}
  class:text-right={textAlign === "right"}
  class:alt-style={altStyle}
  class:fab={fab != null}
  class:fab-static={fab === "static"}
  class:fab-dynamic={fab === "dynamic"}
  class:fab-expanded={fab === "expanded"}
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
    <span bind:this={componentLabel}>{label}</span>
  {/if}
  <slot />
</a>

<style lang="scss">
  @import "Button.scss";
</style>
