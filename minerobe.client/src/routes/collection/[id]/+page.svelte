<script lang="ts">
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageList from "$lib/components/outfit/OutfitPackageList/OutfitPackageList.svelte";
  import { GetCollection } from "$src/api/collection";
  import { FetchSettings } from "$src/api/settings.js";
  import { APP_STATE } from "$src/data/enums/app";
  import type { OutfitPackageCollection } from "$src/data/models/collection";
  import type { MinerobeUserSettings } from "$src/data/models/user.js";
  import { CURRENT_APP_STATE } from "$src/data/static";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  export let data;

  const itemCollection: Writable<OutfitPackageCollection> = writable(null);

  let userSettings: MinerobeUserSettings = null;
  let stateSub = null;
  let loaded = false;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY && state != APP_STATE.GUEST_READY) return;

      $itemCollection = await GetCollection(data.id);
      userSettings = await FetchSettings();
      loaded = true;
    });
  });
</script>

<div id="collection-view">
  <div id="collection-header">
    <Placeholder {loaded}><h1>{$itemCollection.name}</h1></Placeholder>
    <Placeholder {loaded}><p>{$itemCollection.description}</p></Placeholder>
  </div>
  <div id="collection-items">
    {#if loaded}
      <OutfitPackageList
        columns={6}
        items={$itemCollection.items}
        baseTexture={userSettings.baseTexture.layers[0]}
      />
    {/if}
  </div>
</div>

<style lang="scss">
  @use "style.scss";
</style>
