<script lang="ts">
  //api
  import {
    GetWardrobeItemsWithCollectionContext,
    GetWardrobePackages,
  } from "$src/api/wardrobe";
  //model
  import { OutfitLayer, OutfitPackage } from "$src/data/models/package";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";
  import { PagedResponse, SortOption } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";
  //icons
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  //components
  import MenuItem from "../base/MenuItem/MenuItem.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import Menu from "../base/Menu/Menu.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import OutfitPackagePickerList from "../outfit/OutfitPackagePickerList/OutfitPackagePickerList.svelte";

  export let open = false;
  export let label = "Wardrobe";
  export let collectionId: string = null;
  export let baseTexture: OutfitLayer = null;

  let items = new PagedResponse<OutfitPackage>();
  let filter: OutfitFilter = new OutfitFilter();
  let sortOption: SortOption[] = [];
  filter.type = PACKAGE_TYPE.OUTFIT_SET;
  let abortController = new AbortController();

  const fetchItems = async (e) => {
    const options: PagedResponse<OutfitPackage> = e?.detail?.options;
    items.items = null;
    const pagedItems = await GetWardrobeItemsWithCollectionContext(
      collectionId,
      filter,
      options?.options.page || 0,
      options?.options.pageSize || 12,
      sortOption,
      abortController
    );
    items = pagedItems;
  };
  const setFilterType = async function (type) {
    filter.type = type;
    await fetchItems(null);
  };

  const onOpen = async (v) => {
    if (v) await fetchItems(null);
  };
  $: onOpen(open);
</script>

<Dialog bind:open {label}>
  <div id="wardrobe-picker-dialog">
    <div id="wardrobe-picker-navigation">
      <Menu let:opened let:top>
        <MenuItem
          label="Sets"
          icon={AnimationIcon}
          {opened}
          {top}
          on:click={() => setFilterType(PACKAGE_TYPE.OUTFIT_SET)}
          selected={filter.type == PACKAGE_TYPE.OUTFIT_SET}
        />
        <MenuItem
          {opened}
          {top}
          label="Outfits"
          icon={ShoppingBagIcon}
          on:click={() => setFilterType(PACKAGE_TYPE.OUTFIT)}
          selected={filter.type == PACKAGE_TYPE.OUTFIT}
        />
      </Menu>
    </div>
    <div id="wardrobe-picker-items">
      <PagedList
        {items}
        pageSize={items?.options.pageSize ?? 12}
        loading={items?.items == null}
        pageSizes={[6, 12, 24]}
        on:optionsChanged={fetchItems}
        let:items={pagedItems}
        let:pageSize={pagedPageSize}
        let:loading={pagedLoading}
      >
        <OutfitPackagePickerList
          baseTexture={filter.type == PACKAGE_TYPE.OUTFIT_SET
            ? baseTexture
            : null}
          selectable
          disableContext={collectionId}
          disableFunction={(context, item) => item.isInCollection}
          items={pagedItems}
          pageSize={pagedPageSize}
          loading={pagedLoading}
          on:select
        />
      </PagedList>
    </div>
  </div>
</Dialog>

<style lang="scss">
  #wardrobe-picker-dialog {
    min-width: 70vw;
    overflow: hidden;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;
    margin-top: 8px;
    #wardrobe-picker-navigation {
      min-width: 200px;
    }
  }
</style>
