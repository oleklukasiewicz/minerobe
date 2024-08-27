<script lang="ts">
  import {
    appState,
    currentUser,
    defaultRenderer,
    isMobileView,
    userPreferences,
  } from "$src/data/cache";
  import {
    navigateToCollection,
    navigateToHome,
    navigateToOutfitPackageEdit,
  } from "$src/helpers/other/navigationHelper";
  import { onMount } from "svelte";
  import CheckBoxIcon from "$icons/checkbox.svg?raw";
  import CheckBoxOffIcon from "$icons/checkbox-off.svg?raw";
  import Sliders2Icon from "$icons/sliders-2.svg?raw";
  import PlusIcon from "$icons/plus.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import SubscriptionIcon from "$src/icons/subscriptions.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import { GetOutfitIconFromType } from "$src/helpers/image/imageDataHelpers";
  import Search from "$component/base/Search/Search.svelte";
  import OutfitPackageSnapshotList from "$component/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import { _ } from "svelte-i18n";
  import { goto } from "$app/navigation";
  import {
    APP_STATE,
    COLORS_ARRAY,
    OUTFIT_TYPE,
    OUTFIT_TYPE_ARRAY,
    PACKAGE_TYPE,
  } from "$src/data/consts";
  import { writable, type Writable } from "svelte/store";
  import {
    AddCollectionToWardrobe,
    AddPackageToWardrobe,
    GetWadrobeCollections,
    GetWadrobeSummary,
    GetWardrobePackages,
  } from "$src/api/wardrobe";
  import { CreateNewOutfitPackage } from "$src/helpers/package/packageHelper";
  import { AddPackage } from "$src/api/pack";
  import { AddCollection } from "$src/api/collection";
  import OutfitPackageCollectionList from "$lib/components/outfit/OutfitPackageCollectionList/OutfitPackageCollectionList.svelte";
  import { FetchSettings } from "$src/api/settings";
  import type { MinerobeUserSettingsSimple } from "$src/model/user";
  import type { PagedResponse } from "$src/model/base";
  import { OutfitPackageCollection } from "$src/model/collection";
  import Select from "$lib/components/base/Select/Select.svelte";
  import ColorBadge from "$lib/components/other/ColorBadge/ColorBadge.svelte";
  import { ConvertToStringColor } from "$src/helpers/image/colorHelper";
  import { OutfitFilter } from "$src/model/filter";

  const defaultList = {
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  };
  const userSettings: Writable<MinerobeUserSettingsSimple> = writable(null);

  const localWardobeItems: Writable<PagedResponse> = writable(defaultList);
  let currentFilter: OutfitFilter =
    $userPreferences.wadrobeFilter || new OutfitFilter();
  let loaded = false;
  let itemsLoaded = false;
  let isCreatingNew = false;
  let showFilters = false;
  let isMenuOpen = $userPreferences.isWardobeMenuOpen;
  let menuItems: any[] = [
    // {
    //   label: "Schedule",
    //   value: "schedule",
    //   icon: CalendarIcon,
    // },
    {
      label: "All",
      icon: SubscriptionIcon,
      filter: {
        type: null,
      },
    },
    {
      label: "Collections",
      icon: ListIcon,
      filter: {
        type: "collection",
      },
    },
    {
      label: "Sets",
      icon: AnimationIcon,
      filter: {
        type: PACKAGE_TYPE.OUTFIT_SET,
      },
    },
    {
      label: "Outfits",
      icon: ShoppingBagIcon,
      filter: {
        type: PACKAGE_TYPE.OUTFIT,
      },
    },
  ];
  const mobileMenuItems = Array.from(menuItems);
  onMount(() => {
    appState.subscribe(async (state) => {
      if (!(state == APP_STATE.READY)) return;
      if (loaded) return;
      //const ward = await GetUserWardrobe();
      const summary = await GetWadrobeSummary();

      const settings = await FetchSettings();
      userSettings.set(settings);

      const outfitsMenuItems = summary.outfitTypes
        .map((x) => {
          return {
            label: x.outfitType,
            icon: GetOutfitIconFromType(x.outfitType),
            badge: x.count,
            filter: {
              outfitType: [x.outfitType.toLowerCase()],
              type: PACKAGE_TYPE.OUTFIT,
            },
          };
        })
        .filter(
          (x) => x.badge > 0 && x.label?.toLowerCase() != OUTFIT_TYPE.OUTFIT_SET
        );
      menuItems.push({
        type: "separator",
      });
      menuItems = [...menuItems, ...outfitsMenuItems];

      loaded = true;
      if (!loaded) return;
      await resfreshItems();
    });
  });
  const resfreshItems = async function () {
    localWardobeItems.set(defaultList);
    itemsLoaded = false;
    isCreatingNew = false;
    const type = currentFilter.type;
    if (
      type == PACKAGE_TYPE.OUTFIT_SET ||
      type == PACKAGE_TYPE.OUTFIT ||
      type == null
    ) {
      const items = await GetWardrobePackages(currentFilter);
      localWardobeItems.set(items);
    }
    if (type?.toLowerCase() == "collection") {
      const items = await GetWadrobeCollections(currentFilter.phrase);
      localWardobeItems.set(items);
    }
    itemsLoaded = true;
  };
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

  const onItemSelect = async function (e) {
    const item = e.detail.item;
    if (item.publisher.id != $currentUser?.id)
    navigateToHome();
    else navigateToOutfitPackageEdit(item.id);
  };
  const onCollectionSelect = async function (e) {
    const item = e.detail;
    navigateToCollection(item.id);
  };
  const setFilters = async function (target) {
    if (!loaded || !itemsLoaded) return;
    currentFilter = target;
    await resfreshItems();
  };
  const onMenuItemSelect = async function (e) {
    const target: OutfitFilter = e.detail.filter;
    currentFilter = structuredClone(target);
    if (target.type == "schedule") {
      goto("/schedule");
      return;
    }
    setFilters(currentFilter);
  };
  const compare = (a, b) => {
    const aFilter: OutfitFilter = a?.filter;
    const bFilter: OutfitFilter = b;

    const isOutfitTypeEmptyA =
      aFilter.outfitType?.length == 0 || aFilter.outfitType == null;
    const isOutfitTypeEmptyB =
      bFilter.outfitType?.length == 0 || bFilter.outfitType == null;

    if (aFilter.type == bFilter.type) {
      if (isOutfitTypeEmptyA && isOutfitTypeEmptyB) return true;
      if (!isOutfitTypeEmptyA && !isOutfitTypeEmptyB) {
        if (aFilter.outfitType[0] == bFilter.outfitType[0]) return true;
      }
    }
    return false;
  };

  $: setFilters(currentFilter);
  $: $userPreferences.isWardobeMenuOpen = isMenuOpen;
  $: $userPreferences.wadrobeFilter = currentFilter;
