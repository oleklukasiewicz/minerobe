<script lang="ts">
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import { propertyStore } from "svelte-writable-derived";
  import { onMount } from "svelte";

  import ItemVariant from "$component/outfit/ItemVariant/ItemVariant.svelte";
  import ItemLayer from "$component/outfit/ItemLayer/ItemLayer.svelte";
  import DynamicRender from "$component/render/DynamicRender.svelte";
  import InfoLabel from "$component/base/InfoLabel/InfoLabel.svelte";
  import Label from "$component/base/Label/Label.svelte";
  import SocialInfo from "$component/social/SocialInfo/SocialInfo.svelte";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$component/base/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "$component/outfit/ModelSelection/ModelSelection.svelte";
  import CollectionPicker from "$lib/components/outfit/CollectionPicker/CollectionPicker.svelte";
  import OutfitActions from "$lib/components/other/OutfitActions/OutfitActions.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import Dialog from "$lib/components/base/Dialog/Dialog.svelte";
  import ItemCape from "$lib/components/outfit/ItemCape/ItemCape.svelte";

  import { replaceState } from "$app/navigation";

  import { MinecraftIntegrationModel } from "$model/integration/minecraft";
  import { OutfitPackageRenderConfig } from "$model/render";
  import {
    CurrentTextureConfig,
    type MinerobeUserSettingsSimple,
  } from "$model/user";
  import type { OutfitPackage } from "$model/package";

  import { CreateDefaultRenderProvider } from "$data/render";
  import {
    CHANGE_TYPE,
    DEFAULT_PACKAGE,
    LAYER_TYPE,
    MODEL_TYPE,
    PACKAGE_TYPE,
    STEVE_MODEL,
    ALEX_MODEL,
    APP_STATE,
  } from "$data/consts";
  import {
    defaultRenderer,
    isMobileView,
    baseTexture,
    appState,
    showToast,
    currentUser,
  } from "$data/cache";

  import DefaultAnimation from "$animation/default";
  import CloseBoxIcon from "$icons/close-box.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";

  import { ExportImageLayers } from "$src/helpers/data/dataTransferHelper.js";
  import { sortOutfitLayersByColor } from "$src/helpers/image/imageDataHelpers.js";
  import { GetAnimationForPackageChange } from "$src/helpers/render/animationHelper.js";

  import { GetAccount } from "$src/api/integration/minecraft.js";
  import { GetPackage } from "$src/api/pack.js";
  import { SetAsDownloadPackage } from "$src/api/social.js";
  import {
    AddPackageToWardrobe,
    GetWadrobeCollectionsWithPackageContext,
    RemovePackageFromWardrobe,
  } from "$src/api/wardrobe.js";
  import {
    AddPackageToCollection,
    RemovePackageFromCollection,
  } from "$src/api/collection.js";
  import { FetchSettings, SetCurrentTexture } from "$src/api/settings.js";

  export let data;
  const localPackage: Writable<OutfitPackage> = writable(DEFAULT_PACKAGE);
  const itemModelType: Writable<string> = propertyStore(localPackage, "model");
  const itemRenderConfig: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );

  let integrationSettings: MinecraftIntegrationModel = null;
  let userSettings: MinerobeUserSettingsSimple = null;

  let isItemSet = false;

  let modelTexture: string = null;
  let isSkinSetting = false;
  let loaded = false;
  let defaultRenderProvider;

  let isCollectionPickerLoading = true;
  let pickerCollections = [];
  let isCollectionDialogOpen = false;

  let updateAnimation: (animation: any) => void = () => {};

  onMount(async () => {
    const id = data.id;
    const variantId = data.variantId;
    const model = data.model;
    const isFlat = data.isFlat;

    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY && state != APP_STATE.GUEST_READY) return;

      defaultRenderProvider =
        await CreateDefaultRenderProvider($defaultRenderer);

      //loading package data
      $localPackage = await GetPackage(id);
      if (!$localPackage) return;

      isItemSet = $localPackage.type == PACKAGE_TYPE.OUTFIT_SET;
      const targetVariant =
        $localPackage.layers.find((x) => x.id == variantId) ||
        $localPackage.layers[0];
      const targetModelName = model || $localPackage.model;
      const targetModel =
        targetModelName == MODEL_TYPE.ALEX ? ALEX_MODEL : STEVE_MODEL;

      if (!isItemSet) {
        $localPackage.layers = await sortOutfitLayersByColor(
          $localPackage.layers,
          $itemModelType
        );
      }

      if ($localPackage.model != targetModel.name)
        itemModelType.set(targetModel.name);

      //loading render config
      $itemRenderConfig = new OutfitPackageRenderConfig(
        $localPackage,
        targetModel,
        undefined,
        !isItemSet,
        targetVariant,
        isFlat
      );

      //loading settings
      if (state == APP_STATE.READY) {
        userSettings = await FetchSettings();

        if (userSettings?.integrations?.includes("minecraft") && isItemSet) {
          integrationSettings = await GetAccount(false);

          if (isItemSet && userSettings.currentCapeId != null) {
            const selectedCape = integrationSettings.capes.find(
              (x) => x.id == userSettings.currentCapeId
            );
            $itemRenderConfig.cape = selectedCape;
          }
        }
      }

      //loading texture
      if (isItemSet && userSettings?.baseTexture.layers.length > 0)
        $itemRenderConfig.setBaseTextureFromLayer(
          userSettings?.baseTexture.layers[0]
        );
      else $itemRenderConfig.setBaseTextureFromString($baseTexture);

      loaded = true;
      //force render
      itemRenderConfig.update((x) => x);
    });
  });

  //export
  const downloadImage = async () => {
    await ExportImageLayers(
      $itemRenderConfig.getLayersForModel(!isItemSet),
      $itemRenderConfig,
      $localPackage.name
    );
    applyAnimations($localPackage, CHANGE_TYPE.DOWNLOAD, -1);

    if ($currentUser?.id == $localPackage.publisher.id) return;

    const resp = await SetAsDownloadPackage($localPackage.social.id);
    if (resp == null) return;
    $localPackage.social = resp;
  };

  //texture
  const skinSetted = async function () {
    isSkinSetting = true;
    try {
      var result = await SetCurrentTexture(
        $localPackage.id,
        new CurrentTextureConfig(
          modelTexture,
          $localPackage.model,
          $itemRenderConfig.isFlatten,
          $itemRenderConfig.cape?.id
        )
      );
      if (result) {
        showToast("Skin changed", HumanHandsUpIcon);
        applyAnimations($localPackage, CHANGE_TYPE.SKIN_SET, -1);
        userSettings = result;
      }
    } catch (e) {
      showToast("Failed to set skin", undefined, "error");
    }
    isSkinSetting = false;
  };

  //sharing
  const addToWardrobe = async function () {
    const resp = await AddPackageToWardrobe($localPackage.id);
    if (resp == null) return;
    $localPackage.social = resp;
    $localPackage.isInWardrobe = true;
    showToast("Outfit added to wardrobe");
  };
  const removeFromWardrobe = async function () {
    const resp = await RemovePackageFromWardrobe($localPackage.id);
    if (resp == null) return;
    $localPackage.social = resp;
    $localPackage.isInWardrobe = false;
  };

  //animation
  const applyAnimations = function (
    pack: OutfitPackage,
    changeType,
    layerIndex: number
  ) {
    const anims = GetAnimationForPackageChange(pack, changeType, layerIndex);
    if (anims.filter((x) => x).length == 1) return;
    anims.forEach((anim) => updateAnimation(anim));
  };

  //collection
  const openCollectionPicker = async function () {
    isCollectionDialogOpen = true;
    isCollectionPickerLoading = true;
    const fetched = await GetWadrobeCollectionsWithPackageContext(
      $localPackage.id
    );
    pickerCollections = fetched.items;
    isCollectionPickerLoading = false;
  };
  const addToCollection = async function (e) {
    const collection = e.detail.collection;
    await AddPackageToCollection(collection.id, $localPackage.id);
    isCollectionDialogOpen = false;
    showToast("Outfit added to collection");
  };
  const removeFromCollection = async function (e) {
    const collection = e.detail.collection;
    await RemovePackageFromCollection(collection.id, $localPackage.id);
    isCollectionDialogOpen = false;
    showToast("Outfit removed from collection");
  };

  const setCape = function (cape) {
    $itemRenderConfig.cape = cape;
  };

  itemRenderConfig.subscribe(async (config) => {
    if (!loaded) return;
    modelTexture = await $itemRenderConfig.getLayersForRender(false);
    if (!isItemSet)
      replaceState(
        "/design/" +
          $localPackage.id +
          "/" +
          $itemRenderConfig.selectedLayer.id,
        null
      );
  });
  itemModelType.subscribe(async (model) => {
    if (!loaded) return;
    $itemRenderConfig.model =
      model == MODEL_TYPE.ALEX ? ALEX_MODEL : STEVE_MODEL;
    if (!isItemSet) return;
    applyAnimations($localPackage, CHANGE_TYPE.MODEL_TYPE_CHANGE, 0);
  });
