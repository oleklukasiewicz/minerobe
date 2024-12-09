<script lang="ts">
  import { PagedResponse } from "$src/data/models/base";
  import IntersectionObserver from "svelte-intersection-observer";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let itemsPages: PagedResponse<any>[] = [];
  export let rootMargin: string = "30px";

  let element;
  let itemsList: any[] = [];
  $: convertPagesToItems(itemsPages);

  const convertPagesToItems = (v) => {
    const pages = itemsPages.map((page) => page.items);
    itemsList = pages.flat();
  };

  const onNewPageNeeded = (e) => {
    if (e.detail.isIntersecting == false) return;
    const lastPage = itemsPages[itemsPages.length - 1];
    if (lastPage.items.length < lastPage.pageSize) return;
    dispatch("loading", { options: lastPage });
  };
</script>

<div class="lazy-list">
  <slot items={itemsList} />
  <IntersectionObserver
    {element}
    on:observe={onNewPageNeeded}
    {rootMargin}
    threshold={1}
  >
    <div bind:this={element}>
      {#if itemsPages[itemsPages.length - 1].items.length == itemsPages[itemsPages.length - 1].pageSize}
        <slot name="loading">loading...</slot>
      {/if}
    </div>
  </IntersectionObserver>
</div>

<style lang="scss">
</style>
