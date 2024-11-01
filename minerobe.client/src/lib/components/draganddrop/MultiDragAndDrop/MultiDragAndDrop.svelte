<script lang="ts">
  import type { ValueData } from "$src/model/base";
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  export let options: ValueData[];
  export let disabled: boolean = false;

  let isDragging = false;
  let draggingOption: any = null;

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
    const items = e.dataTransfer.items;
    dispatch("drop", { option: draggingOption.value, items: items });
    draggingOption = null;
    isDragging = false;
  };
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="multi-drag-and-drop"
  class:dragging={(isDragging || draggingOption != null) && disabled == false}
  on:dragenter={handleDragStart}
  on:dragend={handleDragEnd}
  on:dragover={handleDragOver}
  on:dragleave={handleDragEnd}
>
  {#if (isDragging || draggingOption != null) && disabled == false}
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
