<script lang="ts">
  //models
  import type { ValueData } from "$data/models/base";

  interface Props {
    options: ValueData[];
    disabled?: boolean;
    children?: import('svelte').Snippet;
    ondrop?: (event?: any) => void;
  }

  let { options, disabled = false, children ,
    ondrop = null
  }: Props = $props();

  let isDragging = $state(false);
  let draggingOption: any = $state(null);

  const handleDragStart = (e) => {
    if (disabled) return;
    isDragging = true;
  };
  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
  };
  const handleDragEnd = (e) => {
    if (disabled) return;
    isDragging = false;
  };
  const handleOptionDragStart = (option) => {
    if (disabled) return;
    draggingOption = option;
  };
  const handleOptionDragEnd = (option) => {
    if (disabled) return;
    if (draggingOption?.value == option.value) {
      draggingOption = null;
    }
  };
  const handleOptionDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    const items = (Array.from(e.dataTransfer.items) as any[])
      .filter((item) => item.kind === "file")
      .map((item) => item.getAsFile());
    ondrop?.({ option: draggingOption.value, items: items });
    draggingOption = null;
    isDragging = false;
  };
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="multi-drag-and-drop"
  class:dragging={(isDragging || draggingOption != null) && disabled == false}
  ondragenter={handleDragStart}
  ondragend={handleDragEnd}
  ondragover={handleDragOver}
  ondragleave={handleDragEnd}
>
  {#if (isDragging || draggingOption != null) && disabled == false}
    <div class="option-selection">
      {#each options as option (option.value)}
        <div
          class="drag-option"
          ondragover={handleDragOver}
          ondrop={handleOptionDrop}
          ondragenter={() => handleOptionDragStart(option)}
          ondragleave={() => handleOptionDragEnd(option)}
          class:dragging={draggingOption?.value == option.value}
        >
          {option.label}
        </div>
      {/each}
    </div>
  {/if}
  {@render children?.()}
</div>

<style lang="scss">
  .multi-drag-and-drop {
    display: inherit;
    position: relative;
    &.dragging {
      outline: 3px solid var(--color-accent);
    }
    .option-selection {
      position: absolute;
      z-index: 2;
      display: flex;
      width: 100%;
      height: 100%;
      background-color: var(--color-theme-D1);
      padding: 2px;
      box-sizing: border-box;
      .drag-option {
        flex: 1;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: minecraft;
        height: 100%;
        &.dragging {
          background-color: var(--color-accent);
          color: var(--color-accent-font);
        }
      }
    }
  }
</style>
