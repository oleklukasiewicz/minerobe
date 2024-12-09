<script lang="ts">
  import { PagedResponse } from "$src/data/models/base";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let itemsPages: PagedResponse<any>[] = [];

  let itemsWithPlaceholder: PagedResponse<any>[] = [];
  $: itemsWithPlaceholder = [
    ...itemsPages,
    new PagedResponse<any>(0, 0, 0, []),
  ];

  const onNewPageNeeded = () => {
    dispatch("loading", { length: itemsWithPlaceholder.length - 1 });
  };
</script>

<div class="lazy-list">
  {#each itemsWithPlaceholder as itemsPage, index}
    <slot
      items={itemsPage.items}
      loading={index == itemsWithPlaceholder.length - 1}
    />
  {/each}
</div>

<style lang="scss">
</style>
