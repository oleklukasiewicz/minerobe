<script lang="ts">
  //consts
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";

  //models
  import { OutfitLayer, OutfitPackage } from "$src/data/models/package";
  import { PagedModel, PagedResponse, SortOption } from "$src/data/models/base";
  import { OutfitFilter } from "$src/data/models/filter";

  //icons
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";

  //api
  import {
    GetWardrobeItemsWithCollectionContext,
    GetWardrobePackages,
  } from "$src/api/wardrobe";
  //model
  //icons
  //components
  import MenuItem from "../base/MenuItem/MenuItem.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import Menu from "../base/Menu/Menu.svelte";
  import PagedList from "../list/PagedList/PagedList.svelte";
  import OutfitPackagePickerList from "../outfit/OutfitPackagePickerList/OutfitPackagePickerList.svelte";
  import type { BaseDialogProps } from "$src/data/components";

  interface WardrobePickerDialogProps extends BaseDialogProps {
    open?: boolean;
    label?: string;
    collectionId?: string;
    baseTexture?: OutfitLayer;
    onselect?: (event?: any) => void;
  }

  let {
    open = $bindable(false),
    label = "Wardrobe",
    collectionId = null,
    baseTexture = null,
    onselect = null,
  }: WardrobePickerDialogProps = $props();

  let items = $state(new PagedResponse<OutfitPackage>());
  let filter: OutfitFilter = $state(new OutfitFilter());
  let sortOption: SortOption[] = [];
  filter.type = PACKAGE_TYPE.OUTFIT_SET;
  let abortController = new AbortController();

  const fetchItems = async (e) => {
    const options: PagedResponse<OutfitPackage> = e?.options;
    items.items = null;
    const pagedModel = new PagedModel<OutfitFilter>();
    pagedModel.page = options?.options.page || 0;
    pagedModel.pageSize = options?.options.pageSize || 12;
    pagedModel.filter = filter;
    pagedModel.sort = sortOption;

    const pagedItems = collectionId
      ? await GetWardrobeItemsWithCollectionContext(
          collectionId,
          pagedModel,
          abortController,
        )
      : await GetWardrobePackages(pagedModel, abortController);
    items = pagedItems;
  };
  const setFilterType = async function (type) {
    filter.type = type;
    await fetchItems(null);
  };

  const onOpen = async (v) => {
    if (v) await fetchItems(null);
  };
  $effect(() => {
    onOpen(open);
  });
</script>

<Dialog bind:open {label}>
  <div id="wardrobe-picker-dialog">
    <div id="wardrobe-picker-navigation">
      <Menu>
        {#snippet children({ opened, top })}
          <MenuItem
            label="Sets"
            icon={AnimationIcon}
            {opened}
            {top}
            onclick={() => setFilterType(PACKAGE_TYPE.OUTFIT_SET)}
            selected={filter.type == PACKAGE_TYPE.OUTFIT_SET}
          />
          <MenuItem
            {opened}
            {top}
            label="Outfits"
            icon={ShoppingBagIcon}
            onclick={() => setFilterType(PACKAGE_TYPE.OUTFIT)}
            selected={filter.type == PACKAGE_TYPE.OUTFIT}
          />
        {/snippet}
      </Menu>
    </div>
    <div id="wardrobe-picker-items">
      <PagedList
        bind:items
        pageSize={items?.options.pageSize ?? 12}
        loading={items?.items == null}
        pageSizes={[6, 12, 24]}
        onoptionsChanged={fetchItems}
      >
        {#snippet children({
          items: pagedItems,
          pageSize: pagedPageSize,
          loading: pagedLoading,
        })}
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
            {onselect}
          />
        {/snippet}
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
