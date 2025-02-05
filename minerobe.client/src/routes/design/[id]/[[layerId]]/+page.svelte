<script lang="ts">
  //main imports
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";
  import * as THREE from "three";
  //api
  import { GetPackage } from "$src/api/pack";
  import { FetchSettings } from "$src/api/settings";
  import { GetAccount } from "$src/api/integration/minecraft.js";
  import { GetWadrobeCollectionsWithPackageContext } from "$src/api/wardrobe.js";
  import {
    AddPackageToCollection,
    RemovePackageFromCollection,
  } from "$src/api/collection.js";
  //services
  import { ExportImage } from "$src/data/export.js";
  import { OutfitPackageToTextureConverter } from "$src/data/render.js";
  import { ShowToast } from "$src/data/toast.js";
  import { SetMinecraftSkin } from "$src/data/integration.js";
  import { replaceState } from "$app/navigation";
  import { navigateToOutfitPackageEdit } from "$src/helpers/other/navigationHelper";
  //consts
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    CURRENT_USER,
    IS_MOBILE_VIEW,
  } from "$src/data/static.js";
  //model
  import { APP_STATE } from "$src/data/enums/app.js";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit.js";
  import type { RenderAnimation } from "$src/data/animation.js";
  import type {
    Cape,
    MinecraftAccountSimple,
  } from "$data/models/integration/minecraft";
  import type { PagedResponse } from "$data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  import { OutfitLayer, type OutfitPackage } from "$model/package";
  import DefaultAnimation from "$src/animation/default.js";
  import { OutfitPackageRenderConfig } from "$data/models/render";
  import { MinerobeUserSettings } from "$data/models/user";
  import HandsUpAnimation from "$src/animation/handsup";
  import type { MODEL_TYPE } from "$src/data/enums/model.js";
  //components
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitLayerList from "$lib/components/outfit/OutfitLayerList/OutfitLayerList.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";
  import CollectionsDialog from "$lib/components/dialog/CollectionsDialog.svelte";
  import SocialInfo from "$lib/components/social/SocialInfo.svelte";
  //icons
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import EditIcon from "$src/icons/edit.svg?raw";

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
  let userSettings: MinerobeUserSettings = null;
  let integrationSettings: MinecraftAccountSimple = null;
  let renderer: any = null;

  // dialog data
  let dialogCollections: PagedResponse<OutfitPackageCollectionWithPackageContext> =
    null;
  let isCollectionsDialogOpen = false;

  //others
  let isSkinSetting = false;

  let __addAnimation = function (
    animation: RenderAnimation,
    force: boolean = false
  ) {};

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY && state != APP_STATE.GUEST_READY) return;
      renderer = new THREE.WebGLRenderer({
        alpha: true,
      });
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

      $itemPackage = await GetPackage(data.id);
      isOutfitSet = $itemPackage.type === PACKAGE_TYPE.OUTFIT_SET;
      $renderConfiguration.item = $itemPackage;

      if (!isOutfitSet) {
        if (data.layerId == null)
          $renderConfiguration.selectedLayerId = $itemPackage.layers[0].id;
        else $renderConfiguration.selectedLayerId = data.layerId;
      }
      if (data.isFlat != null) $renderConfiguration.isFlatten = data.isFlat;
      if (data.model != null) $itemPackage.model = data.model as MODEL_TYPE;

      if (state == APP_STATE.READY) {
        userSettings = await FetchSettings();
        if (isOutfitSet && userSettings?.baseTexture != null)
          $renderConfiguration.baseTexture = userSettings.baseTexture.layers[0];
        else $renderConfiguration.baseTexture = $BASE_TEXTURE;

        isMinecraftIntegrated =
          userSettings?.integrations.includes("minecraft");
        if (isMinecraftIntegrated && isOutfitSet) {
          integrationSettings = await GetAccount(false);
          $renderConfiguration.cape = integrationSettings.capes.find(
            (c) => c.id == userSettings?.currentTexture?.capeId
          );
        }
      } else $renderConfiguration.baseTexture = $BASE_TEXTURE;

      loaded = true;
      setTimeout(() => addAnimation(null), 0);
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  //layers
  const setSelectedLayer = (e) => {
    const layerId = e.detail.item.id;
    renderConfiguration.update((config) => {
      config.selectedLayerId = layerId;
      return config;
    });
    replaceState(`/design/${$itemPackage.id}/${layerId}`, null);
  };

  //export
  const exportPackage = async () => {
    const texture = new OutfitPackageToTextureConverter().SetOptions(
      $renderConfiguration
    );
    if (userSettings?.baseTexture == null || !isOutfitSet)
      texture.SetBaseTexture(null);
    await ExportImage(
      await texture.ConvertAsyncWithFlattenSettingsAsync(),
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

  //actions
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
  const setSkin = async function () {
    isSkinSetting = true;
    await SetMinecraftSkin($renderConfiguration);
    addAnimation(HandsUpAnimation);
    ShowToast("Skin set successfully");
    isSkinSetting = false;
  };
  const setCape = function (e) {
    const item = e.detail.item as Cape;
    $renderConfiguration.cape = item;
  };
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <div id="render-node">
          <OutfitPackageRender
            bind:addAnimation={__addAnimation}
            source={$renderConfiguration.item}
            isDynamic
            cape={$renderConfiguration?.cape?.texture}
            layerId={$renderConfiguration.selectedLayerId}
            isFlatten={$renderConfiguration.isFlatten}
            resizable
            {renderer}
            resizeDebounce={0}
            baseTexture={$renderConfiguration.baseTexture}
          />
        </div>
      </Placeholder>
    </div>
  </div>
  <div id="item-data">
    <SectionTitle
      label={isOutfitSet ? "Outfit set" : "Outfit"}
      placeholder={!loaded}
    />
    <Placeholder {loaded} height="40px">
      <div id="item-data-title">
        {$itemPackage.name}
      </div>
    </Placeholder>
    <div id="item-data-type">
      <Placeholder {loaded} height="24px" width="120px">
        <Label variant="unique">{$itemPackage.publisher.name}</Label>
      </Placeholder>
      {#if loaded && userSettings?.currentTexture.packageId == $itemPackage.id}
        <Placeholder {loaded} height="24px" width="120px">
          <Label variant="ancient">Current skin</Label>
        </Placeholder>
      {/if}
      <Placeholder {loaded} height="24px" width="120px">
        <SocialInfo dense data={$itemPackage.social} />
      </Placeholder>
    </div>
    <div id="item-data-layers">
      <SectionTitle
        label={isOutfitSet ? "Outfits" : "Variants"}
        placeholder={!loaded}
      />
      {#if loaded}
        <OutfitLayerList
          dense={!isOutfitSet}
          link={"/design/"}
          readonly={isOutfitSet}
          packageId={$itemPackage.id}
          items={$itemPackageLayers}
          selectable={!isOutfitSet}
          selectedLayerId={$renderConfiguration.selectedLayerId}
          movable={false}
          removable={false}
          editable={false}
          on:select={setSelectedLayer}
          model={$itemPackage.model}
        ></OutfitLayerList>
      {/if}
    </div>
    {#if isMinecraftIntegrated && loaded && isOutfitSet}
      <div id="item-data-integration">
        <SectionTitle label="Capes" />
        <CapeList
          items={integrationSettings.capes}
          selectedCapeId={$renderConfiguration.cape?.id}
          on:select={setCape}
        />
      </div>
    {/if}
    {#if $itemPackage?.description?.length > 0}
      <div id="item-data-description">
        <SectionTitle label="Description" placeholder={!loaded} />
        <Placeholder height="40px" {loaded}>
          <div id="item-description">{$itemPackage.description}</div>
        </Placeholder>
      </div>
    {/if}
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
        {#if $CURRENT_USER?.id == $itemPackage.publisher.id}
          <Button
            label="Edit item"
            type="tertiary"
            size="large"
            onlyIcon={!$IS_MOBILE_VIEW}
            icon={EditIcon}
            on:click={() => navigateToOutfitPackageEdit($itemPackage.id)}
          />
        {/if}
      {:else}
        <Placeholder height="46px" />
        <Placeholder height="46px" />
      {/if}
    </div>
  </div>
  <!-- Dialogs -->
  <CollectionsDialog
    loading={dialogCollections?.items == null}
    bind:open={isCollectionsDialogOpen}
    items={dialogCollections}
    pageSizes={[6, 12, 24]}
    on:unselect={removeFromCollection}
    on:select={addToCollection}
    on:optionsChanged={openCollectionsDialog}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
