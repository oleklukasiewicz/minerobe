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
  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "$lib/ModelSelection/ModelSelection.svelte";

  import {
    APP_STATE,
    LAYER_TYPE,
    MODEL_TYPE,
    PACKAGE_TYPE,
  } from "$data/consts";
  import { FileData, OutfitLayer, OutfitPackage } from "$data/common";
  import {
    itemPackage,
    alexModel,
    steveModel,
    currentUser,
    appState,
    baseTexture,
    wardrobe,
  } from "$data/cache";

  import DownloadIcon from "$icons/download.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import HearthIcon from "$icons/heart.svg?raw";
  import CloudIcon from "$icons/cloud.svg?raw";
  import SpotlightIcon from "$icons/spotlight.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import TrashIcon from "$icons/trash.svg?raw";
  import PlusIcon from "$icons/plus.svg?raw";

  import DefaultAnimation from "$animation/default";
  import NewOutfitBottomAnimation from "$animation/bottom";
  import ClapAnimation from "$animation/clap";
  import HandsUpAnimation from "$animation/handsup";
  import WavingAnimation from "$animation/waving";

  import {
    ExportImageLayers,
    ImportImage,
    ImportImagePackageJsonFromFile,
    ImportLayerFromFile,
  } from "$helpers/imageOperations";
  import { mergeImages } from "$helpers/imageMerger";
  import { CreateOutfit, GenerateIdForOutfitLayer } from "$src/api/outfits";
  import Dialog from "$lib/Dialog/Dialog.svelte";
  import OutfitPicker from "$lib/OutfitPicker/OutfitPicker.svelte";
  import {
    AddItemToWardrobe,
    IsItemInWardrobe,
    RemoveItem,
    RemoveItemFromWardrobe,
    ShareItem,
  } from "$src/helpers/apiHelper";
  import {
    navigateToDesign,
    navigateToWardrobe,
  } from "$src/helpers/navigationHelper";
  import { CreateOutfitSet } from "$src/api/sets";
  import { withPrevious } from "svelte-previous";
  import { GetAnimationForPackageChange } from "$src/helpers/animationHelper";

  const itemLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );

  const itemModelType: Writable<string> = propertyStore(itemPackage, "model");
  const itemName: Writable<string> = propertyStore(itemPackage, "name");
  const itemPublisher = propertyStore(itemPackage, "publisher");

  const [currentPackageState, previousPackageState] = withPrevious(
    $itemPackage,
    {requireChange: false,
      isEqual: (a, b) => {
        console.log("isEqual", a?.layers[0]?.variantId , b?.layers[0]?.variantId);
        return a?.layers[0]?.variantId == b?.layers[0]?.variantId;
      },
    }
  );

  const selectedLayer: Writable<OutfitLayer> = writable(null);

  const isItemSet = derived(
    itemPackage,
    ($itemPackage) => $itemPackage.type == PACKAGE_TYPE.OUTFIT_SET
  );
  const itemModel: Readable<string> = derived(
    itemModelType,
    ($itemModelType) =>
      $itemModelType == MODEL_TYPE.ALEX ? $alexModel : $steveModel
  );

  let modelTexture: string = null;
  let loaded = false;

  let layersRenderer;
  let isDragging = false;

  let isPackageInWardrobe = false;
  let rendererLayers: FileData[] = [];

  let isOutfitPickerOpen = false;
  let isDeleteDialogOpen = false;

  let updateAnimation = function (anim) {};

  onMount(async () => {
    layersRenderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
    });
    appState.subscribe((state) => {
      if (loaded || state != APP_STATE.READY) {
        loaded = false;
        return;
      }
      loaded = true;
      isPackageInWardrobe = IsItemInWardrobe($itemPackage, $wardrobe);
      updateTexture();
    });
  });

  //layers / texture
  const upLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index > 0) {
      itemLayers.update((layers) => {
        let temp = layers[index - 1];
        layers[index - 1] = layers[index];
        layers[index] = temp;
        return layers;
      });
    }
  };
  const downLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index < $itemLayers.length - 1) {
      itemLayers.update((layers) => {
        let temp = layers[index + 1];
        layers[index + 1] = layers[index];
        layers[index] = temp;
        return layers;
      });
    }
  };
  const removeLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    itemLayers.update((layers) => {
      let refresh = false;

      if (!$isItemSet && $selectedLayer.name == layers[index].name) {
        refresh = true;
      }
      layers.splice(index, 1);
      if (refresh) {
        if ($itemLayers.length > 0) $selectedLayer = layers[0];
        else $selectedLayer = null;
      }
      return layers;
    });
  };
  const addImageVariant = async function (data) {
    const layer = data.detail.texture;
    const newLayer = await ImportImage();
    itemLayers.update((layers) => {
      const index = layers.indexOf(layer);
      if ($itemModelType == MODEL_TYPE.ALEX) {
        layers[index].alex = newLayer;
      } else {
        layers[index].steve = newLayer;
      }
      return layers;
    });
    updateAnimation(NewOutfitBottomAnimation);
  };
  const updateTexture = async () => {
    if (!loaded) return;

    if ($isItemSet) rendererLayers = $itemLayers.map((x) => x[$itemModelType]);
    else {
      if ($itemLayers.length > 0) {
        if ($selectedLayer == null) $selectedLayer = $itemLayers[0];
        rendererLayers = [$selectedLayer[$itemModelType]];
      } else {
        rendererLayers = [];
      }
    }

    modelTexture = await mergeImages(
      [...rendererLayers.map((x) => x.content), $baseTexture].reverse(),
      undefined,
      $itemModelType
    );
  };
  const addNewRemoteLayer = async function (outfit: OutfitPackage) {
    isOutfitPickerOpen = false;
    let layer = outfit.layers[0];
    //check if layer already exists
    if (
      $itemLayers.find(
        (x) => x.id == outfit.id && x.variantId == layer.variantId
      )
    )
      return;

    itemLayers.update((layers) => {
      layer.id = outfit.id;
      layer.type = LAYER_TYPE.REMOTE;
      const newRemote = layer;
      layers.unshift(newRemote);
      return layers;
    });
  };

  //imports / export
  const importLayer = async function () {
    const newLayer = await ImportImage();
    itemLayers.update((layers) => {
      let newOutfit;
      if ($itemModelType == MODEL_TYPE.ALEX)
        newOutfit = new OutfitLayer(newLayer.fileName, null, newLayer, null);
      else newOutfit = new OutfitLayer(newLayer.fileName, newLayer, null, null);
      newOutfit.variantId = GenerateIdForOutfitLayer();
      layers.unshift(newOutfit);

      return layers;
    });
  };

  const downloadImage = async () => {
    await ExportImageLayers(rendererLayers, $itemModelType, $itemName);
    await updateAnimation(HandsUpAnimation);
    await updateAnimation(DefaultAnimation);
  };

  //sharing / wardrobe
  const sharePackage = async function () {
    await ShareItem($itemPackage);
    $itemPackage.isShared = true;
  };
  const addToWardrobe = async function () {
    AddItemToWardrobe($itemPackage);
    isPackageInWardrobe = true;
  };
  const removeFromWardrobe = async function () {
    await RemoveItemFromWardrobe($itemPackage.id, $itemPackage.type);
    isPackageInWardrobe = false;
  };

  //drag and drop
  const handleRenderDrop = async function (event) {
    event.preventDefault();

    if (event.dataTransfer.items) {
      for (var i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === "file") {
          var file = event.dataTransfer.items[i].getAsFile();
          if (file.type.startsWith("image/")) {
            let newLayer = await ImportLayerFromFile(file);
            itemLayers.update((layers) => {
              let newOutfit;
              if ($itemModelType == MODEL_TYPE.ALEX)
                newOutfit = new OutfitLayer(
                  newLayer.fileName,
                  null,
                  newLayer,
                  null
                );
              else
                newOutfit = new OutfitLayer(
                  newLayer.fileName,
                  newLayer,
                  null,
                  null
                );
              layers.unshift(newOutfit);
              newOutfit.variantId = GenerateIdForOutfitLayer();
              return layers;
            });
          } else {
            let newPackage = await ImportImagePackageJsonFromFile(
              file,
              $itemPackage
            );
            $itemPackage = newPackage;
            const random = Math.random();

            if (random < 0.2) {
              updateAnimation(HandsUpAnimation);
            } else {
              if (random < 0.4) updateAnimation(WavingAnimation);
              else updateAnimation(ClapAnimation);
            }
            updateAnimation(DefaultAnimation);
          }
        }
      }
    }
    isDragging = false;
  };
  const handleRenderDragOver = function (event) {
    event.preventDefault();
  };
  const handleRenderDragEnter = function (event) {
    isDragging = true;
  };
  const handleRenderDragLeave = function (event) {
    isDragging = false;
  };
  const deletePackage = function () {
    navigateToWardrobe();
    RemoveItem($itemPackage);
  };
  //subscribtions
  itemPackage.subscribe((pack) => {
    isPackageInWardrobe = IsItemInWardrobe(pack, $wardrobe);
    $currentPackageState = pack;
    if($previousPackageState == null) return;
    console.log(GetAnimationForPackageChange($previousPackageState, $currentPackageState));
  });
  itemLayers.subscribe((layers) => updateTexture());
  itemModelType.subscribe((model) => updateTexture());
  selectedLayer.subscribe((layer) => (!$isItemSet ? updateTexture() : null));
