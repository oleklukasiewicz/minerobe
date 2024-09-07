<script lang="ts">
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import {
    appState,
    currentUser,
    defaultRenderer,
    isMobileView,
    userPreferences,
  } from "$src/data/cache";
  import { MenuItem } from "$src/model/component";

  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";
  import Sliders2Icon from "$icons/sliders-2.svg?raw";
  import PlusIcon from "$icons/plus.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import {
    APP_STATE,
    COLORS_ARRAY,
    OUTFIT_TYPE,
    OUTFIT_TYPE_ARRAY,
    PACKAGE_TYPE,
  } from "$src/data/consts";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { OutfitFilter } from "$src/model/filter";
  import Select from "$lib/components/base/Select/Select.svelte";
  import { ConvertToStringColor } from "$src/helpers/image/colorHelper";
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";
  import Search from "$lib/components/base/Search/Search.svelte";
  import { writable, type Writable } from "svelte/store";
  import type { PagedResponse } from "$src/model/base";
  import type { MinerobeUserSettingsSimple } from "$src/model/user";
  import { onMount } from "svelte";
  import { FetchSettings } from "$src/api/settings";
  import {
    AddCollectionToWardrobe,
    AddPackageToWardrobe,
    GetWadrobeCollections,
    GetWardrobePackages,
  } from "$src/api/wardrobe";
  import OutfitPackageSnapshotList from "$lib/components/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import {
    navigateToCollection,
    navigateToOutfitPackage,
    navigateToOutfitPackageEdit,
  } from "$src/helpers/other/navigationHelper";
  import OutfitPackageCollectionList from "$lib/components/outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";
  import { CreateNewOutfitPackage } from "$src/helpers/package/packageHelper";
  import { AddPackage } from "$src/api/pack";
  import { OutfitPackageCollection } from "$src/model/collection";
  import { AddCollection } from "$src/api/collection";

  const userSettings: Writable<MinerobeUserSettingsSimple> = writable(null);

  const defaultList = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  };
  const localWardobeItems: Writable<PagedResponse> = writable(defaultList);

  const defaultMenuItems: MenuItem[] = [
    new MenuItem("All", null, SubscriptionIcon),
    new MenuItem("Sets", PACKAGE_TYPE.OUTFIT_SET, AnimationIcon),
    new MenuItem("Outfits", PACKAGE_TYPE.OUTFIT, ShoppingBagIcon),
    new MenuItem("Collections", PACKAGE_TYPE.OUTFIT_COLLECTION, ListIcon),
  ];

  let loaded = false;
  let itemsLoaded = false;
  let isCreatingNew = false;
  let currentFilter: OutfitFilter =
    $userPreferences.wadrobeFilter || new OutfitFilter();

  onMount(() => {
    appState.subscribe(async (state) => {
      if (!(state == APP_STATE.READY)) return;
      if (loaded) return;

      const settings = await FetchSettings();
      userSettings.set(settings);
      loaded = true;
      await fetchItems();
    });
  });

  const onMenuItemClick = (item: any) => {
    let newFilter = new OutfitFilter();
    newFilter.type = item.detail.value;
    currentFilter = newFilter;
  };
  const comparer = (menu, filter: OutfitFilter) =>
    menu?.value?.toLowerCase() == filter?.type?.toLowerCase();

  const fetchItems = async () => {
    let items: PagedResponse;
    itemsLoaded = false;
    if (currentFilter.type == PACKAGE_TYPE.OUTFIT_COLLECTION)
      items = await GetWadrobeCollections(currentFilter.phrase);
    else items = await GetWardrobePackages(currentFilter);
    localWardobeItems.set(items);
    itemsLoaded = true;
  };

  const onFilterSet = (filter: OutfitFilter) => {
    if (!loaded) return;
    $userPreferences.wadrobeFilter = filter;
    fetchItems();
  };
  const onItemSelect = async function (e) {
    const item = e.detail.item;
    const variantId = e.detail.layer?.id;

    if (item.publisher.id != $currentUser?.id)
      navigateToOutfitPackage(item, variantId);
    else navigateToOutfitPackageEdit(item.id);
  };
  const onCollectionSelect = async function (e) {
    const item = e.detail;
    navigateToCollection(item.id);
  };

  //adding new entities
  const addNewSet = async function () {
    isCreatingNew = true;
    const newOutfit = await CreateNewOutfitPackage(
      "New Set",
      PACKAGE_TYPE.OUTFIT_SET
    );
    newOutfit.outfitType = OUTFIT_TYPE.OUTFIT_SET;
    const response = await AddPackage(newOutfit);
    if (response == null) {
      isCreatingNew = false;
      return;
    }
    const addedTowardrobe = await AddPackageToWardrobe(response.id);
    if (addedTowardrobe == null) {
      isCreatingNew = false;
      return;
    }
    navigateToOutfitPackageEdit(response.id);
  };
  const addNewOutfit = async function () {
    isCreatingNew = true;
    const newOutfit = await CreateNewOutfitPackage(
      "New Outfit",
      PACKAGE_TYPE.OUTFIT
    );
    newOutfit.outfitType = OUTFIT_TYPE.DEFAULT;
    const response = await AddPackage(newOutfit);
    if (response == null) {
      isCreatingNew = false;
      return;
    }
    const addedTowardrobe = await AddPackageToWardrobe(response.id);
    if (addedTowardrobe == null) {
      isCreatingNew = false;
      return;
    }
    navigateToOutfitPackageEdit(response.id);
  };
  const addNewCollection = async function () {
    isCreatingNew = true;
    const newCollection = new OutfitPackageCollection();
    newCollection.name = "New Collection";
    newCollection.publisherId = $currentUser?.id;
    const response = await AddCollection(newCollection);
    if (response == null) {
      isCreatingNew = false;
      return;
    }
    const addedTowardrobe = await AddCollectionToWardrobe(response.id);
    if (addedTowardrobe == null) {
      isCreatingNew = false;
      return;
    }
    navigateToCollection(response.id);
  };

  $: onFilterSet(currentFilter);
