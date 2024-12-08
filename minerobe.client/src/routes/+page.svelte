<script lang="ts">
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { FetchSettings } from "$src/api/settings";
  import {
    GetMostLiked,
    GetMostRecent,
    GetMostDownloaded,
  } from "$src/api/view/landing";
  import { APP_STATE } from "$src/data/enums/app";
  import { CURRENT_APP_STATE, IS_MOBILE_VIEW } from "$src/data/static";
  import { navigateToOutfitPackage } from "$src/helpers/other/navigationHelper";
  import type { OutfitLayer } from "$data/models/package";
  import type { MinerobeUserSettingsSimple } from "$data/models/user";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  const userSettings: Writable<MinerobeUserSettingsSimple> = writable(null);

  let mostLiked = [];
  let mostRecent = [];
  let mostDownloaded = [];
  let landingLoaded = false;
  onMount(async () => {
    // let landing ;
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (!(state == APP_STATE.READY || state == APP_STATE.GUEST_READY)) return;

      const recent = await GetMostRecent(0, 6);
      mostRecent = recent.items;

      const liked = await GetMostLiked(0, 6);
      mostLiked = liked.items;

      const downloaded = await GetMostDownloaded(0, 6);
      mostDownloaded = downloaded.items;

      if (state == APP_STATE.READY) {
        const settings = await FetchSettings();
        userSettings.set(settings);
      }

      landingLoaded = true;
    });
  });
  const goToItemPage = (e) => {
    const item = e.detail.item;
    console.log("goToItemPage", e.detail);
    const variant = e.detail?.layer as OutfitLayer;
    navigateToOutfitPackage(item, variant?.id);
  };
</script>

<div id="content" class:mobile={$IS_MOBILE_VIEW}>
  <div class="banner">
    <h1 id="view-title">Welcome to Minerobe</h1>
    <p id="view-description">
      Minerobe is a collection of Minecraft skins and outfits. You can use them
      in your own Minecraft worlds or use them as a base for your own skins.
    </p>
  </div>
  <h2 class="list-title">Most Recent</h2>
  <OutfitPackageList
    items={mostRecent}
    on:select={goToItemPage}
    baseTexture={$userSettings?.baseTexture?.layers[0]}
  />
  <h2 class="list-title">Most Liked</h2>
  <OutfitPackageList
    items={mostLiked}
    on:select={goToItemPage}
    baseTexture={$userSettings?.baseTexture?.layers[0]}
  />
  <h2 class="list-title">Most Downloaded</h2>
  <OutfitPackageList
    items={mostDownloaded}
    on:select={goToItemPage}
    baseTexture={$userSettings?.baseTexture?.layers[0]}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