</script>

<div class="wardrobe-view" class:mobile={$isMobileView}>
  <div class="wardrobe-categories">
    {#if $isMobileView}
      <Menu
        items={mobileMenuItems}
        open
        top
        toggleable={!$isMobileView}
        label={$isMobileView ? null : "Wardrobe"}
        value={currentFilter}
        on:select={onMenuItemSelect}
        comparer={compare}
      />
    {:else}
      <Menu
        items={menuItems}
        bind:open={isMenuOpen}
        toggleable={!$isMobileView}
        label={$isMobileView ? null : "Wardrobe"}
        value={currentFilter}
        on:select={onMenuItemSelect}
        comparer={compare}
      />
    {/if}
  </div>
  <div>
    <div class="header">
      {#if !$isMobileView}
        <h2 class="inline" style="margin: 0px;flex:1;">
          {currentFilter.type || "Wardrobe"}
        </h2>
      {/if}
      <div class="filters" class:mobile={$isMobileView}>
        {#if showFilters || !$isMobileView}
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
            items={OUTFIT_TYPE_ARRAY}
            placeholder="Outfit type"
            bind:selectedItem={currentFilter.outfitType}
            multiple
            clearable
            itemText="normalizedName"
            itemValue="name"
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
                  colorName={item[itemText]}
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
        {/if}
        <div style="display:flex; gap:4px;">
          {#if $isMobileView}
            <div>
              <Button
                icon={Sliders2Icon}
                onlyIcon
                size="small"
                style="height:31.5px;padding:2px 4px"
                label="Filters"
                on:click={() => (showFilters = !showFilters)}
              ></Button>
            </div>
          {/if}
          <Search
            style="flex:1;"
            dense={true}
            bind:value={currentFilter.phrase}
          />
        </div>
      </div>
    </div>
    <div class="outfits">
      {#if currentFilter.type == null}
        <Button
          on:click={addNewSet}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label={isCreatingNew ? "Creating..." : "Create set"}
          style="position:fixed"
          disabled={isCreatingNew}
        />
        <div class="list">
          <OutfitPackageSnapshotList
            dense={false}
            currentSkinId={$userSettings?.currentTexturePackageId}
            loading={!loaded || !itemsLoaded}
            maxItemWidth="1fr"
            minItemWidth="185px"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            baseTexture={$userSettings?.baseTexture?.layers[0]}
            withBaseTexture={$userSettings?.baseTexture?.layers.length > 0}
            items={$localWardobeItems.items}
            on:innerselect={onItemSelect}
          />
        </div>
      {/if}
      {#if currentFilter.type == PACKAGE_TYPE.OUTFIT_SET}
        <Button
          on:click={addNewSet}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label={isCreatingNew ? "Creating..." : "Create set"}
          disabled={isCreatingNew}
          style="position:fixed"
        />
        <div class="list">
          <OutfitPackageSnapshotList
            dense={false}
            loading={!loaded || !itemsLoaded}
            currentSkinId={$userSettings?.currentTexturePackageId}
            maxItemWidth="1fr"
            minItemWidth="185px"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            baseTexture={$userSettings?.baseTexture?.layers[0]}
            withBaseTexture={$userSettings?.baseTexture?.layers.length > 0}
            items={$localWardobeItems.items}
            on:innerselect={onItemSelect}
          />
        </div>
      {/if}
      {#if currentFilter.type == PACKAGE_TYPE.OUTFIT}
        <Button
          on:click={addNewOutfit}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label={isCreatingNew ? "Creating..." : "Create outfit"}
          style="position:fixed"
          disabled={isCreatingNew}
        />

        <div class="list">
          <OutfitPackageSnapshotList
            dense={false}
            loading={!loaded || !itemsLoaded}
            maxItemWidth="1fr"
            minItemWidth="185px"
            fillMethod="auto-fill"
            renderer={$defaultRenderer}
            items={$localWardobeItems.items}
            on:innerselect={onItemSelect}
          />
        </div>
      {/if}
      {#if currentFilter.type == "collection"}
        <OutfitPackageCollectionList
          minItemWidth="255px"
          maxItemWidth="1fr"
          fillMethod="auto-fill"
          items={$localWardobeItems.items}
          loading={!loaded || !itemsLoaded}
          on:select={onCollectionSelect}
        />
        <Button
          on:click={addNewCollection}
          fab="dynamic"
          size="large"
          icon={PlusIcon}
          label={isCreatingNew ? "Creating..." : "Create collection"}
          style="position:fixed"
          disabled={isCreatingNew}
        />
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
