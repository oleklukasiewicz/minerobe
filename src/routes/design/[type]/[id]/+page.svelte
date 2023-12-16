<script lang="ts">
  import { _ } from "svelte-i18n";
  import * as THREE from "three";
  import {
    derived,
    writable,
    type Readable,
    type Writable,
  } from "svelte/store";
  import { propertyStore } from "svelte-writable-derived";
  import { onMount } from "svelte";

  import SkinRender from "$lib/render/SkinRender/SkinRender.svelte";
  import ItemVariant from "$lib/ItemVariant/ItemVariant.svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";

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
    appState,
    baseTexture,
  } from "$data/cache";
  import { APP_STATE, MODEL_TYPE, PACKAGE_TYPE } from "$data/consts";

  import DownloadIcon from "$icons/download.svg?raw";
  import HearthIcon from "$icons/heart.svg?raw";

  import DefaultAnimation from "$animation/default";
  import HandsUpAnimation from "$animation/handsup";

  import { ExportImageLayers } from "$helpers/imageOperations";
  import { mergeImages } from "$helpers/imageMerger";
  import { page } from "$app/stores";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "$lib/ModelSelection/ModelSelection.svelte";
  import { GetAnimationForType } from "$src/helpers/imageDataHelpers";
  import { FetchOutfit } from "$src/api/outfits";
  import { FetchOutfitSet } from "$src/api/sets";
  import {
    AddItemToWardrobe,
    IsItemInWardrobe,
    RemoveItemFromWardrobe,
  } from "$src/helpers/apiHelper";

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

  const isItemSet = derived(
    localPackage,
    ($localPackage) => $localPackage.type == PACKAGE_TYPE.OUTFIT_SET
  );
  const itemModel: Readable<string> = derived(
    itemModelType,
    ($itemModelType) =>
      $itemModelType == MODEL_TYPE.ALEX ? $alexModel : $steveModel
  );

  const selectedVariant: Writable<OutfitLayer> = writable(null);

  let modelTexture: string = null;
  let loaded = false;
  let isGuest = false;
  let updatedLayer: OutfitLayer = null;
  let layersRenderer;
  let isDragging = false;
  let rendererLayers: FileData[] = [];

  let isPackageInWardrobe = false;
  let updateAnimation: (animation: any) => void = () => {};

  onMount(async () => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    let type = $page.params.type;
    let id = $page.params.id;
    let outfitPackage;

    appState.subscribe(async (state) => {
      isGuest = state == APP_STATE.LOADING;
      if (!loaded) {
        outfitPackage =
          type == PACKAGE_TYPE.OUTFIT
            ? await FetchOutfit(id)
            : await FetchOutfitSet(id);
        if (outfitPackage) {
          localPackage.set(outfitPackage);
        }
        loaded = true;
        updateTexture();
      }
      if (!isGuest) {
        isPackageInWardrobe = IsItemInWardrobe($localPackage, $wardrobe);
        $selectedVariant = $itemLayers[0];
      }
    });
  });

  //export
  const downloadImage = async () => {
    await ExportImageLayers(rendererLayers, $itemModelType, $itemName);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
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
      [...rendererLayers.map((x) => x.content), $baseTexture].reverse(),
      undefined,
      $itemModelType
    );
    if (updatedLayer) {
      const anim = GetAnimationForType(updatedLayer[$itemModelType]?.type);
      if (anim) {
        await updateAnimation(anim);
        await updateAnimation(DefaultAnimation);
      }
    }
  };

  //sharing
  const addToWardrobe = async function () {
    await AddItemToWardrobe($localPackage);
    isPackageInWardrobe = true;
  };
  const removeFromWardrobe = async function () {
    await RemoveItemFromWardrobe($localPackage.id, $localPackage.type);
    isPackageInWardrobe = false;
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
        <SkinRender
          texture={modelTexture}
          model={$itemModel}
          modelName={$itemModelType}
          onlyRenderSnapshot={false}
          animation={DefaultAnimation}
          bind:changeAnimation={updateAnimation}
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
            <Placeholder style="height:48px;margin-bottom:8px;" />
          {/if}
        </div>
        {#if loaded}
          <span class="label unique">{$localPackage.publisher.name}</span>
        {/if}
      </div>

      <br />
      <SectionTitle
        label={$isItemSet ? $_("layers") : $_("variants")}
        placeholder={!loaded}
      />
      {#if loaded}
        {#if $isItemSet}
          {#each $itemLayers as item (item.id + item.variantId)}
            <div class="item-layer">
              <ItemLayer
                texture={item}
                showLabels={false}
                selectable={!$isItemSet}
                controls={$isItemSet}
                model={$itemModel}
                modelName={$localPackage.model}
                renderer={layersRenderer}
                bind:label={item.name}
                readonly={true}
              />
            </div>
          {/each}
        {:else}
          <div class="item-variants">
            {#each $itemLayers as layer (layer.id + layer.variantId)}
              <ItemVariant
                texture={layer[$itemModelType]}
                model={$itemModel}
                modelName={$itemModelType}
                renderer={layersRenderer}
                label={layer.name}
                on:click={() => ($selectedVariant = layer)}
                selected={$selectedVariant == layer}
              />
            {/each}
          </div>
        {/if}
      {/if}
      <br />
      <SectionTitle label={$_("model")} placeholder={!loaded} />
      <ModelSelection bind:group={$itemModelType} disabled={!loaded} />
      <br />
      <br />
      <div class="item-actions">
        <button
          id="download-action"
          on:click={downloadImage}
          class:disabled={(!$isItemSet ? $selectedVariant == null : false) ||
            !loaded}>{@html DownloadIcon}{$_("download")}</button
        >
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
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
