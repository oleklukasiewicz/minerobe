<script>
  import { createEventDispatcher } from "svelte";
  import { WindowResizeEvent } from "$src/helpers/other/windowEvents";

  export let debounce = 0;

  const dispatch = createEventDispatcher();
  let timeout;

  function mount(node) {
    const unsub = WindowResizeEvent.subscribe(() => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const visible = node.offsetParent === null;
        dispatch("resize", { visible: { md: visible } });
      }, debounce);
    });

    return {
      destroy() {
        clearTimeout(timeout);
        unsub();
      },
    };
  }
</script>

<div use:mount />

