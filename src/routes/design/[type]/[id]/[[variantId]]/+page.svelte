<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    derived,
    writable,
    type Readable,
    type Writable,
    readable,
  } from "svelte/store";
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

  import { FileData, OutfitLayer, OutfitPackage } from "$data/common";
  import {
    alexModel,
    steveModel,
    currentUser,
    wardrobe,
    defaultRenderer,
    isReadyForData,
    userSettings,
    isMobileView,
    isUserGuest,
  } from "$data/cache";
  import {
    CHANGE_TYPE,
    DefaultPackage,
    LAYER_TYPE,
    MODEL_TYPE,
    PACKAGE_TYPE,
  } from "$data/consts";

  import DefaultAnimation from "$animation/default";
  import HandsUpAnimation from "$animation/handsup";

  import {
    ExportImageLayers,
    ExportImageString,
  } from "$src/helpers/data/dataTransferHelper.js";
  import { sortOutfitLayersByColor } from "$src/helpers/image/imageDataHelpers.js";
  import {
    AddToCollection,
    IsItemInCollection,
    RemoveFromCollection,
  } from "$src/helpers/other/apiHelper";

  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { AddDownload } from "$src/api/social";
  import { GetAnimationForPackageChange } from "$src/helpers/render/animationHelper.js";
  import type { OutfitPackageInstance } from "$src/helpers/package/packageInstanceHelper.js";
  import Dialog from "$lib/components/base/Dialog/Dialog.svelte";
  import CollectionPicker from "$lib/components/outfit/CollectionPicker/CollectionPicker.svelte";
  import {
    getLayersForRender,
    getPackageInstanceForType,
    prepareLayersForRender,
  } from "$src/helpers/view/designHelper.js";
  import { replaceState } from "$app/navigation";
  import {
    AddItemToWardrobe,
    IsItemInWardrobe,
    RemoveItemFromWardrobe,
  } from "$src/api/wardrobe.js";
  import OutfitActions from "$lib/components/other/OutfitActions/OutfitActions.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import { ModelExportConfig } from "$src/data/model.js";
  export let data;
  const localPackage: Writable<OutfitPackage> = writable(DefaultPackage);
  const itemLayers: Writable<OutfitLayer[]> = propertyStore(
    localPackage,
    "layers"
  );
  const itemModelType: Writable<string> = propertyStore(localPackage, "model");
  const itemName: Writable<string> = propertyStore(localPackage, "name");

  const isItemSet = readable(data.type == PACKAGE_TYPE.OUTFIT_SET);
  const itemModel: Readable<string> = derived(
    itemModelType,
    ($itemModelType) =>
      $itemModelType == MODEL_TYPE.ALEX ? $alexModel : $steveModel
  );

  const selectedVariant: Writable<OutfitLayer> = writable(null);
  const modelExportConfig: Writable<ModelExportConfig> = writable(
    new ModelExportConfig()
  );

  let currentInstance: OutfitPackageInstance = null;
  let sortedItemLayers = [];
  let modelTexture: string = null;
  let loaded = false;
  let isDragging = false;
  let rendererLayers: FileData[] = [];
  let defaultRenderProvider;
  let flatRender = false;

  let isCollectionDialogOpen = false;

  let isPackageInWardrobe = false;
  let updateAnimation: (animation: any) => void = () => {};

  onMount(async () => {
    let type = data.type;
    let id = data.id;
    let variantId = data.variantId;
    let outfitPackage;

    isReadyForData.subscribe(async (readyness) => {
      if (loaded || !readyness) {
        loaded = false;
      }
      if (loaded || !readyness.fullReadyness) return;

      currentInstance = getPackageInstanceForType(type);
      outfitPackage = await currentInstance.fetch(id);
      if (outfitPackage) localPackage.set(outfitPackage);

      defaultRenderProvider =
        await CreateDefaultRenderProvider($defaultRenderer);

      const varaint = outfitPackage.layers.find(
        (x) => x.variantId == variantId
      );
      if (varaint) selectedVariant.set(varaint);

      if (!$isUserGuest) {
        //patching
        isPackageInWardrobe = IsItemInWardrobe($localPackage, $wardrobe);
        if (
          !isPackageInWardrobe &&
          outfitPackage.publisher.id == $currentUser?.id
        )
          addToWardrobe();
      }
      loaded = true;
      updateTexture();
      if (!$isItemSet) sortLayersByColor();
    });
  });

  //export
  const downloadImage = async () => {
    await ExportImageString(modelTexture, $localPackage.name);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
    await AddDownload($localPackage.id, $localPackage.type);
    if ($localPackage.social.downloads == null)
      $localPackage.social.downloads = 0;
    $localPackage.social.downloads += 1;
  };

  //texture
  const updateTexture = async () => {
    if (!loaded) return;

    if ($selectedVariant == null && $itemLayers.length > 0)
      $selectedVariant = $itemLayers[0];

    $modelExportConfig.modelType = $itemModelType;
    $modelExportConfig.flat = flatRender;
    rendererLayers = prepareLayersForRender(
      $itemLayers,
      $selectedVariant,
      $itemModelType,
      $isItemSet
    );
    modelTexture = await getLayersForRender(rendererLayers, $isItemSet, $modelExportConfig);
  };
  const sortLayersByColor = async function () {
    sortedItemLayers = await sortOutfitLayersByColor(
      $itemLayers,
      $itemModelType
    );
  };

  //sharing
  const addToWardrobe = async function () {
    isPackageInWardrobe = await AddItemToWardrobe($localPackage);
    $localPackage.social.likes += 1;
  };
  const removeFromWardrobe = async function () {
    isPackageInWardrobe = await RemoveItemFromWardrobe(
      $localPackage.id,
      $localPackage.type
    );
    $localPackage.social.likes -= 1;
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
  //subs
  itemModelType.subscribe((model) => {
    if (!loaded) return;
    updateTexture();
  });
  selectedVariant.subscribe((variant) => {
    if (!loaded) return;
    updateTexture();
    if (!$isItemSet)
      replaceState(
        "/design/" +
          $localPackage.type +
          "/" +
          $localPackage.id +
          "/" +
          $selectedVariant.variantId,
        null
      );
  });
  itemModelType.subscribe(async (model) => {
    if (!loaded || !$isItemSet) return;
    applyAnimations($localPackage, CHANGE_TYPE.MODEL_TYPE_CHANGE, 0);
  });
</script>

<div class="item-page">
  <div class="render-data">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="render" class:drop-hover={isDragging}>
      {#if loaded}
        <DynamicRender
          texture={modelTexture}
          model={$itemModel}
          modelName={$localPackage.model}
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
            ? $itemLayers.length > 0
              ? $itemLayers[0][$itemModelType].type
              : $_("outfit")
            : $_("outfit_set")}
          placeholder={!loaded}
        />
        <div id="item-title" class="title">
          {#if loaded}
            {$itemName}
          {:else}
            <Placeholder style="height:30px;" />
          {/if}
        </div>

        {#if loaded}
          <div style="display: flex;gap:4px;height:24px">
            <Label variant="unique">{$localPackage.publisher.name}</Label>
            {#if $isItemSet && $localPackage.id == $userSettings.currentSkin?.id}
              <Label variant="ancient">Current skin</Label>
            {/if}
            &nbsp;
            <SocialInfo data={$localPackage.social} />
          </div>
        {:else}
          <Placeholder style="height:26px;max-width:100px;" />
        {/if}
      </div>
      <br />
      <SectionTitle
        label={$isItemSet ? $_("layers") : $_("variants")}
        placeholder={!loaded}
      />
      {#if loaded}
        {#if $localPackage?.local?.warnings?.find((x) => x == "missingLayer")}
          <InfoLabel
            label={"Missing outfit"}
            description={"Certain outfits were not loaded successfully."}
          />
        {/if}
        {#if $isItemSet}
          {#each $itemLayers as item (item.id + item.variantId)}
            <div class="item-layer">
              <ItemLayer
                {item}
                renderProvider={$itemModelType == MODEL_TYPE.STEVE
                  ? defaultRenderProvider.steve
                  : defaultRenderProvider.alex}
                showLabels={false}
                selectable={!$isItemSet}
                controls={$isItemSet}
                modelName={$localPackage.model}
                link={item.type == LAYER_TYPE.REMOTE
                  ? "/design/outfit/" + item.id + "/" + item.variantId
                  : null}
                bind:label={item.name}
                readonly={true}
              />
            </div>
          {/each}
        {:else}
          <div class="item-variants">
            {#each sortedItemLayers as layer (layer.id + layer.variantId)}
              <ItemVariant
                item={layer}
                renderProvider={$itemModelType == MODEL_TYPE.STEVE
                  ? defaultRenderProvider.steve
                  : defaultRenderProvider.alex}
                modelName={$itemModelType}
                label={layer.name}
                on:click={() => ($selectedVariant = layer)}
                selected={$selectedVariant == layer}
              />
            {/each}
          </div>
        {/if}
        <br />
      {:else if $isItemSet}
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
          {#if loaded}
            {$localPackage.description}
            <br />
          {:else}
            <Placeholder style="height:48px;margin-bottom:8px;" />
          {/if}
          <br />
        </div>
      {/if}
      <SectionTitle label={$_("model")} placeholder={!loaded} />
      {#if loaded}
        <ModelSelection bind:group={$itemModelType} disabled={!loaded} />
      {:else}
        <Placeholder style="height:48px;margin-bottom:8px;" />
      {/if}
      <br />
      {#if loaded}
        <div style="margin-left:12px;">
          <Checkbox
            label="Old format model"
            bind:value={flatRender}
            on:change={updateTexture}
          />
        </div>
      {:else}
        <Placeholder style="height:24px;width:200px;" />
      {/if}
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
