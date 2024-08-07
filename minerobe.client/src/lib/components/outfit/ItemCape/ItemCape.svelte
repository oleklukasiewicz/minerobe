<script lang="ts">
  import { GetImageArea } from "$src/helpers/image/imageDataHelpers";
  import { onMount } from "svelte";

  export let selected = false;
  export let item: any = {};

  let texture = "";
  onMount(async () => {
    if (item.texture) texture = await GetImageArea(item.texture, 1, 0, 10, 10);
  });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="item-cape" class:selected title={item.name} on:click>
  <!-- svelte-ignore a11y-missing-attribute -->
  <img src={texture} />
  <slot />
</div>

<style lang="scss">
  .item-cape {
    min-height: 64px;
    max-height: 92px;
    padding: 8px;
    box-sizing: border-box;
    aspect-ratio: 1/1;
    border: 4px solid var(--color-theme-D2);
    transition: var(--time);
    display: flex;
    & > img {
      image-rendering: pixelated;
    }
    &:hover {
      border-color: var(--color-accent);
      background-color: var(--color-accent-L1);
    }
    &:active {
      border-color: var(--color-accent-L1);
      background-color: var(--color-accent-L2);
    }
    &.selected {
      border-color: var(--color-accent-L1);
      background-color: var(--color-accent);
      color: var(--color-accent-font);
      &:hover {
        border-color: var(--color-accent);
        background-color: var(--color-accent-D1);
      }
    }
  }
</style>
