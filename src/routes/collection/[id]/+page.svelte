<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$lib/components/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import {
    DeleteCollection,
    GetCollection,
    UpdateCollection,
  } from "$src/api/collection";
  import { FetchSettings } from "$src/api/settings";
  import { appState, defaultRenderer } from "$src/data/cache";
  import type {
    MinerobeUserSettingsSimple,
    OutfitPackageCollection,
  } from "$src/data/common";
  import { APP_STATE } from "$src/data/consts";
  import {
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export let data: any;
  let loaded = false;
  const userSettings: Writable<MinerobeUserSettingsSimple> = writable(null);
  const localCollection: Writable<OutfitPackageCollection> = writable(
    {} as OutfitPackageCollection
  );

  onMount(() => {
    const id = data.id;
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      const settings = await FetchSettings();
      userSettings.set(settings);

      const fetched = await GetCollection(id);
      localCollection.set(fetched);

      loaded = true;
    });
  });
  const goToItemPage = (e) => {
    const item = e.detail.item;
    const variant = e.detail.layer;
    navigateToOutfitPackage(item, variant.id);
  };
  const deleteCollection = async () => {
    await DeleteCollection(data.id);
    navigateToWardrobe();
  };
  localCollection.subscribe(async (value) => {
    if (loaded) await UpdateCollection(value);
  });
</script>

<div>
  <div id="header">
    <Placeholder {loaded} style="width:75vw;height:48px">
      <input class="title-input" bind:value={$localCollection.name} />
      <Button on:click={deleteCollection} label="Delete" />
    </Placeholder>
  </div>
  <div class="outfits">
      <OutfitPackageSnapshotList
        dense={false}
        maxItemWidth="1fr"
        fillMethod="auto-fill"
        loading={!loaded}
        currentSkinId={$userSettings?.currentTexturePackageId}
        baseTexture={$userSettings?.baseTexture.layers[0]}
        withBaseTexture={$userSettings?.baseTexture != null}
        renderer={$defaultRenderer}
        items={$localCollection.items}
        on:innerselect={goToItemPage}
      />
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
