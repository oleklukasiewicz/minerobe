<script lang="ts">
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let options: any[];

  let isDragging = false;
  let draggingOption: any = null;

  const handleDragStart = (e) => {
    isDragging = true;
  };
  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDragEnd = (e) => {
    isDragging = false;
  };
  const handleOptionDragStart = (option) => {
    draggingOption = option;
  };
  const handleOptionDragEnd = (option) => {
    if (draggingOption?.value == option.value) {
      draggingOption = null;
    }
  };
  const handleOptionDrop = (e) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    dispatch("drop", { option: draggingOption.value, items: items });
    draggingOption = null;
    isDragging = false;
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="multi-drag-and-drop"
  on:dragenter={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:dragleave={handleDragEnd}
>
  {#if isDragging || draggingOption != null}
    <div class="option-selection">
      {#each options as option (option.value)}
        <div
          class="drag-option"
          on:dragover={handleDragOver}
          on:drop={handleOptionDrop}
          on:dragenter={() => handleOptionDragStart(option)}
          on:dragleave={() => handleOptionDragEnd(option)}
          class:dragging={draggingOption?.value == option.value}
        >
          {option.label}
        </div>
      {/each}
    </div>
  {/if}
  <slot></slot>
</div>

<style lang="scss">
  .multi-drag-and-drop {
    position: relative;
    .option-selection {
      position: absolute;
      display: flex;
      width: 100%;
      height: 100%;
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
