<script lang="ts">
  //models
  import type { PagedResponse } from "$data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  import type { BaseDialogProps } from "$src/data/components";

  import Dialog from "../base/Dialog/Dialog.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import OutfitPackageCollectionList from "../outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";

  interface CollectionsDialogProps extends BaseDialogProps {
    items: PagedResponse<OutfitPackageCollectionWithPackageContext>;
    loading?: boolean;
    pageSizes?: number[];
    onoptionsChanged?: (event?: any) => void;
    onselect?: (event?: any) => void;
    onunselect?: (event?: any) => void;
  }

  let {
    open = $bindable(false),
    label = "Collections",
    items,
    loading = true,
    pageSizes = [10, 20, 50, 100],
    onoptionsChanged = null,
    onselect = null,
    onunselect = null
  }: CollectionsDialogProps = $props();
</script>

<Dialog bind:open {label} >
  {#snippet children({ isMobile })}
    <div id="collection-dialog" class:mobile={isMobile}>
      <PagedList
        {onoptionsChanged}
        bind:items={items}
        {loading}
        {pageSizes}
        
        
        
      >
        {#snippet children({ items: pagedItems, pageSize: pagedPageSize, loading: pagedLoading })}
            <OutfitPackageCollectionList
            selectable
            items={pagedItems}
            pageSize={pagedPageSize}
            loading={pagedLoading}
            {onselect}
            {onunselect}
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
