<script lang="ts">
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let isDragging = false;

  const handleDragEnter = function () {
    isDragging = true;
  };
  const handleDragLeave = function () {
    isDragging = false;
  };
  const handleDragOver = function (e) {
    e.preventDefault();
  };
  const handleDrop = function (e) {
    e.preventDefault();
    const items = (Array.from(e.dataTransfer.items) as any[])
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile());

    dispatch("drop", { items: items });
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="drag-and-drop"
  class:isDragging
  on:drop={handleDrop}
  on:dragover={handleDragOver}
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
>
  <slot></slot>
</div>

<style lang="scss">
  .drag-and-drop {
    outline: 3px solid transparent;
    outline-offset: 2px;
    &.isDragging {
      outline-color: var(--color-accent);
    }
  }
</style>
