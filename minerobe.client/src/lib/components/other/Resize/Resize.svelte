<script lang="ts">
  import { run } from 'svelte/legacy';

  //main imports
  import { createEventDispatcher, onDestroy, onMount } from "svelte";

  interface Props {
    debounce?: number;
    targetNode?: any;
  }

  let { debounce = 0, targetNode = null }: Props = $props();

  const dispatch = createEventDispatcher();
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
  run(() => {
    updateTargetNode(targetNode);
  });
</script>

<div></div>

<style lang="scss">
  div {
    display: none;
  }
</style>
