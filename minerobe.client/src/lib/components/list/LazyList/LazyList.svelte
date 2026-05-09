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
  let requesting = false;
  const itemsList = $derived(itemsPages.flatMap((page) => page.items ?? []));

  const onNewPageNeeded = async (e) => {
    if (requesting) return;
    if (e.isIntersecting === false) return;
    const lastPage = itemsPages[itemsPages.length - 1];
    if (!lastPage) return;
    if (lastPage?.items?.length < lastPage?.options?.pageSize) return;
    const nextOptions = {
      ...(lastPage.options ?? {}),
      page: (lastPage.options?.page ?? 0) + 1,
    };
    requesting = true;
    try {
      const nextPage: PagedResponse<any> = {
        ...lastPage,
        options: nextOptions,
      } as any;
      const res: any = onloading?.({ options: nextPage });
      if (res && typeof res.then === "function") {
        await res;
      }
    } finally {
      requesting = false;
    }
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

<style lang="scss">
  /*$$__STYLE_CONTENT__$$*/
</style>
