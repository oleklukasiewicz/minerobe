<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";

  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";

  export let href: string = null;
  export let label: string = null;
  export let icon: string = null;
  export let disabled: boolean = false;
  export let onlyIcon: boolean = false;
  export let noBorder = false;
  export let style = null;
  export let containerStyle = null;
  export let whiteText = false;
  export let flat = false;
  export let focused = false;
  export let type: "primary" | "secondary" | "tertiary" | "quaternary" =
    "primary";
  export let size: "small" | "medium" | "large" | "auto" = "medium";
  export let iconSize: "small" | "medium" | "large" | "auto" = size;
  export let textAlign: "left" | "center" | "right" = "center";
  export let target: "_blank" | "_self" = null;
  export let hideMenuButton: boolean = false;

  export let opened: boolean = false;

  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";
  import Flyout from "$lib/components/base/Flyout/Flyout.svelte";

  let component = null;
</script>

<div
  class="menu-button"
  style={containerStyle}
  bind:this={component}
  use:clickOutside
  on:click_outside={() => (opened = false)}
>
  <Button
    on:click
    {href}
    {label}
    {icon}
    {disabled}
    {onlyIcon}
    {noBorder}
    {style}
    {whiteText}
    {flat}
    {focused}
    {type}
    {size}
    {iconSize}
    {textAlign}
    {target}
  />
  {#if !hideMenuButton}
    <div class="menu-button-actions">
      <Button
        onlyIcon
        style="height: 100%;width: 32px;"
        iconSize="auto"
        size="auto"
        icon={opened ? ChevronUpIcon : ChevronDownIcon}
        type="primary"
        noBorder
        on:click={() => (opened = !opened)}
      ></Button>
    </div>
  {/if}
  <Flyout
    preventClickOutsideClose
    addCallerHeight
    bind:opened
    caller={component}
    resizable
    let:position
  >
    <div
      class="menu-button-content"
      class:pos-bottom={position == "bottom"}
      class:pos-top={position == "top"}
    >
      <slot />
    </div>
  </Flyout>
</div>

<style lang="scss">
  @use "MenuButton.scss";
</style>
