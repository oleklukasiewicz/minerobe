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
    padding: 6px;
    box-sizing: border-box;
    aspect-ratio: 1/1;
    border: 2px solid var(--color-theme-D2);
    transition: var(--time);
    box-shadow: inset 0 0 0 2px var(--color-theme-D2);
    display: flex;
    & > img {
      image-rendering: pixelated;
    }
    &:hover {
      border-color: var(--color-theme-D5);
      background-color: var(--color-theme-D6);
      box-shadow: inset 0 0 0 2px var(--color-theme-D5);
    }
    &:active {
      border-color: var(--color-theme-D4);
      background-color: var(--color-theme-D5);
      box-shadow: inset 0 0 0 2px var(--color-theme-D4);
    }
    &.selected {
      color:var(--color-accent-font);
      border-color: var(--color-accent-L1);
      background-color: var(--color-accent);
      box-shadow: var(--shadow-button);
      border: 2px solid var(--color-theme-font);
      &:hover {
        background-color: var(--color-accent-D1);
      }
    }
  }
</style>
