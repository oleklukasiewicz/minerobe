<script lang="ts">
  import OutfitPresenter from "$lib/components/outfit/OutfitPresenter/OutfitPresenter.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import OutfitPackageSnapshotList from "$lib/components/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import {
    DeleteCollection,
    GetCollection,
    UpdateCollection,
  } from "$src/api/collection";
  import { FetchSettings } from "$src/api/settings";
  import { appState, currentUser, defaultRenderer } from "$src/data/cache";
  import { APP_STATE } from "$src/data/consts";
  import {
    navigateToOutfitPackage,
    navigateToOutfitPackageEdit,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper";
  import type { OutfitPackageCollection } from "$data/models/collection";
  import type { MinerobeUserSettings } from "$data/models/user";
  import { onMount } from "svelte";
  import { writable, type Writable } from "svelte/store";

  import TrashIcon from "$icons/trash.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import Dialog from "$lib/components/base/Dialog/Dialog.svelte";
  import type { OutfitLayer, OutfitPackage } from "$data/models/package";

  export let data: any;
  let loaded = false;
  let isDeleteDialogOpen = false;
  const userSettings: Writable<MinerobeUserSettings> = writable(null);
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
  const goToItemPage = async (e) => {
    const item: OutfitPackage = e.detail.item;
    const variant: OutfitLayer = e.detail.layer;

    if (!item.social.isShared && $currentUser.id == item.publisher.id) {
      navigateToOutfitPackageEdit(item.id);
    } else navigateToOutfitPackage(item, variant.id);
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
      <div style="display:flex; flex-direction:row;gap:8px">
        <input class="title-input" bind:value={$localCollection.name} />
        <div>
          <Button
            onlyIcon
            type="tertiary"
            icon={TrashIcon}
            on:click={() => (isDeleteDialogOpen = true)}
            label="Delete"
          />
        </div>
      </div>
    </Placeholder>
    <div style="display: table;margin-top:12px">
      <div class="collection-showcase">
        {#each new Array(15) as item}
          <OutfitPresenter />
        {/each}
      </div>
    </div>
  </div>
  <div class="outfits">
    <OutfitPackageSnapshotList
      dense={false}
      maxItemWidth="1fr"
      fillMethod="auto-fill"
      loading={!loaded}
      currentSkinId={$userSettings?.currentTexturePackageId}
      baseTexture={$userSettings?.baseTexture?.layers[0]}
      withBaseTexture={$userSettings?.baseTexture?.layers.length > 0}
      renderer={$defaultRenderer}
      items={$localCollection.items}
      on:innerselect={goToItemPage}
    />
  </div>
  <Dialog
    bind:open={isDeleteDialogOpen}
    style="min-width:30vw"
    showTitleBar={true}
  >
    <div style="text-align:center;margin:8px;">
      <span class="mc-font-simple">{"Do you want to delete collection?"}</span>
      <div class="horizontal-list" style="margin-top:24px;">
        <Button
          type="tertiary"
          on:click={() => {
            isDeleteDialogOpen = false;
          }}
          label={"Cancel"}
          icon={CloseIcon}
        />
        <Button
          type="primary"
          on:click={() => {
            isDeleteDialogOpen = false;
            deleteCollection();
          }}
          label={"Delete"}
          icon={TrashIcon}
        />
      </div>
    </div></Dialog
  >
</div>

<style lang="scss">
  @use "style.scss";
</style>
