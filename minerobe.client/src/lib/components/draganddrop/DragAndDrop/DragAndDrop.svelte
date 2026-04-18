<script lang="ts">
  interface DragAndDropProps {
    children?: import("svelte").Snippet;
    ondrop?: (event?: any) => void;
  }

  let { children, ondrop = null }: DragAndDropProps = $props();

  let isDragging = $state(false);

  const handleDragEnter = () => (isDragging = true);
  const handleDragLeave = () => (isDragging = false);
  const handleDragOver = function (e) {
    e.preventDefault();
  };
  const handleDrop = function (e) {
    e.preventDefault();
    const items = (Array.from(e.dataTransfer.items) as any[])
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile());

    ondrop?.({ items: items });
    isDragging = false;
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="drag-and-drop"
  class:isDragging
  ondrop={handleDrop}
  ondragover={handleDragOver}
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
>
  {@render children?.()}
</div>

<style lang="scss">
  .drag-and-drop {
    outline: 3px solid transparent;
    outline-offset: 2px;
    user-select: none;

    &.isDragging {
      outline-color: var(--color-accent);
    }
  }
</style>
