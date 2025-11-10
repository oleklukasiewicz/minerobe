<script lang="ts">
  import Resize from "$lib/components/other/Resize/Resize.svelte";
  import { IS_MOBILE_VIEW } from "$src/data/static";

  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";
  import { fly } from "svelte/transition";

  export let opened = false;
  export let caller = null;
  export let position: "top" | "left" | "right" | "bottom" | "auto" = "auto";
  export let align: "left" | "right" | "center" = "right";
  export let preventClickOutsideClose = false;
  export let autoWidth = true;
  export let resizable = false;

  let actualPosition = position;

  let component = null;
  let componentContent = null;

  const onClose = () => {
    if (opened && !preventClickOutsideClose) opened = false;
  };
  const onStateChanged = (v) => {
    let parentNode = document.body;
    if (!component || !parentNode) return;
    if (caller) {
      parentNode = caller;
    }
  };
  const calculatePosition = () => {
    const flyoutRect = component.getBoundingClientRect();
    const callerRect = caller?.getBoundingClientRect();
    if (autoWidth && !$IS_MOBILE_VIEW)
      component.style.minWidth = callerRect?.width + "px";
    else component.style.minWidth = null;
    //component.style.maxWidth = callerRect?.width + "px";
    component.style.left = null;
    component.style.right = null;
    component.style.top = null;
    component.style.bottom = null;
    component.style.maxHeight = null;
    if ($IS_MOBILE_VIEW) {
      return;
    }
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
    requestAnimationFrame(() => {
      calculatePosition();
    });
  };
  $: onStateChanged(opened);
</script>

<div
  bind:this={component}
  use:clickOutside
  class:opened
  class="flyout"
  class:closed={!opened}
  class:mobile={$IS_MOBILE_VIEW}
  on:click_outside={onClose}
>
  <Resize targetNode={caller} on:resize={onResize} debounce={100}></Resize>
  <Resize targetNode={componentContent} on:resize={onComponentResize}></Resize>
  <div bind:this={componentContent} class="flyout-content">
    <slot position={actualPosition} />
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="flyout-mobile-bg" on:click={() => (opened = false)}></div>
</div>

<style lang="scss">
  .flyout {
    position: absolute;
    z-index: 20;
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
      height: 100vh;
      .flyout-content {
        position: relative;
        width: 100%;
        max-width: 100%;
        max-height: 75vh;
        overflow: auto;
      }
      &.opened .flyout-mobile-bg {
        display: block;
      }
      .flyout-mobile-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        display: none;
        background-color: var(--color-dialog);
      }
    }
  }
</style>
