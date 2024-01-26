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

  import {
    FileData,
    MinerobeUser,
    OutfitLayer,
    OutfitPackage,
  } from "$data/common";
  import {
    alexModel,
    steveModel,
    currentUser,
    wardrobe,
    baseTexture,
    defaultRenderer,
    isReadyForData,
    userSettings,
    isMobileView,
  } from "$data/cache";
  import { LAYER_TYPE, MODEL_TYPE, PACKAGE_TYPE } from "$data/consts";

  import DownloadIcon from "$icons/download.svg?raw";
  import HearthIcon from "$icons/heart.svg?raw";

  import DefaultAnimation from "$animation/default";
  import HandsUpAnimation from "$animation/handsup";

  import { ExportImageLayers } from "$src/helpers/imageOperationsHelper.js";
  import { sortOutfitLayersByColor } from "$src/helpers/imageDataHelpers.js";
  import { mergeImages } from "$src/data/imageMerger.js";
  import {
    AddItemToWardrobe,
    IsItemInWardrobe,
    RemoveItemFromWardrobe,
  } from "$src/helpers/apiHelper";

  import { FetchOutfit } from "$src/api/outfits";
  import { FetchOutfitSet } from "$src/api/sets";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { AddDownload } from "$src/api/social";
  import SetSkinButton from "$component/other/SetSkinButton/SetSkinButton.svelte";
  export let data;
  const localPackage: Writable<OutfitPackage> = writable(
    new OutfitPackage(
      "New skin",
      MODEL_TYPE.ALEX,
      [],
      PACKAGE_TYPE.OUTFIT,
      new MinerobeUser(null, null, null),
      null,
      false
    )
  );
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

  let sortedItemLayers = [];
  let modelTexture: string = null;
  let loaded = false;
  let isGuest = false;
  let isDragging = false;
  let rendererLayers: FileData[] = [];
  let defaultRenderProvider;

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
      isGuest = readyness.user == null;
      if (!loaded && readyness.fullReadyness) {
        outfitPackage =
          type == PACKAGE_TYPE.OUTFIT
            ? await FetchOutfit(id)
            : await FetchOutfitSet(id);
        if (outfitPackage) {
          localPackage.set(outfitPackage);
        }
        defaultRenderProvider =
          await CreateDefaultRenderProvider($defaultRenderer);

        loaded = true;
        if (!isGuest) {
          isPackageInWardrobe = IsItemInWardrobe($localPackage, $wardrobe);
          const varaint = outfitPackage.layers.find(
            (x) => x.variantId == variantId
          );
          if (varaint) {
            selectedVariant.set(varaint);
          } else {
            $selectedVariant = $itemLayers[0];
          }
          updateTexture();
          //patching
          if (
            !isPackageInWardrobe &&
            outfitPackage.publisher.id == $currentUser?.id
          )
            addToWardrobe();
        } else {
          updateTexture();
        }
        if (!$isItemSet) sortLayersByColor();
      }
    });
  });

  //export
  const downloadImage = async () => {
    await ExportImageLayers(rendererLayers, $itemModelType, $itemName);
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

    if ($isItemSet) rendererLayers = $itemLayers.map((x) => x[$itemModelType]);
    else {
      if ($itemLayers.length > 0) {
        if ($selectedVariant == null) $selectedVariant = $itemLayers[0];
        rendererLayers = [$selectedVariant[$itemModelType]];
      } else {
        rendererLayers = [];
      }
    }
    modelTexture = await mergeImages(
      [
        ...rendererLayers.map((x) => x.content),
        $isItemSet == true ? $userSettings?.baseTexture : null,
        $baseTexture,
      ]
        .reverse()
        .filter((x) => x != null && x.length > 0),
      undefined,
      $itemModelType
    );
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
  //subs
  itemModelType.subscribe((model) => updateTexture());
  selectedVariant.subscribe((variant) => updateTexture());
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
            <Placeholder style="height:42px;" />
          {/if}
        </div>

        {#if loaded}
          <div style="display: flex;gap:4px;height:24px">
            <Label variant="unique">{$localPackage.publisher.name}</Label>
            {#if $isItemSet && ($localPackage.id == $userSettings.currentSkin?.id)}
              <Label variant="ancient">Current skin</Label>
            {/if}
            &nbsp;
            <SocialInfo data={$localPackage.social} />
          </div>
        {:else}
          <Placeholder style="height:24px;max-width:100px;" />
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
        <div style="display:flex;flex-wrap:wrap;margin-bottom:22px;">
          {#each new Array(8) as _}
            <Placeholder
              style="height:68px;width:68px;margin-bottom:8px;margin-right:8px;"
            />
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
        <br />
        <br />
      {:else}
        <Placeholder style="height:48px;margin-bottom:8px;" />
      {/if}
      {#if loaded}
        <div class="item-actions">
          {#if $userSettings?.linkedMinecraftAccount?.name != null && $isItemSet}
          <SetSkinButton item={$localPackage} texture={modelTexture} style="flex:1;"/>
          {/if}
          <div style={"display: flex; gap:8px;"+(!$isItemSet?"flex:1;":"")}>
            <button
              id="download-action"
              title={$_("download")}
              on:click={downloadImage}
              class:icon={!$isMobileView &&
                $isItemSet &&
                $userSettings?.linkedMinecraftAccount?.name != null}
              class:disabled={(!$isItemSet
                ? $selectedVariant == null
                : false) || !loaded}
              >{@html DownloadIcon}
              {#if $isMobileView || !$isItemSet || $userSettings?.linkedMinecraftAccount?.name == null}
                {$_("download")}
              {/if}
            </button>
            {#if $localPackage.publisher?.id != $currentUser?.id && $currentUser != null}
              {#if isPackageInWardrobe == false || isGuest}
                <button
                  id="add-to-wardrobe"
                  on:click={addToWardrobe}
                  title="Add to wardrobe"
                  class:disabled={!loaded || isGuest}
                  class="icon tertiary">{@html HearthIcon}</button
                >
              {:else}
                <button
                  id="remove-from-wardrobe"
                  title="Already in wardrobe"
                  class:disabled={!loaded || isGuest}
                  on:click={removeFromWardrobe}
                  class="icon">{@html HearthIcon}</button
                >
              {/if}
            {/if}
          </div>
        </div>
      {:else}
        <div style="display: flex; gap:8px; margin-top:36px;">
          <Placeholder style="height:42px;margin-bottom:8px;" />
          <Placeholder style="height:42px;margin-bottom:8px;" />
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
