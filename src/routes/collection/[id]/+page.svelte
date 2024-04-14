<script lang="ts">
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$lib/components/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import {
    FetchOutfitCollection,
    UploadOutfitCollection,
  } from "$src/api/collection";
  import {
    defaultRenderer,
    isReadyForData,
    userSettings,
  } from "$src/data/cache";
  import type { OutfitPackageCollection } from "$src/data/common";
  import { UpdateCollectionInWardrobe } from "$src/helpers/other/apiHelper";
  import { navigateToOutfitPackage } from "$src/helpers/other/navigationHelper";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export let data: any;
  let loaded = false;
  const localCollection: Writable<OutfitPackageCollection> = writable(
    {} as OutfitPackageCollection
  );

  onMount(() => {
    const id = data.id;
    isReadyForData.subscribe(async (readyness) => {
      if (readyness) {
        const fetched = await FetchOutfitCollection(id);
        localCollection.set(fetched);
        loaded = true;
      }
    });
  });
  const goToItemPage = (e) => {
    const item = e.detail.item;
    const variant = e.detail.layer;
    navigateToOutfitPackage(item, variant.variantId);
  };
  localCollection.subscribe(async (value) => {
    if (loaded) {
      await UploadOutfitCollection(value);
      await UpdateCollectionInWardrobe(value);
    }
  });
</script>

<div>
  <div id="header">
    <Placeholder {loaded} style="width:75vw;height:48px">
      <input class="title-input" bind:value={$localCollection.name} />
    </Placeholder>
  </div>
  <div class="outfits">
    <OutfitPackageSnapshotList
      dense={false}
      maxItemWidth="1fr"
      fillMethod="auto-fill"
      loading={!loaded}
      renderer={$defaultRenderer}
      items={$localCollection.outfits}
      withBaseTexture={$userSettings?.baseTexture != null}
      baseTexture={$userSettings?.baseTexture}
      on:innerselect={goToItemPage}
    />
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