</script>

<div class="item-page">
  <div class="render-data">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="render">
      {#if loaded}
        <DynamicRender
          texture={modelTexture}
          model={$itemRenderConfig.model.model}
          modelName={$itemRenderConfig.model.name}
          defaultAnimation={DefaultAnimation}
          bind:addAnimation={updateAnimation}
        />
      {:else}
        <Placeholder />
      {/if}
    </div>
  </div>
  <div class="item-data">
    <div class="data">
      <div class="item-name">
        <SectionTitle
          label={$localPackage.type == PACKAGE_TYPE.OUTFIT
            ? $_("outfit")
            : $_("outfit_set")}
          placeholder={!loaded}
        />
        <div id="item-title" class="title">
          <Placeholder style="height:30px;" {loaded}>
            {$localPackage.name}
          </Placeholder>
        </div>
        <Placeholder style="height:26px;max-width:100px;" {loaded}>
          <div style="display: flex;gap:4px;height:24px">
            <Label variant="unique">{$localPackage.publisher.name}</Label>
            {#if userSettings?.currentTexturePackageId == $localPackage.id}
              <Label variant="ancient">Current skin</Label>
            {/if}
            &nbsp;
            <SocialInfo data={$localPackage.social} />
          </div>
        </Placeholder>
      </div>
      <br />
      <SectionTitle
        label={isItemSet ? $_("layers") : $_("variants")}
        placeholder={!loaded}
      />
      {#if loaded}
        {#if $localPackage?.local?.warnings?.find((x) => x == "missingLayer")}
          <InfoLabel
            label={"Missing outfit"}
            description={"Certain outfits were not loaded successfully."}
          />
        {/if}
        {#if isItemSet}
          {#each [...$localPackage.layers].reverse() as item (item.id + item.id)}
            <div class="item-layer">
              <ItemLayer
                {item}
                renderProvider={$itemModelType == MODEL_TYPE.STEVE
                  ? defaultRenderProvider.steve
                  : defaultRenderProvider.alex}
                showLabels={false}
                selectable={!isItemSet}
                controls={isItemSet}
                modelName={$localPackage.model}
                link={item.type == LAYER_TYPE.REMOTE
                  ? "/design/" + item.sourcePackageId + "/" + item.id
                  : null}
                bind:label={item.name}
                readonly={true}
              />
            </div>
          {/each}
        {:else}
          <div class="item-variants">
            {#each $localPackage.layers as layer (layer.id + layer.id)}
              <ItemVariant
                item={layer}
                renderProvider={$itemModelType == MODEL_TYPE.STEVE
                  ? defaultRenderProvider.steve
                  : defaultRenderProvider.alex}
                modelName={$itemModelType}
                label={layer.name}
                on:click={() => ($itemRenderConfig.selectedLayer = layer)}
                selected={$itemRenderConfig.selectedLayer == layer}
              />
            {/each}
          </div>
        {/if}
        <br />
      {:else if isItemSet}
        <Placeholder style="height:66px;margin-bottom:12px;" />
      {:else}
        <div style="margin-bottom:22px;" class="horizontal-list">
          {#each new Array(8) as _}
            <Placeholder style="height:68px;width:68px;" />
          {/each}
        </div>
      {/if}
      {#if isItemSet && integrationSettings != null}
        <SectionTitle label="Capes" placeholder={!loaded} />
        {#if integrationSettings.capes.length == 0}
          <InfoLabel
            closeable={false}
            type="info"
            description="You have no capes linked to your minecraft account"
          />
        {:else}
          <div class="horizontal-list">
            {#each integrationSettings.capes as cape}
              <ItemCape
                item={cape}
                on:click={() => setCape(cape)}
                selected={$itemRenderConfig.cape?.id == cape.id}
              />
            {/each}
            <ItemCape
              on:click={() => setCape(null)}
              selected={$itemRenderConfig.cape?.id == null}
              ><div style="margin:12px;">
                {@html CloseBoxIcon}
              </div></ItemCape
            >
          </div>
        {/if}
        <br />
      {/if}
      {#if $localPackage.description != null && $localPackage.description.trim().length > 0}
        <SectionTitle label={$_("description")} placeholder={!loaded} />
        <div id="item-description" class="description">
          <Placeholder style="height:48px;margin-bottom:8px;" {loaded}>
            {$localPackage.description}
            <br />
          </Placeholder>
          <br />
        </div>
      {/if}
      <SectionTitle label={$_("model")} placeholder={!loaded} />
      <Placeholder style="height:48px;margin-bottom:8px;" {loaded}>
        <ModelSelection bind:group={$itemModelType} />
      </Placeholder>
      <br />
      <Placeholder style="height:24px;width:200px;" {loaded}>
        <Checkbox
          label={$_("modelOpt.oldFormat")}
          style="margin-left:12px;"
          bind:value={$itemRenderConfig.isFlatten}
        />
      </Placeholder>
      <br />
      {#if loaded}
        <OutfitActions
          readonly={true}
          setMySkinAvailable={$currentUser?.id != null &&
            isItemSet &&
            integrationSettings?.id != null}
          isPackageInWardrobe={$localPackage.isInWardrobe}
          outfitPackage={$localPackage}
          {isSkinSetting}
          loading={!loaded}
          mobile={$isMobileView}
          on:download={downloadImage}
          on:skinSet={skinSetted}
          on:collectionDialog={openCollectionPicker}
          on:addToWardrobe={addToWardrobe}
          on:removeFromWardrobe={removeFromWardrobe}
        />
      {:else}
        <div style="display: flex; gap:8px; margin-top:36px;">
          <Placeholder style="height:42px;margin-bottom:8px;" />
          <Placeholder style="height:42px;margin-bottom:8px;" />
        </div>
      {/if}
    </div>
  </div>
  <Dialog bind:open={isCollectionDialogOpen} label="Collections"
    ><CollectionPicker
      items={pickerCollections}
      loading={isCollectionPickerLoading}
      on:add={addToCollection}
      on:remove={removeFromCollection}
    />
  </Dialog>
</div>

<style lang="scss">
  @import "style.scss";
</style>
