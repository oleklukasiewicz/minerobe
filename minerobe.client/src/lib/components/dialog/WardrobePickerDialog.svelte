<script lang="ts">
  //api
  import { GetWardrobePackages } from "$src/api/wardrobe";
  //model
  import { OutfitPackage } from "$src/data/models/package";
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
  import OutfitPackageList from "../outfit/OutfitPackageList/OutfitPackageList.svelte";

  export let open = false;
  export let label = "Wardrobe";

  let items = new PagedResponse<OutfitPackage>();
  let filter: OutfitFilter = new OutfitFilter();
  let sortOption: SortOption[] = [];
  filter.type = PACKAGE_TYPE.OUTFIT_SET;
  let abortController = new AbortController();

  const fetchItems = async (e) => {
    const options: PagedResponse<OutfitPackage> = e?.detail?.options;
    const pagedItems = await GetWardrobePackages(
      filter,
      options?.options.page || 0,
      options?.options.pageSize || 6,
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
        pageSizes={[6, 12, 24]}
        on:optionsChanged={fetchItems}
        let:items={pagedItems}
        let:pageSize={pagedPageSize}
        let:loading={pagedLoading}
      >
        <OutfitPackageList
          selectable
          columns={4}
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
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px;
    margin-top: 8px;
    #wardrobe-picker-navigation {
      min-width: 150px;
    }
  }
</style>
