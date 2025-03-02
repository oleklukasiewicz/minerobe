<script lang="ts">
  //main imports
  import IntersectionObserver from "svelte-intersection-observer";
  import { createEventDispatcher } from "svelte";
  //models
  import { PagedResponse } from "$src/data/models/base";

  const dispatch = createEventDispatcher();

  export let itemsPages: PagedResponse<any>[] = [];
  export let rootMargin: string = "30px";
  export let loading: boolean = false;

  let element;
  let itemsList: any[] = [];
  $: convertPagesToItems(itemsPages);

  const convertPagesToItems = (v) => {
    const pages = itemsPages.map((page) => page.items);
    itemsList = pages.flat();
  };

  const onNewPageNeeded = (e) => {
    if (loading) return;
    if (e.detail.isIntersecting == false) return;
    const lastPage = itemsPages[itemsPages.length - 1];
    if (lastPage != null) {
      lastPage.options.page += 1;
    }
    if (lastPage?.items?.length < lastPage?.options.pageSize) return;
    dispatch("loading", { options: lastPage });
  };
</script>

<div class="lazy-list">
  {#if itemsList.length == 0 && !loading}
    <slot name="noitems"><h3 class="font-center">No Items</h3></slot>
  {:else if !loading}
    <slot items={itemsList} />
  {/if}
  <IntersectionObserver {element} on:observe={onNewPageNeeded} {rootMargin}>
    <div bind:this={element}>
      {#if itemsPages[itemsPages.length - 1]?.items?.length == itemsPages[itemsPages.length - 1]?.options.pageSize}
        <slot name="loading">loading...</slot>
      {/if}
    </div>
  </IntersectionObserver>
</div>

<style lang="scss">
</style>
