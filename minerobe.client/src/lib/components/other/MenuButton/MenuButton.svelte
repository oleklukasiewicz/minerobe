<script lang="ts">
  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";

  //components
  import Button from "$lib/components/base/Button/Button.svelte";
  import Flyout from "$lib/components/base/Flyout/Flyout.svelte";

  //icons
  import ChevronUpIcon from "$icons/chevron-up.svg?raw";
  import ChevronDownIcon from "$icons/chevron-down.svg?raw";

  interface Props {
    href?: string;
    label?: string;
    icon?: string;
    disabled?: boolean;
    onlyIcon?: boolean;
    noBorder?: boolean;
    style?: any;
    containerStyle?: any;
    whiteText?: boolean;
    flat?: boolean;
    focused?: boolean;
    type?: "primary" | "secondary" | "tertiary" | "quaternary";
    size?: "small" | "medium" | "large" | "auto";
    iconSize?: "small" | "medium" | "large" | "auto";
    textAlign?: "left" | "center" | "right";
    target?: "_blank" | "_self";
    hideMenuButton?: boolean;
    opened?: boolean;
    onclick?: (event?: any) => void;
    children?: import('svelte').Snippet;
  }

  let {
    href = null,
    label = null,
    icon = null,
    disabled = false,
    onlyIcon= false,
    noBorder = false,
    style = null,
    containerStyle = null,
    whiteText = false,
    flat = false,
    focused = false,
    type = "primary",
    size = "medium",
    iconSize = size,
    textAlign = "center",
    target = null,
    hideMenuButton = false,
    opened = $bindable(false),
    onclick = null,
    children: menuChildren
  }: Props = $props();

  let component = $state(null);
</script>

<div
  class="menu-button"
  style={containerStyle}
  bind:this={component}
  use:clickOutside={() => (opened = false)}
>
  <Button
    {onclick}
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
        onclick={() => (opened = !opened)}
      ></Button>
    </div>
  {/if}
  <Flyout
    autoWidth={false}
    preventClickOutsideClose
    bind:opened
    caller={component}
    resizable
    
  >
    {#snippet children({ position })}
        <div
        class="menu-button-content"
        class:pos-bottom={position == "bottom"}
        class:pos-top={position == "top"}
      >
        {@render menuChildren?.()}
      </div>
          {/snippet}
    </Flyout>
</div>

<style lang="scss">
  @use "MenuButton.scss";
</style>
