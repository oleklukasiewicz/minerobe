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

  import ItemLayer from "$lib/ItemLayer/ItemLayer.svelte";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "$lib/ModelSelection/ModelSelection.svelte";
  import DynamicRender from "$lib/render/DynamicRender.svelte";
  import Dialog from "$lib/Dialog/Dialog.svelte";
  import OutfitPicker from "$lib/OutfitPicker/OutfitPicker.svelte";
  import Label from "$lib/Label/Label.svelte";

  import {
    CHANGE_TYPE,
    LAYER_TYPE,
    MODEL_TYPE,
    PACKAGE_TYPE,
  } from "$data/consts";
  import {
    FileData,
    MinerobeUser,
    MinerobeUserSettings,
    OutfitLayer,
    OutfitPackage,
  } from "$data/common";
  import {
    alexModel,
    steveModel,
    currentUser,
    baseTexture,
    defaultRenderer,
    wardrobe,
    isMobileView,
    isReadyForData,
    userSettings,
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
  import MoreHorizontalIcon from "$icons/more-horizontal.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";

  import DefaultAnimation from "$animation/default";

  import {
    ExportImageLayers,
    ImportImage,
    ImportLayerFromFile,
  } from "$helpers/imageOperations";
  import { mergeImages } from "$helpers/imageMerger";
  import {
    CreateOutfit,
    FetchOutfit,
    GenerateIdForOutfitLayer,
    UploadOutfit,
  } from "$src/api/outfits";
  import {
    AddItemToWardrobe,
    FetchWardrobeOutfitsByCategory,
    IsItemInWardrobe,
    RemoveItem,
    ShareItem,
    UnshareItem,
    UpdateItemInWardrobe,
  } from "$src/helpers/apiHelper";
  import {
    navigateToDesign,
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/navigationHelper";
  import {
    CreateOutfitSet,
    FetchOutfitSet,
    UploadOutfitSet,
  } from "$src/api/sets";
  import { GetAnimationForPackageChange } from "$src/helpers/animationHelper";
  import { GetCategoriesFromList } from "$src/helpers/imageDataHelpers";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { FetchWithTokenAuth } from "$src/data/firebase";
  import { LinkMinecraftAccount, SetCurrentSkin } from "$src/api/settings";

  const itemPackage: Writable<OutfitPackage> = writable(
    new OutfitPackage(
      "",
      MODEL_TYPE.ALEX,
      [],
      PACKAGE_TYPE.OUTFIT,
      new MinerobeUser("", "", "")
    )
  );

  const itemLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );
  const itemModelType: Writable<string> = propertyStore(itemPackage, "model");
  const itemPublisher = propertyStore(itemPackage, "publisher");

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
  let isDragging = false;

  let rendererLayers: FileData[] = [];
  let pickerOutfits = [];
  let pickerCategories = ["ALL"];
  let isPickerLoading = true;

  let isOutfitPickerOpen = false;
  let isDeleteDialogOpen = false;
  let isShareDialogOpen = false;

  let defaultProvider = null;

  let updateAnimation = function (anim) {};

  onMount(async () => {
    isReadyForData.subscribe(async (readyness) => {
      if (loaded || !readyness) {
        loaded = false;
        return;
      }
      defaultProvider = await CreateDefaultRenderProvider($defaultRenderer);
      if (readyness.wardrobe && $wardrobe?.studio == null) {
        navigateToWardrobe();
        return;
      }
      if ($wardrobe?.studio != null) {
        if ($wardrobe.studio.type == PACKAGE_TYPE.OUTFIT_SET_LINK) {
          $itemPackage = await FetchOutfitSet($wardrobe.studio.id);
        } else {
          $itemPackage = await FetchOutfit($wardrobe.studio.id);
        }
        loaded = true;
        const categoryCounts = GetCategoriesFromList($wardrobe.outfits);
        pickerCategories = Object.keys(categoryCounts).filter(
          (x) => categoryCounts[x] > 0
        );
        let isPackageInWardrobe = IsItemInWardrobe($itemPackage, $wardrobe);
        //patching
        if (!isPackageInWardrobe && $itemPublisher.id == $currentUser?.id)
          AddItemToWardrobe($itemPackage);
        updateTexture();
      }
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
        applyAnimations($itemPackage, CHANGE_TYPE.LAYER_UP, index - 1);
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
        applyAnimations($itemPackage, CHANGE_TYPE.LAYER_DOWN, index + 1);
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
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_REMOVE, index);
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
    const newLayer = await ImportImage()[0];
    itemLayers.update((layers) => {
      const index = layers.indexOf(layer);
      if ($itemModelType == MODEL_TYPE.ALEX) {
        layers[index].alex = newLayer;
      } else {
        layers[index].steve = newLayer;
      }
      $selectedLayer = layers[index];
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, index);
      return layers;
    });
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
      [
        ...rendererLayers.map((x) => x.content),
        $isItemSet == true ? $userSettings?.baseTexture : null,
        $baseTexture,
      ]
        .reverse()
        .filter((x) => x && x.length > 0),
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
      $selectedLayer = newRemote;
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, 0);
      return layers;
    });
  };
  const applyAnimations = function (
    pack: OutfitPackage,
    changeType,
    layerIndex: number
  ) {
    const anims = GetAnimationForPackageChange(pack, changeType, layerIndex);
    if (anims.filter((x) => x).length == 1) return;
    anims.forEach((anim) => updateAnimation(anim));
  };

  //imports / export
  const importLayer = async function () {
    const newLayers = await ImportImage();
    itemLayers.update((layers) => {
      let newOutfit;
      newLayers.forEach((newLayer) => {
        if ($itemModelType == MODEL_TYPE.ALEX)
          newOutfit = new OutfitLayer(newLayer.fileName, null, newLayer, null);
        else
          newOutfit = new OutfitLayer(newLayer.fileName, newLayer, null, null);
        newOutfit.variantId = GenerateIdForOutfitLayer();
        layers.unshift(newOutfit);
      });
      $selectedLayer = newOutfit;
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, 0);
      return layers;
    });
  };
  const downloadImage = async () => {
    //await ChangeSkin($itemPackage.id,$itemModelType);
    await ExportImageLayers(rendererLayers, $itemModelType, $itemPackage.name);
    applyAnimations($itemPackage, CHANGE_TYPE.DOWNLOAD, 0);
  };

  //sharing / wardrobe
  const sharePackage = async function () {
    await ShareItem($itemPackage);
    $itemPackage.isShared = true;
    applyAnimations($itemPackage, CHANGE_TYPE.SHARE, 0);
  };
  const unSharePackage = async function () {
    await UnshareItem($itemPackage);
    $itemPackage.isShared = false;
    isShareDialogOpen = false;
  };
  const deletePackage = function () {
    navigateToWardrobe();
    RemoveItem($itemPackage);
  };

  const setSkin = async function () {
    await SetCurrentSkin($itemPackage.id, $itemModelType, modelTexture);
  };
  //picker
  const openOutfitPicker = async function () {
    isOutfitPickerOpen = true;
    isPickerLoading = true;
    pickerOutfits = await FetchWardrobeOutfitsByCategory("ALL");
    isPickerLoading = false;
  };
  const fetchByCategory = async function (e) {
    isPickerLoading = true;
    pickerOutfits = await FetchWardrobeOutfitsByCategory(e.detail);
    isPickerLoading = false;
  };

  //drag and drop
  const handleRenderDrop = async function (event) {
    event.preventDefault();

    if (event.dataTransfer.items) {
      const items = Array.from(event.dataTransfer.items) as any[];
      // Filter out non-file items
      const files = items
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile());

      let newLayers = [];
      for (var i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          let newLayer = await ImportLayerFromFile(file);
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
          newOutfit.variantId = GenerateIdForOutfitLayer();
          newLayers.unshift(newOutfit);
          $selectedLayer = newOutfit;
        }
      }
      itemLayers.update((layers) => {
        layers = newLayers.concat(layers);
        return layers;
      });
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, 0);
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
  const goToItemPage = function () {
    navigateToOutfitPackage(
      $itemPackage,
      $isItemSet ? null : $selectedLayer.variantId
    );
  };
  const addNewDropVariant = async function (e) {
    const layer = e.detail.texture;
    const newLayer = await ImportLayerFromFile(e.detail.files[0]);
    let index = 0;
    itemLayers.update((layers) => {
      index = layers.indexOf(layer);
      if ($itemModelType == MODEL_TYPE.ALEX) {
        layers[index].alex = newLayer;
      } else {
        layers[index].steve = newLayer;
      }
      $selectedLayer = layers[index];
      return layers;
    });
    applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, index);
  };
  //subscribtions
  itemPackage.subscribe((pack) => {
    updateTexture();
  });
  selectedLayer.subscribe((layer) => (!$isItemSet ? updateTexture() : null));
  itemPackage.subscribe(async (data: OutfitPackage) => {
    if (data != null && data.id != null) {
      if (data.type == PACKAGE_TYPE.OUTFIT_SET) {
        await UploadOutfitSet(data);
      } else await UploadOutfit(data);
    }
    UpdateItemInWardrobe($itemPackage);
  });
