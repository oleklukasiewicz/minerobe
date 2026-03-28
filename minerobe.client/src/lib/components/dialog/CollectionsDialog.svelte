<script lang="ts">
  //models
  import type { PagedResponse } from "$data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  //components
  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import OutfitPackageCollectionList from "../outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";

  interface Props {
    open?: boolean;
    label?: string;
    items: PagedResponse<OutfitPackageCollectionWithPackageContext>;
    loading?: boolean;
    pageSizes?: number[];
  }

  let {
    open = $bindable(false),
    label = "Collections",
    items,
    loading = true,
    pageSizes = [10, 20, 50, 100]
  }: Props = $props();
</script>

<Dialog bind:open {label} >
  {#snippet children({ isMobile })}
    <div id="collection-dialog" class:mobile={isMobile}>
      <PagedList
        on:optionsChanged
        {items}
        {loading}
        {pageSizes}
        
        
        
      >
        {#snippet children({ items: pagedItems, pageSize: pagedPageSize, loading: pagedLoading })}
            <OutfitPackageCollectionList
            selectable
            items={pagedItems}
            pageSize={pagedPageSize}
            loading={pagedLoading}
            on:select
            on:unselect
          />
                  {/snippet}
        </PagedList>
    </div>
  {/snippet}
</Dialog>

<style lang="scss">
  #collection-dialog {
    min-width: 50vw;
    max-width: 600px;
    &.mobile {
      min-width: 100%;
      max-width: 100%;
    }
  }
</style>
