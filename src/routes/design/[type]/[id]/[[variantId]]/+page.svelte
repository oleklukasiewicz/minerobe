<script lang="ts">
  import { _ } from "svelte-i18n";
  import {
    derived,
    writable,
    type Readable,
    type Writable,
  } from "svelte/store";
  import { propertyStore } from "svelte-writable-derived";
  import { onMount } from "svelte";

  import ItemVariant from "$lib/ItemVariant/ItemVariant.svelte";
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";
  import DynamicRender from "$lib/render/DynamicRender.svelte";
  import InfoLabel from "$lib/InfoLabel/InfoLabel.svelte";

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
    defaultRenderer,
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
  import { FetchOutfit } from "$src/api/outfits";
  import { FetchOutfitSet } from "$src/api/sets";
  import {
    AddItemToWardrobe,
    IsItemInWardrobe,
    RemoveItemFromWardrobe,
  } from "$src/helpers/apiHelper";
  import { GetAnimationForType } from "$src/helpers/animationHelper";
  import {
    ConvertRGBToHSL,
    GetColorFromFileData,
  } from "$src/helpers/colorHelper";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { AddDownload } from "$src/api/social";

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

  let sortedItemLayers = [];
  let modelTexture: string = null;
  let loaded = false;
  let isGuest = false;
  let updatedLayer: OutfitLayer = null;
  let isDragging = false;
  let rendererLayers: FileData[] = [];
  let defaultRenderProvider;

  let isPackageInWardrobe = false;
  let updateAnimation: (animation: any) => void = () => {};

  onMount(async () => {
    let type = $page.params.type;
    let id = $page.params.id;
    let variantId = $page.params.variantId;
    let outfitPackage;

    appState.subscribe(async (state) => {
      if (
        loaded ||
        (state != APP_STATE.READY && state != APP_STATE.GUEST_READY)
      ) {
        loaded = false;
      }
      isGuest = state == APP_STATE.GUEST_READY;
      if (!loaded) {
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
        updateTexture();

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
        }
      }
    });
  });

  //export
  const downloadImage = async () => {
    await ExportImageLayers(rendererLayers, $itemModelType, $itemName);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
    await AddDownload($localPackage.id, $localPackage.type);
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

  const sortLayersByColor = async function () {
    let hues = [];
    for (let i = 0; i < $itemLayers.length; i++) {
      let color = ConvertRGBToHSL(
        await GetColorFromFileData($itemLayers[i][$itemModelType])
      );
      hues.push({ h: color.h, item: $itemLayers[i] });
    }
    sortedItemLayers = hues.sort((a, b) => a.h - b.h).map((x) => x.item);
  };

  //subs
  itemModelType.subscribe((model) => updateTexture());
  selectedVariant.subscribe((variant) => updateTexture());
  itemLayers.subscribe((layers) => sortLayersByColor());
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
      {#if $localPackage?.local?.warnings?.find((x) => x == "missingLayer")}
        <InfoLabel
          label={"Missing outfit"}
          description={"Certain outfits were not loaded successfully."}
        />
      {/if}
      {#if loaded}
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
      {/if}
      {#if $localPackage.description != null && $localPackage.description.trim().length > 0}
        <br />
        <SectionTitle label={$_("description")} placeholder={!loaded} />
        <div id="item-description" class="description">
          {#if loaded}
            {$localPackage.description}
          {:else}
            <Placeholder style="height:48px;margin-bottom:8px;" />
          {/if}
        </div>
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
