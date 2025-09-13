<script lang="ts">
  import Resize from "$lib/components/other/Resize/Resize.svelte";

  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";

  export let opened = false;
  export let caller = null;
  export let position: "top" | "left" | "right" | "bottom" | "auto" = "auto";
  export let align: "left" | "right" | "center" = "right";
  export let preventClickOutsideClose = false;
  export let addCallerHeight = false;
  export let resizable = false;

  let actualPosition = position;

  let component = null;

  const onClose = () => {
    if (opened && !preventClickOutsideClose) opened = false;
  };
  const onStateChanged = (v) => {
    if (!opened) {
      if (component) component.style.top = null;
      return;
    }
    let parentNode = document.body;
    if (caller) {
      parentNode = caller;
    }
    if (!component || !parentNode) return;
    requestAnimationFrame(() => {
      calculatePosition();
    });
  };
  const calculatePosition = () => {
    const flyoutRect = component.getBoundingClientRect();
    const callerRect = caller?.getBoundingClientRect();
    component.style.minWidth = callerRect?.width + "px";
    //component.style.maxWidth = callerRect?.width + "px";
    //calculate needed space
    if (position == "auto") {
      if (flyoutRect.height + flyoutRect.top > window.innerHeight)
        actualPosition = "top";
      else actualPosition = "bottom";
    }
    if (actualPosition == "top") {
      component.style.top = -flyoutRect.height + "px";
    }
    if (actualPosition == "bottom") {
      if (addCallerHeight) component.style.top = callerRect.height + "px";
      else component.style.top = null;
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
    component.style.minWidth = callerRect?.width + "px";
    component.style.maxWidth = callerRect?.width + "px";
  };
  $: onStateChanged(opened);
</script>

<div
  bind:this={component}
  use:clickOutside
  class:opened
  class="flyout"
  class:closed={!opened}
  on:click_outside={onClose}
>
  <Resize targetNode={caller} on:resize={onResize} debounce={100}></Resize>
  <slot position={actualPosition} />
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
  }
</style>
