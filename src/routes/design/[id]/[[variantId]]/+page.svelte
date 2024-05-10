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

  import { OutfitLayer, OutfitPackage } from "$data/common";
  import {
    wardrobe,
    defaultRenderer,
    userSettings,
    isMobileView,
    baseTexture,
    appState,
  } from "$data/cache";
  import { replaceState } from "$app/navigation";
  import { OutfitPackageRenderConfig } from "$src/data/model.js";
  import { CreateDefaultRenderProvider } from "$src/data/render";

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

  import DefaultAnimation from "$animation/default";
  import HandsUpAnimation from "$animation/handsup";

  import { ExportImageString } from "$src/helpers/data/dataTransferHelper.js";
  import {
    GetCurrentBaseTexture,
    sortOutfitLayersByColor,
  } from "$src/helpers/image/imageDataHelpers.js";
  import {
    AddToCollection,
    IsItemInCollection,
    RemoveFromCollection,
  } from "$src/helpers/other/apiHelper";
  import { GetAnimationForPackageChange } from "$src/helpers/render/animationHelper.js";
  import { GetPackage } from "$src/api/pack.js";

  export let data;
  const localPackage: Writable<OutfitPackage> = writable(DEFAULT_PACKAGE);
  const itemLayers: Writable<OutfitLayer[]> = propertyStore(
    localPackage,
    "layers"
  );
  const itemModelType: Writable<string> = propertyStore(localPackage, "model");

  const itemRenderConfig: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );

  let isItemSet = false;

  let modelTexture: string = null;
  let loaded = false;
  let defaultRenderProvider;

  let isCollectionDialogOpen = false;

  let isPackageInWardrobe = false;
  let updateAnimation: (animation: any) => void = () => {};

  onMount(async () => {
    let id = data.id;
    let variantId = data.variantId;
    let outfitPackage: OutfitPackage;

    appState.subscribe(async (state) => {
      if (state != APP_STATE.GUEST_READY && state != APP_STATE.USER_READY)
        return;
      defaultRenderProvider =
        await CreateDefaultRenderProvider($defaultRenderer);
      outfitPackage = await GetPackage(id);
      if (!outfitPackage) return;

      localPackage.set(outfitPackage);
      isItemSet = outfitPackage.type == PACKAGE_TYPE.OUTFIT_SET;
      if (!isItemSet) {
        $localPackage.layers = await sortOutfitLayersByColor(
          $localPackage.layers,
          $itemModelType
        );
      }
      const varaint = outfitPackage.layers.find((x) => x.id == variantId);

      $itemRenderConfig = new OutfitPackageRenderConfig(
        $localPackage,
        $localPackage.model == MODEL_TYPE.ALEX ? ALEX_MODEL : STEVE_MODEL,
        undefined,
        !isItemSet,
        varaint ? varaint : $itemLayers[0]
      );
      $itemRenderConfig.setBaseTextureFromString(
        isItemSet &&
          GetCurrentBaseTexture($userSettings, $localPackage.model) != null
          ? GetCurrentBaseTexture($userSettings, $localPackage.model)
          : $baseTexture
      );

      loaded = true;
      updateTexture();
    });
  });

  //export
  const downloadImage = async () => {
    await ExportImageString(
      await $itemRenderConfig.getLayersForRender(true),
      $localPackage.name
    );
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
    if ($localPackage.social.downloads == null)
      $localPackage.social.downloads = 0;
    $localPackage.social.downloads += 1;
  };

  //texture
  const updateTexture = async () => {
    if (!loaded) return;
    modelTexture = await $itemRenderConfig.getLayersForRender(false);
  };
  const skinSetted = function (e) {
    if (e.detail.isSuccessful) {
      applyAnimations($localPackage, CHANGE_TYPE.SKIN_SET, 0);
    }
  };
  //sharing
  const addToWardrobe = async function () {
    
  };
  const removeFromWardrobe = async function () {
   
  };

  //animation
  const applyAnimations = function (
    pack: OutfitPackage,
    changeType,
    layerIndex: number
  ) {
    const anims = GetAnimationForPackageChange(pack, changeType, layerIndex);
    if (anims.filter((x) => x).length >= 1) return;
    anims.forEach((anim) => updateAnimation(anim));
  };
  //collection
  const addToCollection = async function (e) {
    const collection = e.detail.collection;
    if (!IsItemInCollection(collection, $localPackage))
      await AddToCollection(collection, $localPackage);
    isCollectionDialogOpen = false;
  };
  const removeFromCollection = async function (e) {
    const collection = e.detail.collection;
    RemoveFromCollection(collection, $localPackage);
    isCollectionDialogOpen = false;
  };

  itemRenderConfig.subscribe((config) => {
    if (!loaded) return;
    updateTexture();
    if (!isItemSet)
      replaceState(
        "/design/" +
          $localPackage.type +
          "/" +
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
            {#if isItemSet && $localPackage.id == $userSettings.currentSkin?.id}
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
          {#each [...$itemLayers].reverse() as item (item.id + item.id)}
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
                  ? "/design/outfit/" + item.id + "/" + item.id
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
        <div style="display:flex;flex-wrap:wrap;margin-bottom:22px;gap:8px;">
          {#each new Array(8) as _}
            <Placeholder style="height:68px;width:68px;" />
          {/each}
        </div>
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
          label="Old format model"
          style="margin-left:12px;"
          bind:value={$itemRenderConfig.isFlatten}
          on:change={updateTexture}
        />
      </Placeholder>
      <br />
      {#if loaded}
        <OutfitActions
          readonly={true}
          {isPackageInWardrobe}
          outfitPackage={$localPackage}
          {modelTexture}
          loading={!loaded}
          mobile={$isMobileView}
          on:download={downloadImage}
          on:skinSet={skinSetted}
          on:collectionDialog={() => (isCollectionDialogOpen = true)}
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
      pack={$localPackage}
      items={$wardrobe.collections || []}
      on:add={addToCollection}
      on:remove={removeFromCollection}
    />
  </Dialog>
</div>

<style lang="scss">
  @import "style.scss";
</style>
