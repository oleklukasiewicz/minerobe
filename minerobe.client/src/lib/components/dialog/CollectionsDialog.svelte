<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { PagedResponse } from "$src/model/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$src/model/collection";
  //components
  import OutfitPackageCollectionListItem from "../outfit/OutfitPackageCollectionListItem/OutfitPackageCollectionListItem.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import Placeholder from "../base/Placeholder/Placeholder.svelte";
  import PagedList from "../base/PagedList/PagedList.svelte";
  import OutfitPackageCollectionList from "../outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let label = "Collections";
  export let items: PagedResponse<OutfitPackageCollectionWithPackageContext>;
  export let loading = true;

  const onSelect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("select", { item: item });
  };
  const onUnselect = (item: OutfitPackageCollectionWithPackageContext) => {
    dispatch("unselect", { item: item });
  };
</script>

<Dialog bind:open {label}>
  <div id="collection-dialog">
    <PagedList
      {items}
      {loading}
      let:items={pagedItems}
      let:loading={pagedLoading}
    >
      <OutfitPackageCollectionList items={pagedItems} loading={pagedLoading} />
    </PagedList>
  </div>
</Dialog>

<style lang="scss">
  #collection-dialog {
    min-width: 50vw;
    max-width: 600px;
  }
</style>