</script>

<div class="item-page">
  {#if $itemPackage.id != null}
    <div class="render-data">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="render"
        class:drop-hover={isDragging}
        on:drop={handleRenderDrop}
        on:dragover={handleRenderDragOver}
        on:dragenter={handleRenderDragEnter}
        on:dragleave={handleRenderDragLeave}
      >
        {#if loaded}
          <SkinRender
            texture={modelTexture}
            model={$itemModel}
            modelName={$itemPackage.model}
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
          <SectionTitle label={$_("name")} placeholder={!loaded} />
          {#if loaded}
            <div style="display:flex; flex-direction:row">
              <input
                id="item-title"
                class:disabled={$itemPublisher.id != $currentUser?.id}
                class="title-input"
                bind:value={$itemPackage.name}
              />
              <button
                class="icon secondary icon-small small"
                style="margin-top: 8px;"
                on:click={() => (isDeleteDialogOpen = true)}
                >{@html TrashIcon}</button
              >
            </div>
          {:else}
            <Placeholder style="height:48px;margin-bottom:8px;" />
          {/if}
          {#if loaded}
            <span class="label common"
              >{$itemPackage.type == PACKAGE_TYPE.OUTFIT
                ? $_("outfit")
                : $_("outfit_set")}</span
            >
            {#if $itemPackage.isShared}
              <span class="label rare" style="margin-left:8px"
                >{$_("shared")}</span
              >
            {/if}
            <br />
            <br />
          {/if}
        </div>
        <SectionTitle
          label={$isItemSet ? $_("layers") : $_("variants")}
          placeholder={!loaded}
        />
        <div class="item-layers">
          {#if loaded}
            {#each $itemLayers as item, index (item.id + item.variantId)}
              <div class="item-layer">
                <ItemLayer
                  texture={item}
                  selectable={!$isItemSet}
                  controls={$isItemSet}
                  model={$itemModel}
                  readonly={$itemPublisher.id != $currentUser?.id}
                  modelName={$itemPackage.model}
                  renderer={layersRenderer}
                  bind:label={item.name}
                  on:addvariant={addImageVariant}
                  on:down={downLayer}
                  on:up={upLayer}
                  on:remove={removeLayer}
                  canUp={index != 0}
                  canDown={index != $itemLayers.length - 1}
                  selected={item?.name == $selectedLayer?.name}
                  on:click={() => ($selectedLayer = item)}
                />
              </div>
            {/each}
          {/if}
          {#if $itemPublisher.id == $currentUser?.id}
            <form style="display: flex;flex-wrap:wrap;">
              {#if $isItemSet}
                <button
                  id="import-package-action"
                  title={$_("importOutfit")}
                  class:disabled={!loaded}
                  on:click={() => (isOutfitPickerOpen = true)}
                  class="secondary">{@html AddIcon} {$_("importOutfit")}</button
                >
              {/if}
              <button
                id="add-layer-action"
                type="submit"
                class="secondary"
                class:disabled={!loaded}
                on:click={importLayer}
                >{@html ImportPackageIcon}
                {$isItemSet
                  ? $_("layersOpt.addLayer")
                  : $_("layersOpt.addVariant")}</button
              >
            </form>
          {/if}
        </div>
        <br />
        <SectionTitle label={$_("model")} placeholder={!loaded} />
        <ModelSelection bind:group={$itemModelType} disabled={!loaded} />
        <br />
        <br />
        <div class="item-actions">
          <button
            id="download-action"
            on:click={downloadImage}
            class:disabled={$itemLayers.length == 0 || !loaded}
            >{@html DownloadIcon}{$_("download")}</button
          >
          {#if $itemPublisher.id == $currentUser?.id}
            {#if $itemPackage.isShared}
              <a href={"/design/" + $itemPackage.type + "/" + $itemPackage.id}>
                <button
                  style="min-width:100px"
                  id="share-package-action"
                  title={$_("goToItemPage")}
                  class="secondary"
                  >{@html SpotlightIcon} {$_("goToItemPage")}</button
                ></a
              >
            {:else}
              <button
                id="share-package-action"
                on:click={sharePackage}
                class:disabled={!loaded}
                title={$_("sharePackage")}
                class="icon tertiary">{@html CloudIcon}</button
              >
            {/if}
          {/if}
          {#if $itemPublisher.id != $currentUser?.id}
            {#if isPackageInWardrobe == false}
              <button
                id="add-to-wardrobe"
                on:click={addToWardrobe}
                title="Add to wardrobe"
                class:disabled={!loaded}
                class="icon tertiary">{@html HearthIcon}</button
              >
            {:else}
              <button
                on:click={removeFromWardrobe}
                id="add-to-wardrobe"
                class:disabled={!loaded}
                title="Already in wardrobe"
                class="icon">{@html HearthIcon}</button
              >
            {/if}
          {/if}
        </div>
      </div>
    </div>
    <Dialog bind:open={isOutfitPickerOpen}>
      <div class="outfit-picker-dialog">
        <div>
          <h1 style="flex:1;margin-top:0px;">Pick outfit</h1>
          <button
            style="margin: 0px 0px 16px"
            class="icon tertiary"
            on:click={() => {
              isOutfitPickerOpen = false;
            }}
          >
            {@html CloseIcon}
          </button>
        </div>
        {#if loaded && isOutfitPickerOpen}
          <OutfitPicker
            renderer={layersRenderer}
            outfits={$wardrobe.outfits}
            modelName={$wardrobe.studio.model}
            on:select={(e) => addNewRemoteLayer(e.detail)}
          />
        {/if}
      </div>
    </Dialog>
    <Dialog bind:open={isDeleteDialogOpen} style="min-width:30vw">
      <div style="text-align:center;margin:8px;">
        <h2>{$_("dialog.confirmDeleteItem")}</h2>
        <div style="display:flex;flex-direction:row; gap:8px">
          <button
            class="tertiary"
            style="flex:1;"
            on:click={() => {
              isDeleteDialogOpen = false;
            }}
          >
            {@html CloseIcon}
            {$_("cancel")}
          </button>
          <button
            style="flex:1;"
            on:click={() => {
              isDeleteDialogOpen = false;
              deletePackage();
            }}
          >
            {@html TrashIcon}
            {$_("delete")}
          </button>
        </div>
      </div></Dialog
    >
  {:else}
    <div class="item-view-placeholder">
      <!-- svelte-ignore missing-declaration -->
      <button
        on:click={async () => {
          const newSet = await CreateOutfitSet(true);
          navigateToDesign(newSet);
        }}
      >
        {@html PlusIcon}
        <br />
        <span>New set</span>
      </button>
      <button
        on:click={async () => {
          const newSet = await CreateOutfit(true);
          navigateToDesign(newSet);
        }}
      >
        {@html PlusIcon}
        <br />
        <span>New outfit</span>
      </button>
    </div>
  {/if}
</div>

<style lang="scss">
  @import "style.scss";
</style>
