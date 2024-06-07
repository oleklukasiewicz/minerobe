<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$lib/components/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import {
    DeleteCollection,
    GetCollection,
    UpdateCollection,
  } from "$src/api/collection";
  import { userBaseTexture } from "$data/cache";
  import { defaultRenderer, isReadyForData } from "$src/data/cache";
  import type { OutfitPackageCollection } from "$src/data/common";
  import {
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper";
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
        const fetched = await GetCollection(id);
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
      <Button
        on:click={deleteCollection}
        label="Delete"
      />
    </Placeholder>
  </div>
  <div class="outfits">
    <OutfitPackageSnapshotList
      dense={false}
      maxItemWidth="1fr"
      fillMethod="auto-fill"
      loading={!loaded}
      baseTexture={$userBaseTexture}
      withBaseTexture={$userBaseTexture != null}
      renderer={$defaultRenderer}
      items={$localCollection.items}
      on:innerselect={goToItemPage}
    />
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
