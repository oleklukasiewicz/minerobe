<script lang="ts">
  //models
  import type { PagedResponse } from "$src/data/models/base";

  import IntersectionObserver from "svelte-intersection-observer";
  //models

  interface LazyListProps {
    itemsPages?: PagedResponse<any>[];
    rootMargin?: string;
    loading?: boolean;
    onloading?: ((event?: any) => void) | null;
    children?: import("svelte").Snippet<[{ items: any[] }]>;
    noitems?: import("svelte").Snippet;
    loadingContent?: import("svelte").Snippet;
  }

  let {
    itemsPages = [],
    rootMargin = "30px",
    loading = false,
    onloading = null,
    children,
    noitems,
    loadingContent,
  }: LazyListProps = $props();

  let element: HTMLElement | undefined = $state(undefined);
  const itemsList = $derived(itemsPages.flatMap((page) => page.items ?? []));

  const onNewPageNeeded = (e) => {
    if (loading) return;
    if (e.detail.isIntersecting === false) return;
    const lastPage = itemsPages[itemsPages.length - 1];
    if (lastPage != null) {
      lastPage.options.page += 1;
    }
    if (lastPage?.items?.length < lastPage?.options.pageSize) return;
    onloading?.({ options: lastPage });
  };
</script>

<div class="lazy-list">
  {#if itemsList.length == 0 && !loading}
    {#if noitems}
      {@render noitems()}
    {:else}
      <h3 class="font-center">No Items</h3>
    {/if}
  {:else if !loading}
    {@render children?.({ items: itemsList })}
  {/if}
  <IntersectionObserver {element} on:observe={onNewPageNeeded} {rootMargin}>
    <div bind:this={element}>
      {#if itemsPages[itemsPages.length - 1]?.items?.length == itemsPages[itemsPages.length - 1]?.options.pageSize}
        {#if loadingContent}
          {@render loadingContent()}
        {:else}
          loading...
        {/if}
      {/if}
    </div>
  </IntersectionObserver>
</div>

<style lang="scss">/*$$__STYLE_CONTENT__$$*/</style>
