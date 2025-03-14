<script lang="ts">
  import { IS_MOBILE_VIEW } from "$src/data/static";

  //services
  import { clickOutside } from "$src/helpers/data/componentHelper";

  export let opened = false;
  export let caller = null;
  export let position: "top" | "left" | "right" | "bottom" | "auto" = "auto";
  export let align: "left" | "right" | "center" = "right";

  let component = null;

  const onClose = () => {
    if (opened) opened = false;
  };
  const onStateChanged = (v) => {
    if (!opened) return;
    if ($IS_MOBILE_VIEW) {
    } else {
      let parentNode = document.body;
      if (caller) {
        parentNode = caller;
      }
      if (!component || !parentNode) return;
      const coords = parentNode.getBoundingClientRect();
      const flyoutCoords = component.getBoundingClientRect();

      let top = coords.top;
      let left = coords.left;
      let right = coords.left + coords.width;
      let bottom = coords.bottom;
      if (position == "bottom" || position == "auto") {
        component.style.top = bottom + "px";
      }
      if (align == "left") {
        component.style.left = left + "px";
      } else if (align == "right") {
        component.style.right = `calc(100vw - ${right}px)`;
      } else if (align == "center") {
        component.style.left =
          left + (coords.width - flyoutCoords.width) / 2 + "px";
      }
    }
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
  <slot />
</div>

<style lang="scss">
  .flyout {
    position: absolute;
    z-index: 20;
    &.opened {
      display: block;
    }
    &.closed {
      display: none;
    }
  }
</style>
