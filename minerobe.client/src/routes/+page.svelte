<script lang="ts">
  import OutfitPackageSnapshotList from "$component/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import { FetchSettings } from "$src/api/settings";
  import {
    GetMostLiked,
    GetMostRecent,
    GetMostDownloaded,
  } from "$src/api/view/landing";
  import { appState, defaultRenderer, isMobileView } from "$src/data/cache";
  import { APP_STATE } from "$src/data/consts";
  import { navigateToOutfitPackage } from "$src/helpers/other/navigationHelper";
  import type { MinerobeUserSettingsSimple } from "$src/model/user";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  const userSettings: Writable<MinerobeUserSettingsSimple> = writable(null);

  let mostLiked = [];
  let mostRecent = [];
  let mostDownloaded = [];
  let landingLoaded = false;
  onMount(async () => {
    // let landing ;
    appState.subscribe(async (state) => {
      if (!(state == APP_STATE.READY)) return;
      if (landingLoaded) return;

      const settings = await FetchSettings();
      userSettings.set(settings);
    });
    
    const recent = await GetMostRecent(0, 6);
    mostRecent = recent.items;

    const liked = await GetMostLiked(0, 6);
    mostLiked = liked.items;

    const downloaded = await GetMostDownloaded(0, 6);
    mostDownloaded = downloaded.items;

    landingLoaded = true;
  });
  const goToItemPage = (e) => {
    const item = e.detail.item;
    const variant = e.detail.layer;
    navigateToOutfitPackage(item, variant.variantId);
  };
</script>

<div id="content" class:mobile={$isMobileView}>
  <div class="banner">
    <h1 id="view-title">Welcome to Minerobe</h1>
    <p id="view-description">
      Minerobe is a collection of Minecraft skins and outfits. You can use them
      in your own Minecraft worlds or use them as a base for your own skins.
    </p>
  </div>
  <h2 class="list-title">Most Recent</h2>
  <OutfitPackageSnapshotList
    items={mostRecent}
    loading={!landingLoaded}
    renderer={$defaultRenderer}
    dense={false}
    baseTexture={$userSettings?.baseTexture?.layers[0]}
    withBaseTexture={$userSettings?.baseTexture?.layers.length > 0}
    currentSkinId={$userSettings?.currentTexturePackageId}
    on:innerselect={goToItemPage}
  />
  <h2 class="list-title">Most Liked</h2>
  <OutfitPackageSnapshotList
    items={mostLiked}
    loading={!landingLoaded}
    renderer={$defaultRenderer}
    baseTexture={$userSettings?.baseTexture?.layers[0]}
    withBaseTexture={$userSettings?.baseTexture?.layers.length > 0}
    currentSkinId={$userSettings?.currentTexturePackageId}
    dense={false}
    on:innerselect={goToItemPage}
  />
  <h2 class="list-title">Most Downloaded</h2>
  <OutfitPackageSnapshotList
    items={mostDownloaded}
    loading={!landingLoaded}
    renderer={$defaultRenderer}
    dense={false}
    baseTexture={$userSettings?.baseTexture?.layers[0]}
    withBaseTexture={$userSettings?.baseTexture?.layers.length > 0}
    currentSkinId={$userSettings?.currentTexturePackageId}
    on:innerselect={goToItemPage}
  />
</div>

<style lang="scss">
  @import "style.scss";
</style>
