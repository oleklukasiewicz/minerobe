<script lang="ts">
  //main imports
  import { onDestroy, onMount } from "svelte";

  interface Props {
    debounce?: number;
    targetNode?: any;
    onresize?: (event?: any) => void;
  }

  let { debounce = 0, targetNode = null ,
    onresize = null
  }: Props = $props();
  let timeout;
  let resizeObserver = null;
  let _targetNode = null;
  let initialized = false;

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
        if (!initialized) {
          initialized = true;
          return;
        }
        if (debounce == -1) {
          onresize?.({});
        }
        timeout = setTimeout(() => {
          onresize?.({});
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
  $effect(() => {
    updateTargetNode(targetNode);
  });
</script>

<div></div>

<style lang="scss">
  div {
    display: none;
  }
</style>
