<script lang="ts">
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";

  //icons
  import ZapIcon from "$icons/zap.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import HeartIcon from "$icons/heart.svg?raw";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";
  import MenuHeader from "$lib/components/base/MenuHeader/MenuHeader.svelte";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import {
    PagedModel,
    SortOption,
    type PagedResponse,
  } from "$src/data/models/base.js";
  import { ExploreOutfitFilter } from "$src/data/models/filter.js";
  import { writable, type Writable } from "svelte/store";
  import type { OutfitPackage } from "$src/data/models/package.js";
  import { GetExploreOutfits } from "$src/api/view/explore.js";
  import { onDestroy, onMount } from "svelte";
  import { CURRENT_APP_STATE, IS_MOBILE_VIEW } from "$src/data/static.js";
  import { APP_STATE } from "$src/data/enums/app.js";
  import LazyList from "$lib/components/list/LazyList/LazyList.svelte";
  import type { MinerobeUserSettings } from "$src/data/models/user.js";
  import { FetchSettings } from "$src/api/settings.js";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import {
    navigateToOutfitPackage,
    navigateToExplore,
  } from "$src/helpers/other/navigationHelper.js";
  import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/enums/outfit.js";

  let { data } = $props();
  let menuOpened = $state(true);
  let userSettings: MinerobeUserSettings = $state(null);
  let itemsLoaded = $state(false);
  const initialFilter = (): ExploreOutfitFilter => ({
    ...new ExploreOutfitFilter(),
    type: null,
    isPopular: true,
    phrase: "",
  });
  let filter: ExploreOutfitFilter = $state(initialFilter());
  let sortOption: SortOption[] = $state([]);
  let abortController = new AbortController();
  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);

  let stateSub = null;

  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;

      userSettings = await FetchSettings();
      await updateFilter();
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  const fetchItems = async (e) => {
    const options: PagedResponse<ExploreOutfitFilter> = e?.options;
    const pagedModel = new PagedModel<ExploreOutfitFilter>();
    pagedModel.page = options?.options.page || 0;
    pagedModel.pageSize = options?.options.pageSize || 36;
    pagedModel.filter = filter;
    pagedModel.sort = sortOption;
    const pagedItems = await GetExploreOutfits(pagedModel, abortController);
    pageItems.update((items) => [...items, pagedItems]);
  };

  const updateFilter = async (
    e: {
      filter?: Partial<ExploreOutfitFilter>;
      sort?: SortOption[];
    } = {},
  ) => {
    try {
      abortController.abort();
      abortController = new AbortController();

      const newFilter = e.filter;
      if (newFilter) {
        filter = {
          ...filter,
          ...newFilter,
          phrase: newFilter.phrase ?? filter.phrase ?? "",
        };
      }

      const newSort = e.sort;
      if (newSort) {
        sortOption = newSort;
      }

      itemsLoaded = false;
      pageItems.set([]);
      await fetchItems(null);
      itemsLoaded = true;
    } catch (e) {}
  };
  const onItemSelect = async (item) => {
    navigateToOutfitPackage(item.item, item.layer.id);
  };
  const onMenuItemSelect = async (menuItemfilter, menuItemSort = []) => {
    navigateToExplore("");
    await updateFilter({
      filter: {
        ...initialFilter(),
        isPopular: false,
        isFeatured: false,
        isNew: false,
        type: null,
        ...menuItemfilter,
        phrase: "",
      },
      sort: menuItemSort,
    });
  };
  const onQueryChange = async (query) => {
    const newfilter = new ExploreOutfitFilter();
    newfilter.phrase = query;
    await updateFilter({ filter: newfilter,sort:[] });
  };
  $effect(() => {
    const nextQuery = data.query ?? "";
    const currentQuery = filter?.phrase ?? "";

    if (nextQuery === currentQuery) return;

    onQueryChange(nextQuery);
  });
</script>

<div id="explore-page">
  <div id="navigation" class:opened={menuOpened}>
    <div>
      <Menu>
      <MenuItemHeader
        icon={MenuIcon}
        label="Explore"
        opened={menuOpened}
        onclick={() => (menuOpened = !menuOpened)}
      />
      <MenuItem
        icon={ZapIcon}
        label="Popular"
        opened={menuOpened}
        selected={filter.isPopular}
        onclick={async () => onMenuItemSelect({ isPopular: true })}
      />
      <MenuItem
        selected={filter.isFeatured}
        icon={LoaderIcon}
        label="Featured"
        opened={menuOpened}
        onclick={async () => onMenuItemSelect({ isFeatured: true })}
      />
      <MenuItem
        selected={filter.isNew}
        icon={HumanHandsUpIcon}
        label="New"
        opened={menuOpened}
        onclick={async () => onMenuItemSelect({ isNew: true })}
      />
      <MenuSeparator />
      <MenuItem
        selected={sortOption?.[0]?.value === "package.social.Downloads" &&
          sortOption?.[0]?.isDesc}
        icon={DownloadIcon}
        label="Most downloaded"
        opened={menuOpened}
        onclick={async () =>
          onMenuItemSelect({}, [
            { value: "package.social.Downloads", isDesc: true },
          ])}
      />
      <MenuItem
        selected={sortOption?.[0]?.value === "package.social.Likes" &&
          sortOption?.[0]?.isDesc}
        icon={HeartIcon}
        label="Most liked"
        opened={menuOpened}
        onclick={async () =>
          onMenuItemSelect({}, [
            { value: "package.social.Likes", isDesc: true },
          ])}
      />
      <MenuHeader label="Categories" opened={menuOpened} />
      <MenuItem
        icon={AnimationIcon}
        label="Sets"
        opened={menuOpened}
        onclick={async () =>
          onMenuItemSelect({ type: PACKAGE_TYPE.OUTFIT_SET })}
      />
      <MenuItem
        icon={ShoppingBagIcon}
        label="Outfits"
        opened={menuOpened}
        onclick={async () => onMenuItemSelect({ type: PACKAGE_TYPE.OUTFIT })}
      />
      <MenuItem icon={ListIcon} label="Collections" opened={menuOpened} />
    </Menu>
    </div>
  </div>
  <div id="content">
    <LazyList
      onloading={fetchItems}
      itemsPages={$pageItems}
      rootMargin={"100px"}
      loading={!itemsLoaded}
    >
      {#snippet children({ items })}
        <OutfitPackageList
          resizable
          onselect={onItemSelect}
          resizeDebounce={500}
          currentPackageId={userSettings.currentTexture?.packageId}
          baseTexture={userSettings?.baseTexture.layers[0]}
          {items}
          columns={$IS_MOBILE_VIEW ? 3 : 6}
        />
      {/snippet}
      {#snippet loadingContent()}
        <OutfitPackageList
          loading
          items={[]}
          pageSize={36}
          columns={$IS_MOBILE_VIEW ? 3 : 6}
        />
      {/snippet}
    </LazyList>
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
