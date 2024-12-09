<script lang="ts">
  //main imports
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import { onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";
  import * as THREE from "three";
  //api
  import {
    GetPackage,
    UpdatePackage,
    UpdatePackageLayer,
    SetPackageLayerOrder,
    RemovePackageLayerWithPackageContext,
    AddPackageLayer,
    SetMergedLayer,
    RemovePackage,
    AddRemoteLayerToPackage,
  } from "$src/api/pack";
  import { FetchSettings } from "$src/api/settings";
  import { GetAccount } from "$src/api/integration/minecraft.js";
  import {
    GetWadrobeCollectionsWithPackageContext,
    GetWadrobePackagesSingleLayer,
  } from "$src/api/wardrobe.js";
  import {
    AddPackageToCollection,
    RemovePackageFromCollection,
  } from "$src/api/collection.js";
  import { SharePackage, UnSharePackage } from "$src/api/social.js";
  //services
  import { ImportImages, ImportImagesFromFiles } from "$src/data/import.js";
  import { ExportImage } from "$src/data/export.js";
  import { OutfitPackageToTextureConverter } from "$src/data/render.js";
  import { MergePackageLayersToSingleLayer } from "$src/helpers/package/packageHelper.js";
  import { ShowToast } from "$src/data/toast.js";
  import { debounce } from "$src/data/base.js";
  import { SetMinecraftSkin } from "$src/data/integration.js";
  //consts
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static.js";
  //model
  import { OutfitFilter } from "$data/models/filter.js";
  import { APP_STATE } from "$src/data/enums/app.js";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit.js";
  import type { RenderAnimation } from "$src/data/animation.js";
  import type { MinecraftIntegrationSettings } from "$data/models/integration/minecraft";
  import type { PagedResponse } from "$data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  import { OutfitLayer, type OutfitPackage } from "$model/package";
  import DefaultAnimation from "$src/animation/default.js";
  import { OutfitPackageRenderConfig } from "$data/models/render";
  import { MinerobeUserSettingsSimple } from "$data/models/user";
  import HandsUpAnimation from "$src/animation/handsup";
  import NewOutfitBottomAnimation from "$src/animation/bottom.js";
  import NewOutfitBottomAltAnimation from "$src/animation/bottomAlt.js";
  import {
    navigateToHome,
    navigateToOutfitPackage,
  } from "$src/helpers/other/navigationHelper.js";
  //components
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitLayerList from "$lib/components/outfit/OutfitLayerList/OutfitLayerList.svelte";
  import DragAndDrop from "$lib/components/draganddrop/DragAndDrop/DragAndDrop.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";
  import CollectionsDialog from "$lib/components/dialog/CollectionsDialog.svelte";
  import EditLayerDialog from "$lib/components/dialog/EditLayerDialog.svelte";
  import OutfitPickerDialog from "$lib/components/dialog/OutfitPickerDialog.svelte";
  import OverviewDialog from "$lib/components/dialog/OverviewDialog.svelte";
  import ConfirmDialog from "$lib/components/dialog/ConfirmDialog.svelte";
  //icons
  import TrashIcon from "$icons/trash.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import CloudIcon from "$icons/cloud.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import MoreHorizontalIcon from "$icons/more-horizontal.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";

  export let data;

  const renderConfiguration: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );
  const itemPackage: Writable<OutfitPackage> = propertyStore(
    renderConfiguration,
    "item"
  );
  const itemPackageLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );
  let loaded = false;
  let isOutfitSet = false;
  let isMinecraftIntegrated = false;
  let userSettings: MinerobeUserSettingsSimple = null;
  let integrationSettings: MinecraftIntegrationSettings = null;
  let renderer: any = null;

  // dialog data
  let dialogSelectedLayer: OutfitLayer = null;
  let dialogCollections: PagedResponse<OutfitPackageCollectionWithPackageContext> =
    null;
  let dialogOutfits: PagedResponse<OutfitPackage> = null;
  let dialogOutfitsFilter: OutfitFilter = new OutfitFilter();
  let isLayerEditDialogOpen = false;
  let isOverviewDialogOpen = false;
  let isRemoveDialogOpen = false;
  let isCollectionsDialogOpen = false;
  let isOutfitPickerDialogOpen = false;

  //others
  let isSkinSetting = false;

  //api helpers
  const UpdatePackageDebounced = debounce(async () => {
    await UpdatePackage($itemPackage);
  }, 500);
  const UpdatePackageLayersOrder = async function () {
    const layers = $itemPackage.layers;
    await SetPackageLayerOrder(
      $itemPackage.id,
      layers.map((x) => x.id)
    );
    if (isOutfitSet) {
      const merged = await MergePackageLayersToSingleLayer($itemPackage);
      await SetMergedLayer(merged);
    }
  };

  let __addAnimation = function (
    animation: RenderAnimation,
    force: boolean = false
  ) {};

  onMount(async () => {
    CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      renderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $itemPackage = await GetPackage(data.id);
      isOutfitSet = $itemPackage.type === PACKAGE_TYPE.OUTFIT_SET;
      $renderConfiguration.item = $itemPackage;
      if (!isOutfitSet)
        $renderConfiguration.selectedLayerId = $itemPackage.layers[0].id;

      userSettings = await FetchSettings();
      if (isOutfitSet)
        $renderConfiguration.baseTexture = userSettings.baseTexture.layers[0];
      else $renderConfiguration.baseTexture = $BASE_TEXTURE;

      isMinecraftIntegrated = userSettings?.integrations.includes("minecraft");
      if (isMinecraftIntegrated && isOutfitSet) {
        integrationSettings = await GetAccount();
        $renderConfiguration.capeId = integrationSettings.currentCapeId;
      }

      loaded = true;
      setTimeout(() => addAnimation(null), 0);
      itemPackage.subscribe(async (item) => {
        await UpdatePackageDebounced();
      });
    });
  });

  //layers
  const setSelectedLayer = (e) => {
    const layerId = e.detail.item.id;
    renderConfiguration.update((config) => {
      config.selectedLayerId = layerId;
      return config;
    });
  };
  const moveLayerDown = async (e) => {
    const layer = e.detail.item;
    const index = e.detail.index;
    itemPackage.update((item) => {
      item.layers.splice(index, 1);
      item.layers.splice(index - 1, 0, layer);
      return item;
    });
    addAnimation(NewOutfitBottomAltAnimation);
  };
  const moveLayerUp = (e) => {
    const layer = e.detail.item;
    const index = e.detail.index;
    itemPackage.update((item) => {
      item.layers.splice(index, 1);
      item.layers.splice(index + 1, 0, layer);
      return item;
    });
    addAnimation(NewOutfitBottomAnimation);
  };
  const removeLayer = async (e) => {
    const layer = e.detail.item;
    itemPackage.update((item) => {
      item.layers = item.layers.filter((l) => l.id !== layer.id);
      return item;
    });
    await RemovePackageLayerWithPackageContext(layer, $itemPackage.id);
  };
  const editLayer = async function (e) {
    const item = e.detail.item;

    itemPackageLayers.update((layers) => {
      const index = layers.findIndex((x) => x.id == item.id);
      layers[index] = item;
      return layers;
    });
    await UpdatePackageLayer(item);
  };
  const dropLayer = async (e) => {
    const layer = e.detail.item;
    const option = e.detail.option;
    const file = e.detail.file;
    
    const index = $itemPackageLayers.findIndex((x) => x.id == layer.id);
    itemPackage.update((item) => {
      item.layers[index][option] = file;
      return item;
    });
    await UpdatePackageLayer($itemPackageLayers[index]);
  };

  //imports
  const importImage = async () => {
    const layers = await ImportImages();
    const addedlayers = await Promise.all(
      layers.map(async (layer) => {
        layer.sourcePackageId = $itemPackage.id;
        layer.id = null;
        return await AddPackageLayer(layer);
      })
    );
    itemPackage.update((item) => {
      item.layers.push(...addedlayers);
      return item;
    });
  };
  const importLayerFromDrop = async (e) => {
    const files = e.detail.items;
    const layers = await ImportImagesFromFiles(files);
    const addedlayers = await Promise.all(
      layers.map(async (layer) => {
        layer.sourcePackageId = $itemPackage.id;
        layer.id = null;
        return await AddPackageLayer(layer);
      })
    );
    itemPackage.update((item) => {
      item.layers.push(...addedlayers);
      return item;
    });
  };

  //export
  const exportPackage = async () => {
    await ExportImage(
      await new OutfitPackageToTextureConverter().ConvertFromOptionsAsync(
        $renderConfiguration
      ),
      $itemPackage.name
    );
    addAnimation(HandsUpAnimation);
  };

  //animations
  const addAnimation = (animation: RenderAnimation) => {
    if (animation) __addAnimation(animation, false);
    __addAnimation(DefaultAnimation, true);
  };

  //dialogs
  const openLayerEditDialog = (e) => {
    const layer = e.detail.item;
    dialogSelectedLayer = structuredClone(layer);
    isLayerEditDialogOpen = true;
  };
  const openOverviewDialog = () => (isOverviewDialogOpen = true);
  const openRemoveDialog = () => (isRemoveDialogOpen = true);
  const openCollectionsDialog = async (e) => {
    let options = e?.detail?.options;
    if (!options) options = { page: 0, pageSize: 6 };
    dialogCollections = {
      items: null,
      page: options.page,
      pageSize: options.pageSize,
      total: 0,
    };
    isCollectionsDialogOpen = true;
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      options.page,
      options.pageSize
    );
  };
  const openOutfitPickerDialog = async (e) => {
    let options = e?.detail?.options;
    if (!options) options = { page: 0, pageSize: 12 };
    dialogOutfits = {
      items: null,
      page: options.page,
      pageSize: options.pageSize,
      total: 0,
    };
    dialogOutfitsFilter.type = PACKAGE_TYPE.OUTFIT;
    isOutfitPickerDialogOpen = true;
    dialogOutfits = await GetWadrobePackagesSingleLayer(
      dialogOutfitsFilter,
      options.page,
      options.pageSize
    );
  };

  //actions
  const deletePackage = async () => {
    await RemovePackage($itemPackage.id);
    navigateToHome();
  };
  const addToCollection = async function (e) {
    const collection = e.detail.item;
    await AddPackageToCollection(collection.id, $itemPackage.id);
    ShowToast("Item added to collection");
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      dialogCollections.page,
      dialogCollections.pageSize
    );
  };
  const removeFromCollection = async function (e) {
    const collection = e.detail.item;
    await RemovePackageFromCollection(collection.id, $itemPackage.id);
    ShowToast("Item removed from collection", "info");
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      dialogCollections.page,
      dialogCollections.pageSize
    );
  };
  const sharePackage = async function () {
    const sharedSocialInfo = await SharePackage($itemPackage.social.id);
    itemPackage.update((item) => {
      item.social = sharedSocialInfo;
      return item;
    });
    ShowToast("Item shared");
  };
  const unsharePackage = async function () {
    const unSharedpackageInfo = await UnSharePackage($itemPackage.social.id);
    itemPackage.update((item) => {
      item.social = unSharedpackageInfo;
      return item;
    });
    ShowToast("Item unshared");
  };
  const goToPackagePage = async function () {
    navigateToOutfitPackage($itemPackage);
  };
  const addPackageLayer = async function (e) {
    const newPack = e.detail.item;
    const layer = newPack.layers[0];
    itemPackage.update((pack) => {
      pack.layers.push(layer);
      return pack;
    });
    await AddRemoteLayerToPackage(layer.id, $itemPackage.id);
    isOutfitPickerDialogOpen = false;
  };
  const setSkin = async function () {
    isSkinSetting = true;
    addAnimation(HandsUpAnimation);
    await SetMinecraftSkin($renderConfiguration);
    isSkinSetting = false;
  };
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <div id="render-node">
          <DragAndDrop on:drop={importLayerFromDrop}>
            <OutfitPackageRender
              on:textureUpdate={UpdatePackageLayersOrder}
              bind:addAnimation={__addAnimation}
              source={$renderConfiguration.item}
              isDynamic
              layerId={$renderConfiguration.selectedLayerId}
              isFlatten={$renderConfiguration.isFlatten}
              resizable
              {renderer}
              resizeDebounce={0}
              baseTexture={$renderConfiguration.baseTexture}
            />
          </DragAndDrop>
        </div>
      </Placeholder>
    </div>
  </div>
  <div id="item-data">
    <SectionTitle label="Name" placeholder={!loaded} />
    <Placeholder {loaded} height="40px">
      <div id="item-data-title">
        <input class="title-input" bind:value={$itemPackage.name} />
        <Button
          onlyIcon
          icon={TrashIcon}
          label={"Delete"}
          type={"tertiary"}
          on:click={openRemoveDialog}
        />
      </div>
    </Placeholder>
    <div id="item-data-type">
      <Placeholder {loaded} height="24px" width="120px">
        <Label>{isOutfitSet ? "Outfit set" : "Outfit"}</Label>
      </Placeholder>
      <Placeholder {loaded} height="24px" width="120px">
        {#if $itemPackage?.social?.isShared}
          <Label variant="rare">Shared</Label>
        {/if}
      </Placeholder>
      {#if loaded && userSettings?.currentTexturePackageId == $itemPackage.id}
        <Placeholder {loaded} height="24px" width="120px">
          <Label variant="ancient">Current skin</Label>
        </Placeholder>
      {/if}
    </div>
    <div id="item-data-layers">
      <SectionTitle
        label={isOutfitSet ? "Outfits" : "Variants"}
        placeholder={!loaded}
      />
      {#if loaded}
        <OutfitLayerList
          packageId={$itemPackage.id}
          items={$itemPackageLayers}
          selectable={!isOutfitSet}
          selectedLayerId={$renderConfiguration.selectedLayerId}
          movable={isOutfitSet}
          dropable
          on:edit={openLayerEditDialog}
          on:moveUp={moveLayerUp}
          on:moveDown={moveLayerDown}
          on:select={setSelectedLayer}
          on:delete={removeLayer}
          on:drop={dropLayer}
          model={$itemPackage.model}
        ></OutfitLayerList>
      {/if}
      <div id="item-data-layers-options">
        {#if isOutfitSet || !loaded}
          <Placeholder {loaded} height="40px" loadedStyle={"flex:1"}>
            {#if isOutfitSet}
              <Button
                label={"Add outfit"}
                icon={AddIcon}
                iconSize="medium"
                type={"tertiary"}
                on:click={openOutfitPickerDialog}
              />
            {/if}
          </Placeholder>
        {/if}
        {#if loaded}
          <Button
            iconSize="medium"
            label={isOutfitSet ? "Import image" : "Import variant"}
            icon={ImportPackageIcon}
            type={"tertiary"}
            on:click={importImage}
          />
        {/if}
      </div>
    </div>
    {#if isMinecraftIntegrated && loaded && isOutfitSet}
      <div id="item-data-integration">
        <SectionTitle label="Capes" />
        <CapeList
          items={integrationSettings.capes}
          bind:selectedCapeId={$renderConfiguration.capeId}
        />
      </div>
    {/if}
    <div id="item-data-description">
      <SectionTitle label="Description" placeholder={!loaded} />
      <Placeholder height="40px" {loaded}>
        <textarea id="description-input" bind:value={$itemPackage.description}
        ></textarea>
      </Placeholder>
    </div>
    <div id="item-data-model">
      <SectionTitle label="Model" placeholder={!loaded} />
      <Placeholder height="40px" {loaded}>
        <ModelRadioGroup bind:selectedValue={$itemPackage.model} />
      </Placeholder>
    </div>
    <div id="item-data-minimal">
      <Placeholder width="150px" height="30px" {loaded}>
        <Checkbox
          label="Minimal format"
          bind:value={$renderConfiguration.isFlatten}
        />
      </Placeholder>
    </div>
    <div id="item-data-action">
      {#if loaded}
        {#if isMinecraftIntegrated && isOutfitSet}
          <Button
            label={isSkinSetting ? "Setting skin..." : "Set my skin"}
            type="primary"
            icon={isSkinSetting ? LoaderIcon : HumanHandsUpIcon}
            size="large"
            on:click={setSkin}
            disabled={isSkinSetting}
          />
        {/if}
        <Button
          on:click={exportPackage}
          label="Download"
          type="primary"
          size="large"
          onlyIcon={isMinecraftIntegrated && !$IS_MOBILE_VIEW && isOutfitSet}
          icon={DownloadIcon}
        />
        <Button
          label="Manage collections"
          type="tertiary"
          size="large"
          onlyIcon={!$IS_MOBILE_VIEW}
          icon={ListIcon}
          on:click={openCollectionsDialog}
        />
        {#if !$itemPackage?.social?.isShared}
          <Button
            label="Share"
            icon={CloudIcon}
            onlyIcon={!$IS_MOBILE_VIEW}
            size={"large"}
            type={"tertiary"}
            on:click={sharePackage}
          />
        {:else}
          <Button
            on:click={openOverviewDialog}
            label="Overview"
            icon={MoreHorizontalIcon}
            onlyIcon={!$IS_MOBILE_VIEW}
            size={"large"}
            type={"tertiary"}
          />
        {/if}
      {:else}
        <Placeholder height="46px" />
        <Placeholder height="46px" />
      {/if}
    </div>
  </div>
  <!-- Dialogs -->
  <EditLayerDialog
    on:edit={editLayer}
    bind:open={isLayerEditDialogOpen}
    item={dialogSelectedLayer}
  />
  <OverviewDialog
    bind:open={isOverviewDialogOpen}
    item={$itemPackage}
    on:unshare={unsharePackage}
    on:share={sharePackage}
    on:page={goToPackagePage}
  />
  <ConfirmDialog
    bind:open={isRemoveDialogOpen}
    message={"Do you want to delete this item?"}
    label={"Delete item"}
    cancelIcon={null}
    confirmLabel={"Delete"}
    on:confirm={deletePackage}
  />
  <CollectionsDialog
    loading={dialogCollections?.items == null}
    bind:open={isCollectionsDialogOpen}
    items={dialogCollections}
    pageSizes={[6, 12, 24]}
    on:unselect={removeFromCollection}
    on:select={addToCollection}
    on:optionsChanged={openCollectionsDialog}
  />
  <OutfitPickerDialog
    items={dialogOutfits}
    filters={dialogOutfitsFilter}
    pageSizes={[6, 12, 24]}
    bind:open={isOutfitPickerDialogOpen}
    loading={dialogOutfits?.items == null}
    on:optionsChanged={openOutfitPickerDialog}
    on:select={addPackageLayer}
    on:filter={openOutfitPickerDialog}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
