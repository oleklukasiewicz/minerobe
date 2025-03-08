<script lang="ts">
  //main imports
  import { createEventDispatcher, onDestroy, onMount } from "svelte";

  export let debounce = 0;
  export let targetNode: any;

  const dispatch = createEventDispatcher();
  let timeout;
  let resizeObserver = null;
  let _targetNode = null;

  const updateTargetNode = (node) => {
    if (!node) return;
    resizeObserver?.unobserve(_targetNode);
    _targetNode = node;
    observe();
  };
  onMount(() => {
    if (targetNode) {
      updateTargetNode(targetNode);
    }
  });
  onDestroy(() => {
    clearTimeout(timeout);
    resizeObserver?.unobserve(_targetNode);
  });

  function observe() {
    if (!resizeObserver)
      resizeObserver = new ResizeObserver((entries) => {
        clearTimeout(timeout);
        if (debounce == -1) {
          dispatch("resize", {});
        }
        timeout = setTimeout(() => {
          dispatch("resize", {});
        }, debounce);
      });
    resizeObserver.observe(_targetNode);

    return {
      destroy() {
        clearTimeout(timeout);
        resizeObserver.unobserve(_targetNode);
      },
    };
  }
  $: updateTargetNode(targetNode);
</script>

<div></div>

<style lang="scss">
  div {
    display: none;
  }
</style>
