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

  import ItemLayer from "$component/outfit/ItemLayer/ItemLayer.svelte";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$component/base/SectionTitle/SectionTitle.svelte";
  import ModelSelection from "$component/outfit/ModelSelection/ModelSelection.svelte";
  import DynamicRender from "$component/render/DynamicRender.svelte";
  import Dialog from "$component/base/Dialog/Dialog.svelte";
  import OutfitPicker from "$component/outfit/OutfitPicker/OutfitPicker.svelte";
  import Label from "$component/base/Label/Label.svelte";
  import SetSkinButton from "$component/other/SetSkinButton/SetSkinButton.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";

  import {
    CHANGE_TYPE,
    LAYER_TYPE,
    MODEL_TYPE,
    PACKAGE_TYPE,
  } from "$data/consts";
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
    baseTexture,
    defaultRenderer,
    wardrobe,
    isMobileView,
    isReadyForData,
    userSettings,
    showToast,
  } from "$data/cache";

  import DownloadIcon from "$icons/download.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import CloudIcon from "$icons/cloud.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import TrashIcon from "$icons/trash.svg?raw";
  import MoreHorizontalIcon from "$icons/more-horizontal.svg?raw";

  import DefaultAnimation from "$animation/default";

  import {
    ExportImageLayers,
    ImportImage,
    ImportLayerFromFile,
  } from "$src/helpers/data/dataTransferHelper";
  import { mergeImages } from "$src/data/imageMerger";
  import { outfitsInstance } from "$src/api/outfits";
  import {
    AddItemToWardrobe,
    AddToCollection,
    FetchWardrobeOutfitsByCategory,
    IsItemInCollection,
    IsItemInWardrobe,
    RemoveFromCollection,
    RemoveItem,
    UpdateItemInWardrobe,
  } from "$src/helpers/other/apiHelper";
  import {
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper";
  import { setsIntance } from "$src/api/sets";
  import { GetAnimationForPackageChange } from "$src/helpers/render/animationHelper";
  import { GetCategoriesFromList } from "$src/helpers/image/imageDataHelpers";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import { ShareItem, UnshareItem } from "$src/api/social";
  import AddVariantDialog from "$lib/components/dialog/AddVariantDialog.svelte";
  import SocialInfoDialog from "$lib/components/dialog/SocialInfoDialog.svelte";
  import type { OutfitPackageInstance } from "$src/helpers/package/packageInstanceHelper";
  import CollectionPicker from "$lib/components/outfit/CollectionPicker/CollectionPicker.svelte";

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
  let currentInstance: OutfitPackageInstance = null;

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
  let isAddVariantDialogOpen = false;
  let isCollectionDialogOpen = false;

  let newVariantLayer = null;
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
          currentInstance = setsIntance;
        } else {
          currentInstance = outfitsInstance;
        }

        $itemPackage = await currentInstance.fetch($wardrobe.studio.id);
        const categoryCounts = GetCategoriesFromList($wardrobe.outfits);
        pickerCategories = Object.keys(categoryCounts).filter(
          (x) => categoryCounts[x] > 0
        );
        let isPackageInWardrobe = IsItemInWardrobe($itemPackage, $wardrobe);
        loaded = true;
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
    if ($itemLayers[index].type == LAYER_TYPE.LOCAL) {
      currentInstance.removeLayer(
        $itemPackage.id,
        $itemLayers[index].variantId
      );
    }
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
    newVariantLayer = layer;
    isAddVariantDialogOpen = true;
  };
  const uploadImageForVariant = async function (e) {
    const modelName = e.detail.modelName;
    await ImportImage().then(async (layers) => {
      const newLayer = layers[0];
      itemLayers.update((layers) => {
        const index = layers.indexOf(newVariantLayer);
        if (modelName == MODEL_TYPE.ALEX) {
          layers[index].alex = newLayer;
        } else {
          layers[index].steve = newLayer;
        }
        $selectedLayer = layers[index];
        newVariantLayer = $selectedLayer;
        applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, index);
        showToast($_("toast.variantAdded"));
        return layers;
      });
    });
    currentInstance.uploadLayer($itemPackage, $selectedLayer);
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
  const editLayer = async function (e) {
    const layer = e.detail.texture;
    currentInstance.uploadLayer($itemPackage, layer);
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
        newOutfit.variantId = currentInstance.generateLayerId();
        newOutfit.isShared = $itemPackage.isShared;
        layers.unshift(newOutfit);
      });
      $selectedLayer = newOutfit;
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, 0);
      return layers;
    });
    currentInstance.uploadLayer($itemPackage, $selectedLayer);
  };
  const downloadImage = async () => {
    let layersToExport = rendererLayers;
    if ($userSettings?.baseTexture != null && $isItemSet)
      layersToExport.push(
        new FileData("base", $userSettings?.baseTexture, "image/png")
      );
    await ExportImageLayers(layersToExport, $itemModelType, $itemPackage.name);
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
          newOutfit.variantId = currentInstance.generateLayerId();
          newOutfit.isShared = $itemPackage.isShared;
          newLayers.unshift(newOutfit);
          $selectedLayer = newOutfit;
          currentInstance.uploadLayer($itemPackage, $selectedLayer);
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
    currentInstance.uploadLayer($itemPackage, $selectedLayer);
  };
  //collections
  const addToCollection = async function (e) {
    const collection = e.detail.collection;
    if (IsItemInCollection(collection, $itemPackage))
      RemoveFromCollection(collection, $itemPackage);
    else await AddToCollection(collection, $itemPackage);
    isCollectionDialogOpen = false;
  };
  //subscribtions
  itemPackage.subscribe((pack) => {
    if (!loaded) return;
    updateTexture();
  });
  selectedLayer.subscribe((layer) => {
    if (!loaded) return;
    if (!$isItemSet) updateTexture();
  });
  itemPackage.subscribe(async (data: OutfitPackage) => {
    if (!loaded) return;
    if (data != null && data.id != null) {
      await currentInstance.upload(data);
    }
    data.outfitType = data.layers[0]?.steve.type;
    UpdateItemInWardrobe($itemPackage);
  });
  itemModelType.subscribe(async (model) => {
    if (!loaded || !$isItemSet) return;
    applyAnimations($itemPackage, CHANGE_TYPE.MODEL_TYPE_CHANGE, 0);
  });
