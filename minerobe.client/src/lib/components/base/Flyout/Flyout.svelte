<script lang="ts">
  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";

  //consts
  import { IS_MOBILE_VIEW } from "$src/data/static";

  //components
  import Resize from "$lib/components/other/Resize/Resize.svelte";

  //services

  interface FlyoutProps {
    opened?: boolean;
    caller?: any;
    position?: "top" | "left" | "right" | "bottom" | "auto";
    align?: "left" | "right" | "center";
    preventClickOutsideClose?: boolean;
    autoWidth?: boolean;
    resizable?: boolean;
    children?: import("svelte").Snippet<[any]>;
  }

  let {
    opened = $bindable(false),
    caller = null,
    position = "auto",
    align = "right",
    preventClickOutsideClose = false,
    autoWidth = true,
    resizable = false,
    children,
  }: FlyoutProps = $props();

  let actualPosition = $state("auto");
  let isPositioned = $state(false);

  let component = $state(null);
  let componentContent = $state(null);

  const onClose = () => {
    if (opened && !preventClickOutsideClose) opened = false;
  };
  const schedulePosition = () => {
    if (!component) return;
    isPositioned = false;

    if ($IS_MOBILE_VIEW) {
      actualPosition = position;
      isPositioned = true;
      return;
    }

    requestAnimationFrame(() => {
      if (!opened || !component) return;
      calculatePosition();
      isPositioned = true;
    });
  };
  const calculatePosition = () => {
    if (!component) return;
    const flyoutRect = component.getBoundingClientRect();
    const callerRect = caller?.getBoundingClientRect();

    // Clear stale inline values from previous viewport mode before recalculating.
    component.style.minWidth = null;
    component.style.maxWidth = null;
    component.style.left = null;
    component.style.right = null;
    component.style.top = null;
    component.style.bottom = null;
    component.style.maxHeight = null;

    if (autoWidth && !$IS_MOBILE_VIEW)
      component.style.minWidth = callerRect?.width + "px";
    else component.style.minWidth = null;

    if ($IS_MOBILE_VIEW) return;

    //calculate needed space
    if (position == "auto") {
      if (
        flyoutRect.height + callerRect.top + callerRect.height >
        window.innerHeight
      )
        actualPosition = "top";
      else actualPosition = "bottom";
    }
    if (actualPosition == "top") {
      component.style.bottom = "100%";
      //set maxheight
      component.style.maxHeight = callerRect.top - 50 + "px";
    }
    if (actualPosition == "bottom") {
      component.style.top = "100%";
      //set maxheight
      component.style.maxHeight =
        window.innerHeight - (callerRect.top + callerRect.height) - 50 + "px";
    }
    //align
    if (align == "left") {
      component.style.left = null;
      component.style.right = null;
    }
    if (align == "right") {
      component.style.left = null;
      component.style.right = 0 + "px";
    }
    if (align == "center") {
      component.style.left =
        callerRect.left +
        callerRect.width / 2 -
        (flyoutRect.left + flyoutRect.width / 2) +
        "px";
      component.style.right = null;
    }
  };
  const onResize = () => {
    if (!resizable) return;
    const callerRect = caller?.getBoundingClientRect();
    if (autoWidth) {
      component.style.minWidth = callerRect?.width + "px";
      component.style.maxWidth = callerRect?.width + "px";
    } else {
      component.style.minWidth = null;
      component.style.maxWidth = null;
    }
  };
  const onComponentResize = () => {
    if (!opened) return;
    requestAnimationFrame(() => calculatePosition());
  };

  $effect(() => {
    if (!opened) {
      isPositioned = false;
      return;
    }

    schedulePosition();
  });
</script>

<div
  bind:this={component}
  use:clickOutside={onClose}
  class:opened
  class:positioned={isPositioned || $IS_MOBILE_VIEW}
  class="flyout"
  class:closed={!opened}
  class:mobile={$IS_MOBILE_VIEW}
>
  <Resize targetNode={caller} onresize={onResize} debounce={0}></Resize>
  <Resize targetNode={componentContent} onresize={onComponentResize}></Resize>
  <div bind:this={componentContent} class="flyout-content">
    {@render children?.({ position: actualPosition })}
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="flyout-mobile-bg" onclick={() => (opened = false)}></div>
</div>

<style lang="scss">
  .flyout {
    position: absolute;
    z-index: 20;
    &:not(.positioned) {
      visibility: hidden;
      pointer-events: none;
    }
    &.opened {
      display: flex;
    }
    &.closed {
      display: none;
    }
    .flyout-content {
      flex: 1;
    }
    &.mobile {
      /* stick to bottom of the viewport on mobile */
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100%;
      justify-content: center;
      box-sizing: border-box;
      align-items: flex-end;
      height: 100dvh;
      min-height: 100dvh;
      .flyout-content {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 100%;
        max-height: none;
        overflow: visible;
      }
      &.opened .flyout-mobile-bg {
        display: block;
      }
      .flyout-mobile-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        display: none;
        background-color: var(--color-dialog);
      }
    }
  }
</style>
