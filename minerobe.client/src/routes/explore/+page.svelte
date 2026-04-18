<script lang="ts">
  //api
  import { GetWadrobePackagesSingleLayer } from "$src/api/wardrobe";

  //consts
  import { APP_STATE } from "$src/data/enums/app";
  import { CURRENT_APP_STATE } from "$src/data/static";

  //models
  import { PagedModel } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";

  //components
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";

  import { onDestroy, onMount } from "svelte";

  let pages = $state([]);
  let loaded = $state(false);
  let stateSub=null;
  onMount(() => {
    stateSub= CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      const model = new PagedModel<OutfitFilter>();
      model.page = 0;
      model.pageSize = 10;
      const items = await GetWadrobePackagesSingleLayer(model);
      pages.push(items);
      console.log(pages);
      loaded = true;
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });
  const loadNewpage = async (e) => {
    const lastPage = e.options;
    const model = new PagedModel<OutfitFilter>();
    model.page = lastPage?.page || 0;
    model.pageSize = lastPage?.pageSize || 10;
    const items = await GetWadrobePackagesSingleLayer(model);
    pages = [...pages, items];
  };
</script>

<div style="width: 50vw;">
  {#if loaded}
    <LazyList  itemsPages={pages} onloading={loadNewpage}>
      {#snippet children({ items })}
            <OutfitPackageList {items} />
                {/snippet}
        </LazyList>
  {/if}
</div>

<style lang="scss">
  @use "style.scss";
</style>
