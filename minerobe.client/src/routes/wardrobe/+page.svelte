<script lang="ts">
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { FetchSettings } from "$src/api/settings";
  import { GetWardrobePackages } from "$src/api/wardrobe";
  import { APP_STATE } from "$src/data/enums/app";
  import type { PagedResponse } from "$src/data/models/base";
  import type { OutfitPackageCollection } from "$src/data/models/collection";
  import type { OutfitPackage } from "$src/data/models/package";
  import type { MinerobeUserSettingsSimple } from "$src/data/models/user";
  import { CURRENT_APP_STATE, IS_MOBILE_VIEW } from "$src/data/static";
  import { navigateToOutfitPackageEdit } from "$src/helpers/other/navigationHelper";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  import ImportPackageIcon from "$icons/upload.svg?raw";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  import MenuHeader from "$lib/components/base/MenuHeader/MenuHeader.svelte";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";
  import Search from "$lib/components/base/Search/Search.svelte";
  import Select from "$lib/components/base/Select/Select.svelte";
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/outfit";
  import { COLORS_ARRAY } from "$src/data/consts/color";

  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);
  const pageCollections: Writable<PagedResponse<OutfitPackageCollection>[]> =
    writable([]);

  let userSettings: MinerobeUserSettingsSimple = null;
  let loaded = false;
  let menuOpened = false;
  let selectedViewId = null;

  onMount(async () => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      userSettings = await FetchSettings();

      await fetchItems({});
      loaded = true;
    });
  });

  const goToEdit = function (e) {
    const item = e.detail.item;
    navigateToOutfitPackageEdit(item.id);
  };
  const fetchItems = async (e) => {
    const options = e?.detail?.options;
    const pagedItems = await GetWardrobePackages(
      undefined,
      options?.page || 0,
      options?.pageSize || 24
    );
    pageItems.update((items) => [...items, pagedItems]);
  };
</script>

<div id="wardrobe-view" class:mobile={$IS_MOBILE_VIEW}>
  <div id="navigation">
    <div>
      <Menu let:opened opened={menuOpened}>
        <MenuItemHeader
          label="Wardrobe"
          icon={MenuIcon}
          {opened}
          on:click={() => (menuOpened = !menuOpened)}
        />
        <MenuItem
          label="Sets"
          icon={AnimationIcon}
          {opened}
          selected={selectedViewId === PACKAGE_TYPE.OUTFIT_SET}
          on:click={() => (selectedViewId = PACKAGE_TYPE.OUTFIT_SET)}
        />
        <MenuItem
          {opened}
          label="Outfits"
          icon={ShoppingBagIcon}
          selected={selectedViewId === PACKAGE_TYPE.OUTFIT}
          on:click={() => (selectedViewId = PACKAGE_TYPE.OUTFIT)}
        />
        <MenuItem
          {opened}
          label="Collections"
          icon={ListIcon}
          selected={selectedViewId === PACKAGE_TYPE.OUTFIT_COLLECTION}
          on:click={() => (selectedViewId = PACKAGE_TYPE.OUTFIT_COLLECTION)}
        />
      </Menu>
    </div>
  </div>
  <div id="content">
    <div id="content-header">
      <Select placeholder="Shared" />
      <Select
        placeholder="Type"
        items={OUTFIT_TYPE_ARRAY}
        itemText="normalizedName"
        itemValue="name"
      />
      <Select
        placeholder="Colors"
        items={COLORS_ARRAY}
        itemText="normalizedName"
        itemValue="name"
        dropDownStyle="max-height: 275px"
      />
      <Search />
    </div>
    {#if loaded}
      <LazyList
        let:items={pagedItems}
        on:loading={fetchItems}
        itemsPages={$pageItems}
        rootMargin={"40px"}
      >
        <OutfitPackageList
          resizable
          on:select={goToEdit}
          resizeDebounce={10}
          currentPackageId={userSettings.currentTexturePackageId}
          baseTexture={userSettings?.baseTexture.layers[0]}
          items={pagedItems}
          columns={$IS_MOBILE_VIEW ? 3 : 6}
        />
      </LazyList>
    {/if}
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
