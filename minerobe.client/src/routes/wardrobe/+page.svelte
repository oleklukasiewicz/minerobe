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

  const pageItems: Writable<PagedResponse<OutfitPackage>[]> = writable([]);
  const pageCollections: Writable<PagedResponse<OutfitPackageCollection>[]> =
    writable([]);

  let userSettings: MinerobeUserSettingsSimple = null;
  let loaded = false;

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
    console.log(pagedItems);
    pageItems.update((items) => [...items, pagedItems]);
  };
</script>

<div id="wardrobe-view" class:mobile={$IS_MOBILE_VIEW}>
  <div class="navigation"></div>
  <div class="content">
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
