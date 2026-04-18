<script lang="ts">
  //main imports
  import type { BaseButtonProps } from "$data/components";
  import { onMount } from "svelte";

  interface ButtonProps extends BaseButtonProps {
    onlyIcon?: boolean;
    noBorder?: boolean;
    style?: any;
    whiteText?: boolean;
    flat?: boolean;
    focused?: boolean;
    type?: "primary" | "secondary" | "tertiary" | "quaternary";
    size?: "small" | "medium" | "large" | "auto";
    iconSize?: "small" | "medium" | "large" | "auto";
    textAlign?: "left" | "center" | "right";
    target?: "_blank" | "_self";
    fab?: "static" | "dynamic" | "expanded" | null;
    oncontextmenu?: (event: MouseEvent) => void;
    onmouseenter?: (event: MouseEvent) => void;
    onmouseleave?: (event: MouseEvent) => void;
    children?: import("svelte").Snippet;
  }

  let {
    href = null,
    label = null,
    icon = null,
    disabled = false,
    onlyIcon = false,
    noBorder = false,
    style = null,
    whiteText = false,
    flat = false,
    focused = false,
    type = "primary",
    size = "medium",
    iconSize = size,
    textAlign = "center",
    target = null,
    fab = null,
    onclick = null,
    oncontextmenu = null,
    onmouseenter = null,
    onmouseleave = null,
    children,
  }: ButtonProps = $props();

  let componentLabel = $state(null);

  const onHoverOut = function () {
    if (componentLabel == null || fab !== "dynamic") return;
    const labelWidth = componentLabel.offsetWidth;
    const marginRight = size === "small" ? 6 : size === "medium" ? 12 : 14;
    componentLabel.style.marginRight = `-${labelWidth + marginRight}px`;
  };
  const onHover = function () {
    if (componentLabel == null || fab !== "dynamic") return;
    componentLabel.style.marginRight = null;
  };
  onMount(() => setTimeout(onHoverOut, 1000));
</script>

<a
  {onclick}
  {oncontextmenu}
  onmouseenter={(event) => {
    onHover();
    onmouseenter?.(event);
  }}
  onmouseleave={(event) => {
    onHoverOut();
    onmouseleave?.(event);
  }}
  class="button"
  title={label}
  {style}
  {href}
  {target}
  class:focused
  class:flat
  class:white-text={whiteText}
  class:link={href != null}
  class:only-icon={onlyIcon}
  class:with-label={label != null && !onlyIcon}
  class:with-icon={icon != null}
  class:without-icon={!icon}
  class:no-border={noBorder}
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
  {#if !onlyIcon}
    <div class="slot-container">
      {@render children?.()}
    </div>
  {/if}
  {#if label != null && !onlyIcon}
    <span bind:this={componentLabel}>{label}</span>
  {/if}
</a>

<style lang="scss">
  @use "Button.scss";
</style>