</script>

<div class="item-page">
  {#if $itemPackage?.id != null || loaded == false}
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
          <DynamicRender
            texture={modelTexture}
            model={$itemModel}
            modelName={$itemPackage.model}
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
            <Placeholder style="height:46px;margin-bottom:16px;" />
          {/if}
          {#if loaded}
            <Label variant="common"
              >{$itemPackage.type == PACKAGE_TYPE.OUTFIT
                ? $_("outfit")
                : $_("outfit_set")}</Label
            >
            {#if $itemPackage.isShared}
              <Label variant="rare"
                >{$_("shared")}</Label
              >
            {/if}
            {#if $isItemSet && ($itemPackage.id== $userSettings.currentSkin?.id)}
            <Label variant="ancient">Current skin</Label>
            {/if}
            <br />
          {:else}
            <Placeholder style="height:24px;max-width:100px;" />
          {/if}
          <br />
        </div>
        <SectionTitle
          label={$isItemSet ? $_("layers") : $_("variants")}
          placeholder={!loaded}
        />
        <div class="item-layers">
          {#if loaded}
            {#if $itemPublisher.id == $currentUser?.id && $isMobileView}
              <div style="display: flex;">
                {#if $isItemSet}
                  <button
                    id="import-package-action"
                    title={$_("importOutfit")}
                    style="flex:1;"
                    class:disabled={!loaded}
                    on:click={openOutfitPicker}
                    class="secondary"
                    >{@html AddIcon} {$_("importOutfit")}</button
                  >
                {/if}
                <button
                  id="add-layer-action"
                  style="flex:1;"
                  class="secondary"
                  class:disabled={!loaded}
                  on:click={importLayer}
                  >{@html ImportPackageIcon}
                  {$isItemSet
                    ? $_("layersOpt.addLayer")
                    : $_("layersOpt.addVariant")}</button
                >
              </div>
              <br />
            {/if}
            {#each $itemLayers as item, index (item.id + item.variantId)}
              <div class="item-layer">
                <ItemLayer
                  renderProvider={$itemModelType == MODEL_TYPE.STEVE
                    ? defaultProvider.steve
                    : defaultProvider.alex}
                  selectable={!$isItemSet}
                  controls={$isItemSet}
                  readonly={$itemPublisher.id != $currentUser?.id}
                  modelName={$itemPackage.model}
                  {item}
                  bind:label={item.name}
                  on:addvariant={addImageVariant}
                  on:down={downLayer}
                  on:up={upLayer}
                  on:remove={removeLayer}
                  on:dropvariant={addNewDropVariant}
                  canUp={index != 0}
                  canDown={index != $itemLayers.length - 1}
                  selected={item?.variantId == $selectedLayer?.variantId}
                  on:click={() => ($selectedLayer = item)}
                />
              </div>
            {/each}
          {:else}
            <Placeholder style="height:66px;margin-bottom:4px;" />
            <Placeholder style="height:66px;margin-bottom:4px;" />
          {/if}
          {#if $itemPublisher.id == $currentUser?.id && !$isMobileView}
            <div style="display: flex;flex-wrap:wrap;">
              {#if $isItemSet}
                <button
                  id="import-package-action"
                  title={$_("importOutfit")}
                  style="flex:1;"
                  class:disabled={!loaded}
                  on:click={openOutfitPicker}
                  class="secondary">{@html AddIcon} {$_("importOutfit")}</button
                >
              {/if}
              <button
                id="add-layer-action"
                class="secondary"
                style="flex:1;"
                class:disabled={!loaded}
                on:click={importLayer}
                >{@html ImportPackageIcon}
                {$isItemSet
                  ? $_("layersOpt.addLayer")
                  : $_("layersOpt.addVariant")}</button
              >
            </div>
          {/if}
        </div>
        <br />
        <SectionTitle label={$_("model")} placeholder={!loaded} />
        {#if loaded}
          <ModelSelection bind:group={$itemModelType} disabled={!loaded} />
        {:else}
          <Placeholder style="height:48px;margin-bottom:8px;" />
        {/if}
        <br />
        <SectionTitle label={$_("description")} placeholder={!loaded} />
        {#if !loaded}
          <Placeholder style="height:64px;margin-bottom:8px;" />
        {:else}
          <textarea
            id="item-description"
            class:disabled={$itemPublisher.id != $currentUser?.id}
            class="description-input"
            bind:value={$itemPackage.description}
            placeholder={$_("description")}
          ></textarea>
        {/if}
        <br />
        <br />
        {#if loaded}
          <div class="item-actions">
            {#if $userSettings?.linkedMinecraftAccount?.name != null && $isItemSet}
              <button
                on:click={setSkin}
                class:disabled={$itemLayers.length == 0 || !loaded}
                >{@html HumanHandsUpIcon}{$_("setSkin")}</button
              >
            {/if}
            <button
              id="download-action"
              title={$_("download")}
              on:click={downloadImage}
              class:icon={!$isMobileView &&
                $isItemSet &&
                $userSettings?.linkedMinecraftAccount?.name != null}
              class:disabled={$itemLayers.length == 0 || !loaded}
              >{@html DownloadIcon}
              {#if $isMobileView || !$isItemSet || $userSettings?.linkedMinecraftAccount?.name == null}
                {$_("download")}
              {/if}
            </button>
            {#if $itemPublisher.id == $currentUser?.id}
              {#if $itemPackage.isShared}
                <button
                  on:click={() => (isShareDialogOpen = true)}
                  id="shared-info-action"
                  class="secondary"
                  class:icon={!$isMobileView}
                >
                  {@html MoreHorizontalIcon}{#if $isMobileView}
                    {$_("shareinfo")}{/if}
                </button>
              {:else}
                <button
                  id="share-package-action"
                  on:click={sharePackage}
                  class:disabled={!loaded}
                  title={$_("sharePackage")}
                  class="icon secondary"
                  >{@html CloudIcon}{#if $isMobileView}
                    {$_("sharePackage")}{/if}</button
                >
              {/if}
            {/if}
          </div>
        {:else}
          <div style="display: flex; gap:8px;">
            <Placeholder style="height:48px;margin-bottom:8px;" />
            <Placeholder style="height:48px;margin-bottom:8px;" />
          </div>
        {/if}
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
        {#if isOutfitPickerOpen}
          <OutfitPicker
            bind:loading={isPickerLoading}
            renderer={$defaultRenderer}
            outfits={pickerOutfits}
            categories={pickerCategories}
            on:category={fetchByCategory}
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
    <Dialog bind:open={isShareDialogOpen}>
      <div class="social-dialog">
        <div>
          <h1 style="flex:1;margin-top:0px;margin-bottom:0;">Social info</h1>
          <button
            style="margin: 0px"
            class="icon tertiary"
            on:click={() => {
              isShareDialogOpen = false;
            }}
          >
            {@html CloseIcon}
          </button>
        </div>
        <SectionTitle label="Name" />
        <h3 style="margin: 0px;">{$itemPackage.name}</h3>
        <SectionTitle label="Author" />
        <Label variant="unique">{$itemPublisher.name}</Label>
        <SectionTitle label="Info" />
        <div style="font-family: minecraft;margin:8px;" class="icon-small">
          <div>
            {@html HearthIcon}
            <div style="margin-top:2px;margin-left:4px;">
              {$itemPackage.social.likes}
            </div>
          </div>
          &nbsp;&nbsp;&nbsp;
          <div>
            {@html DownloadIcon}
            <div style="margin-top:2px;margin-left:4px;">
              {$itemPackage.social.downloads || 0}
            </div>
          </div>
        </div>
        <br />
        <SectionTitle label="Actions" />
        <div style="display:flex;gap:8px;max-width:500px;">
          <button
            style="flex:1;"
            id="item-page-action"
            on:click={goToItemPage}
            title={$_("goToItemPage")}
            >{@html SpotlightIcon}

            {$_("goToItemPage")}
          </button>
          <button
            style="flex:1;"
            id="unshare-package-action"
            on:click={unSharePackage}
            class:disabled={!loaded}
            title={$_("unsharepackage")}
            class="secondary"
            >{@html CloseIcon}
            {$_("unsharepackage")}</button
          >
        </div>
      </div>
    </Dialog>
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