</script>

<div class="item-page">
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
            <Button
              icon={TrashIcon}
              label={$_("delete")}
              type="tertiary"
              on:click={() => (isDeleteDialogOpen = true)}
              onlyIcon
              style="margin-top: 8px;"
            />
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
            <Label variant="rare">{$_("shared")}</Label>
          {/if}
          {#if $isItemSet && $itemPackage.id == $userSettings.currentSkin?.id}
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
                <Button
                  on:click={openOutfitPicker}
                  icon={AddIcon}
                  disabled={!loaded}
                  label={$_("importOutfit")}
                  type="tertiary"
                />
              {/if}
              <Button
                on:click={importLayer}
                icon={ImportPackageIcon}
                disabled={!loaded}
                label={$isItemSet
                  ? $_("layersOpt.addLayer")
                  : $_("layersOpt.addVariant")}
                type="tertiary"
              />
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
                on:edit={editLayer}
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
          <div style="display: flex;flex-wrap:wrap;margin-top:8px;gap:8px;">
            {#if $isItemSet}
              <Button
                on:click={openOutfitPicker}
                icon={AddIcon}
                disabled={!loaded}
                label={$_("importOutfit")}
                type="tertiary"
              />
            {/if}
            <Button
              on:click={importLayer}
              icon={ImportPackageIcon}
              disabled={!loaded}
              label={$isItemSet
                ? $_("layersOpt.addLayer")
                : $_("layersOpt.addVariant")}
              type="tertiary"
            />
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
            <SetSkinButton
              item={$itemPackage}
              texture={modelTexture}
              style="flex:1;"
            />
          {/if}
          <Button
            on:click={downloadImage}
            label={$_("download")}
            onlyIcon={!$isMobileView &&
              $isItemSet &&
              $userSettings?.linkedMinecraftAccount?.name != null}
            icon={DownloadIcon}
            disabled={$itemLayers.length == 0 || !loaded}
            size="large"
          />
          {#if $currentUser.id != null}
            <Button
              on:click={() => (isCollectionDialogOpen = true)}
              label={"Add to collection"}
              onlyIcon={!$isMobileView}
              icon={ListIcon}
              size="large"
            />
          {/if}
          {#if $itemPublisher.id == $currentUser?.id}
            {#if $itemPackage.isShared}
              <Button
                on:click={() => (isShareDialogOpen = true)}
                type="tertiary"
                icon={MoreHorizontalIcon}
                onlyIcon={!$isMobileView}
                label={$_("shareinfo")}
                size="large"
              />
            {:else}
              <Button
                on:click={sharePackage}
                type="tertiary"
                icon={CloudIcon}
                onlyIcon={!$isMobileView}
                label={$_("sharePackage")}
                size="large"
              />
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
  <Dialog bind:open={isOutfitPickerOpen} label="Pick outfit">
    <div class="outfit-picker-dialog">
      <OutfitPicker
        bind:loading={isPickerLoading}
        renderer={$defaultRenderer}
        outfits={pickerOutfits}
        categories={pickerCategories}
        on:category={fetchByCategory}
        on:select={(e) => addNewRemoteLayer(e.detail)}
      />
    </div>
  </Dialog>
  <Dialog
    bind:open={isDeleteDialogOpen}
    style="min-width:30vw"
    showTitleBar={true}
  >
    <div style="text-align:center;margin:8px;">
      <span class="mc-font-simple">{$_("dialog.confirmDeleteItem")}</span>
      <div style="display:flex;flex-direction:row; gap:8px;margin-top:16px;">
        <Button
          type="tertiary"
          on:click={() => {
            isDeleteDialogOpen = false;
          }}
          label={$_("cancel")}
          icon={CloseIcon}
        />
        <Button
          type="primary"
          on:click={() => {
            isDeleteDialogOpen = false;
            deletePackage();
          }}
          label={$_("delete")}
          icon={TrashIcon}
        />
      </div>
    </div></Dialog
  >
  <Dialog bind:open={isShareDialogOpen} label="Social info">
    <SocialInfoDialog
      item={$itemPackage}
      on:unshare={unSharePackage}
      on:itempage={goToItemPage}
    />
  </Dialog>
  <Dialog bind:open={isAddVariantDialogOpen} label="Add layer variant">
    <AddVariantDialog
      bind:layer={newVariantLayer}
      on:uploadVariant={uploadImageForVariant}
    />
  </Dialog>
  <Dialog bind:open={isCollectionDialogOpen} label="Add to collections"
    ><CollectionPicker
      items={$wardrobe.collections}
      on:select={addToCollection}
    />
  </Dialog>
</div>

<style lang="scss">
  @import "style.scss";
</style>