</script>

<div class="wardrobe-view" class:mobile={$isMobileView}>
  <div class="navigation">
    <div>
      <Menu
        top={$isMobileView}
        toggleable={!$isMobileView}
        items={defaultMenuItems}
        label={!$isMobileView ? "Wardrobe" : null}
        bind:open={$userPreferences.isWardobeMenuOpen}
        on:select={onMenuItemClick}
        value={currentFilter}
        {comparer}
      />
    </div>
  </div>
  <div class="content">
    <div class="header">
      <div class="upper-header">
        <h2 style="margin:0;">
          {currentFilter.type == PACKAGE_TYPE.OUTFIT
            ? "Outfits"
            : currentFilter.type == PACKAGE_TYPE.OUTFIT_SET
              ? "Sets"
              : currentFilter.type == PACKAGE_TYPE.OUTFIT_COLLECTION
                ? "Collections"
                : "All"}
        </h2>
        {#if currentFilter.type == PACKAGE_TYPE.OUTFIT || currentFilter.type == null}
          <Button
            icon={PlusIcon}
            disabled={isCreatingNew}
            size="small"
            label="Add outfit"
            textAlign="left"
            noTextOverflow
            iconSize="small"
            on:click={addNewOutfit}
          />
        {/if}
        {#if currentFilter.type == PACKAGE_TYPE.OUTFIT_SET || currentFilter.type == null}
          <Button
            icon={PlusIcon}
            disabled={isCreatingNew}
            size="small"
            label="Add set"
            textAlign="left"
            noTextOverflow
            iconSize="small"
            on:click={addNewSet}
          />
        {/if}
        {#if currentFilter.type == PACKAGE_TYPE.OUTFIT_COLLECTION}
          <Button
            icon={PlusIcon}
            disabled={isCreatingNew}
            size="small"
            label="Add collection"
            textAlign="left"
            noTextOverflow
            iconSize="small"
            on:click={addNewCollection}
          />
        {/if}
      </div>
      <div class="lower-header">
        {#if currentFilter.type != PACKAGE_TYPE.OUTFIT_COLLECTION}
          <div class="outfit-filters">
            <Select
              placeholder="Shared"
              itemText="name"
              itemValue="value"
              clearable
              items={[
                { name: "Shared", value: true },
                { name: "Not shared", value: false },
              ]}
              bind:selectedItem={currentFilter.isShared}
            ></Select>
            <Select
              items={COLORS_ARRAY}
              sorter={(a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
              }}
              placeholder="Color"
              multiple
              clearable
              bind:selectedItem={currentFilter.colors}
              itemText="normalizedName"
              itemValue="name"
              let:item
              let:itemText
              let:selectedItemValue
            >
              <Button
                textAlign="left"
                size="small"
                icon={selectedItemValue?.includes(item)
                  ? CheckBoxIcon
                  : CheckBoxOffIcon}
                type={selectedItemValue?.includes(item)
                  ? "primary"
                  : "quaternary"}
              >
                <div
                  style="display: inline-flex;gap:4px;
    max-width: calc(100% - 40px);transform:translateY(-5px)"
                >
                  <ColorBadge
                    small
                    colorName={item}
                    color={ConvertToStringColor(item)}
                  />
                  <div
                    style="white-space: nowrap;display:block;text-overflow: ellipsis;
    overflow: hidden;"
                  >
                    {item[itemText]}
                  </div>
                </div>
              </Button>
            </Select>
            {#if currentFilter.type == PACKAGE_TYPE.OUTFIT}
              <Select
                items={OUTFIT_TYPE_ARRAY}
                placeholder="Outfit type"
                bind:selectedItem={currentFilter.outfitType}
                multiple
                clearable
                itemText="normalizedName"
                itemValue="name"
              ></Select>
            {/if}
          </div>
        {:else}
          <div></div>
        {/if}
        <div></div>
        <Search dense={true} bind:value={currentFilter.phrase} />
      </div>
    </div>
    <div class="list">
      {#if currentFilter.type == PACKAGE_TYPE.OUTFIT_COLLECTION}
        <OutfitPackageCollectionList
          minItemWidth="255px"
          maxItemWidth="1fr"
          fillMethod="auto-fill"
          items={$localWardobeItems.items}
          loading={!loaded || !itemsLoaded}
          on:select={onCollectionSelect}
        />
      {:else}
        <OutfitPackageSnapshotList
          dense={false}
          currentSkinId={$userSettings?.currentTexturePackageId}
          loading={!loaded || !itemsLoaded}
          maxItemWidth="1fr"
          minItemWidth="160px"
          fillMethod="auto-fill"
          renderer={$defaultRenderer}
          baseTexture={$userSettings?.baseTexture?.layers[0]}
          withBaseTexture={$userSettings?.baseTexture?.layers.length > 0}
          items={$localWardobeItems.items}
          on:innerselect={onItemSelect}
        />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
