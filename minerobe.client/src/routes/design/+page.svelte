<script lang="ts">
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
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
  import Button from "$lib/components/base/Button/Button.svelte";
  import AddVariantDialog from "$lib/components/dialog/AddVariantDialog.svelte";
  import SocialInfoDialog from "$lib/components/dialog/SocialInfoDialog.svelte";
  import CollectionPicker from "$lib/components/outfit/CollectionPicker/CollectionPicker.svelte";
  import OutfitActions from "$lib/components/other/OutfitActions/OutfitActions.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";

  import {
    CHANGE_TYPE,
    DEFAULT_PACKAGE,
    MODEL_TYPE,
    PACKAGE_TYPE,
    STEVE_MODEL,
    ALEX_MODEL,
    APP_STATE,
    OUTFIT_TYPE,
    COLOR_TYPE,
  } from "$data/consts";
  import {
    currentUser,
    defaultRenderer,
    isMobileView,
    showToast,
    baseTexture,
    appState,
  } from "$data/cache";
  import {
    GetStudioPackage,
    GetWadrobeCollectionsWithPackageContext,
    GetWadrobePackagesSingleLayer,
    GetWadrobeSummary,
  } from "$src/api/wardrobe";
  import {
    OutfitPackageRenderConfig,
  } from "$model/render";
  import {
    MinecraftIntegrationModel,
  } from "$model/integration/minecraft";
  import DefaultAnimation from "$animation/default";

  import ImportPackageIcon from "$icons/upload.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import TrashIcon from "$icons/trash.svg?raw";
  import CloseBoxIcon from "$icons/close-box.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";

  import {
    ExportImageLayers,
    ImportImage,
    ImportLayerFromFile,
  } from "$src/helpers/data/dataTransferHelper";
  import {
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper";
  import { GetAnimationForPackageChange } from "$src/helpers/render/animationHelper";
  import { CreateDefaultRenderProvider } from "$src/data/render";
  import {
    AddPackageLayer,
    AddRemoteLayerToPackage,
    OrderPackageLayer,
    RemovePackage,
    RemovePackageLayer,
    RemoveRemoteLayerFromPackage,
    SetGlobalLayer,
    UpdatePackageData,
    UpdatePackageLayer,
  } from "$src/api/pack";
  import { SharePackage, UnSharePackage } from "$src/api/social";
  import {
    AddLayerSnapshot,
    GetGlobalLayer,
  } from "$src/helpers/package/packageHelper";
  import {
    AddPackageToCollection,
    RemovePackageFromCollection,
  } from "$src/api/collection";
  import { FetchSettings, SetCurrentTexture } from "$src/api/settings";
  import {
    CurrentTextureConfig,
    type MinerobeUserSettingsSimple,
  } from "$src/model/user";
  import { OutfitLayer, type OutfitPackage } from "$src/model/package";
  import type { PagedResponse } from "$src/model/base";
  import { FindClosestColor } from "$src/helpers/image/colorHelper";
  import InfoLabel from "$lib/components/base/InfoLabel/InfoLabel.svelte";
  import ItemCape from "$lib/components/outfit/ItemCape/ItemCape.svelte";
  import { GetAccount } from "$src/api/integration/minecraft";
  import { OutfitFilter } from "$src/model/filter";

  const integrationSettings: Writable<MinecraftIntegrationModel> =
    writable(null);
  const userSettings: Writable<MinerobeUserSettingsSimple> = writable(null);
  const itemPackage: Writable<OutfitPackage> = writable(DEFAULT_PACKAGE);
  const itemLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );
  const itemModelType: Writable<string> = propertyStore(itemPackage, "model");
  const itemRenderConfig: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );

  let isItemSet = false;
  let isSkinSetting = false;
  let modelTexture: string = null;
  let newVariantLayer = null;
  let defaultProvider = null;

  let loaded = false;
  let isDragging = false;

  let pickerOutfits: PagedResponse | any = {};
  let pickerCategories = [];
  let isPickerLoading = true;

  let isOutfitPickerOpen = false;
  let isDeleteDialogOpen = false;
  let isShareDialogOpen = false;
  let isAddVariantDialogOpen = false;

  let pickerCollections = [];
  let isCollectionPickerLoading = false;
  let isCollectionDialogOpen = false;

  let updateAnimation = function (anim) {};

  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      defaultProvider = await CreateDefaultRenderProvider($defaultRenderer);

      const pack = await GetStudioPackage();
      $itemPackage = pack;

      const settings = await FetchSettings();
      userSettings.set(settings);

      if (settings?.integrations?.includes("minecraft")) {
        const integrationProfile = await GetAccount();
        integrationSettings.set(integrationProfile);
      }

      isItemSet = $itemPackage.type == PACKAGE_TYPE.OUTFIT_SET;

      $itemRenderConfig = new OutfitPackageRenderConfig(
        $itemPackage,
        $itemPackage.model == MODEL_TYPE.ALEX ? ALEX_MODEL : STEVE_MODEL,
        undefined,
        !isItemSet,
        $itemRenderConfig.selectedLayer == null && $itemLayers.length > 0
          ? $itemLayers[$itemLayers.length - 1]
          : null
      );

      if (isItemSet && $userSettings.baseTexture.layers.length > 0)
        $itemRenderConfig.setBaseTextureFromLayer(
          $userSettings.baseTexture.layers[0]
        );
      else $itemRenderConfig.setBaseTextureFromString($baseTexture);

      if (isItemSet && $userSettings.currentCapeId != null) {
        var selectedCape = $integrationSettings?.capes.find(
          (x) => x.id == $userSettings.currentCapeId
        );
        $itemRenderConfig.cape = selectedCape;
      }

      loaded = true;
      updateTexture();
    });
  });

  //layers / texture
  const downLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index > 0) {
      itemLayers.update((layers) => {
        let temp = layers[index - 1];
        layers[index - 1] = layers[index];
        layers[index] = temp;
        applyAnimations($itemPackage, CHANGE_TYPE.LAYER_UP, index - 1);
        return layers;
      });
      await OrderPackageLayer(
        $itemPackage.id,
        $itemLayers.map((x) => x.id)
      );
    }
  };
  const upLayer = async function (e) {
    let index = $itemLayers.indexOf(e.detail.texture);
    if (index < $itemLayers.length - 1) {
      itemLayers.update((layers) => {
        let temp = layers[index + 1];
        layers[index + 1] = layers[index];
        layers[index] = temp;
        applyAnimations($itemPackage, CHANGE_TYPE.LAYER_DOWN, index + 1);
        return layers;
      });
      await OrderPackageLayer(
        $itemPackage.id,
        $itemLayers.map((x) => x.id)
      );
    }
  };
  const removeLayer = async function (e) {
    const layer = e.detail.texture;
    let isRemoved = false;

    if (layer.sourcePackageId != $itemPackage.id)
      isRemoved = await RemoveRemoteLayerFromPackage(layer.id, $itemPackage.id);
    else isRemoved = await RemovePackageLayer(layer.id);

    if (!isRemoved) return;
    let index = $itemLayers.indexOf(layer);
    let refresh = false;
    itemLayers.update((layers) => {
      if (
        !isItemSet &&
        $itemRenderConfig.selectedLayer.id == layers[index].id
      ) {
        refresh = true;
      }
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_REMOVE, index);
      layers.splice(index, 1);
      return layers;
    });
    if (refresh) {
      if ($itemLayers.length > 0)
        $itemRenderConfig.selectedLayer = $itemLayers[0];
      else $itemRenderConfig.selectedLayer = null;
    }
  };
  const addImageVariant = async function (data) {
    const layer = data.detail.texture;
    newVariantLayer = layer;
    isAddVariantDialogOpen = true;
  };
  const uploadImageForVariant = async function (e) {
    const modelName = e.detail.modelName;
    const layer = newVariantLayer;
    const index = $itemLayers.indexOf(layer);
    await ImportImage().then(async (layers) => {
      const newtexture = layers[0];
      layer[modelName] = newtexture;
      const reponse = await UpdatePackageLayer(await AddLayerSnapshot(layer));
      if (reponse == null) return;
      itemLayers.update((layers) => {
        layers[index] = reponse;
        return layers;
      });
      $itemRenderConfig.selectedLayer = layer;
      newVariantLayer = $itemRenderConfig.selectedLayer;
      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, index);
      showToast($_("toast.variantAdded"));
      return layers;
    });
  };
  const updateTexture = async () => {
    if (!loaded) return;
    modelTexture = await $itemRenderConfig.getLayersForRender(false);
  };
  const editLayer = async function (e) {
    const layer = e.detail.texture as OutfitLayer;

    const colorStevename = await FindClosestColor(
      layer.steve.color,
      COLOR_TYPE.STRING_COLOR
    );
    const colorAlexname = await FindClosestColor(
      layer.alex.color,
      COLOR_TYPE.STRING_COLOR
    );
    layer.alex.colorName = colorAlexname.name;
    layer.steve.colorName = colorStevename.name;

    await UpdatePackageLayer(await AddLayerSnapshot(layer));
  };
  const addNewRemoteLayer = async function (outfit: OutfitPackage) {
    const layerId = outfit.layers[0].id;
    var resp = await AddRemoteLayerToPackage(layerId, $itemPackage.id);
    if (resp == null) return;
    itemLayers.update((layers) => {
      layers.push(resp);
      return layers;
    });
    isOutfitPickerOpen = false;
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

    const responselayers = [];
    await Promise.all(
      newLayers.map(async (layer) => {
        const newOutfitLayer = new OutfitLayer(
          layer.fileName,
          structuredClone(layer),
          structuredClone(layer),
          null
        );
        newOutfitLayer.sourcePackageId = $itemPackage.id;
        const response = await AddPackageLayer(
          await AddLayerSnapshot(newOutfitLayer)
        );
        responselayers.push(response);
      })
    );
    itemLayers.update((layers) => {
      //add new layers to the top
      layers.push(...responselayers);
      return layers;
    });
    $itemRenderConfig.selectedLayer = responselayers[0];
    applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, 0);
  };
  const downloadImage = async () => {
    await ExportImageLayers(
      $itemRenderConfig.getLayersForModel(!isItemSet),
      $itemRenderConfig,
      $itemPackage.name
    );
    applyAnimations($itemPackage, CHANGE_TYPE.DOWNLOAD, 0);
  };

  //sharing / wardrobe
  const sharePackage = async function () {
    const respose = await SharePackage($itemPackage.social.id);
    if (respose == null) return;

    showToast("Shared");
    $itemPackage.social = respose;
    applyAnimations($itemPackage, CHANGE_TYPE.SHARE, 0);
  };
  const unSharePackage = async function () {
    const response = await UnSharePackage($itemPackage.social.id);
    if (response == null) return;
    $itemPackage.social = response;
    isShareDialogOpen = false;
  };
  const deletePackage = async function () {
    const resp = await RemovePackage($itemPackage.id);
    if (resp == null) return;
    navigateToWardrobe();
  };

  //picker
  const openOutfitPicker = async function () {
    isOutfitPickerOpen = true;
    let filters: OutfitFilter = new OutfitFilter();
    filters.type = PACKAGE_TYPE.OUTFIT;
    const options = {
      itemsPerPage: 24,
      page: 0,
      filter: filters,
    };
    const summary = await GetWadrobeSummary();
    pickerCategories = summary.outfitTypes
      .filter((x: any) => x.outfitType.toLowerCase() != OUTFIT_TYPE.OUTFIT_SET)
      .map((x: any) => x.outfitType);
    await fetchWadrobeItems(options);
  };
  const fetchWadrobeItemsFromEvent = async function (e) {
    await fetchWadrobeItems(e.detail);
  };
  const fetchWadrobeItems = async function (options) {
    isPickerLoading = true;
    const items = await GetWadrobePackagesSingleLayer(
      options.filter,
      options.page,
      options.itemsPerPage
    );
    pickerOutfits = items;
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

      const newLayers = [];
      for (var i = 0; i < files.length; i++) {
        const newLayer = await ImportLayerFromFile(files[i]);
        const newOutfitLayer = new OutfitLayer(
          newLayer.fileName,
          structuredClone(newLayer),
          structuredClone(newLayer),
          null
        );
        newOutfitLayer.sourcePackageId = $itemPackage.id;
        const response = await AddPackageLayer(
          await AddLayerSnapshot(newOutfitLayer)
        );
        newLayers.push(response);
      }
      if (newLayers.length == 0) return;
      $itemRenderConfig.selectedLayer = newLayers[0];

      itemLayers.update((layers) => {
        layers.push(...newLayers);
        return layers;
      });

      applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, 0);
      updateTexture();
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
      isItemSet ? null : $itemRenderConfig.selectedLayer.id
    );
  };
  const addNewDropVariant = async function (e) {
    const layer = e.detail.texture;
    const index = $itemLayers.indexOf(layer);

    const newLayer = await ImportLayerFromFile(e.detail.files[0]);
    layer[$itemModelType] = newLayer;

    const response = await UpdatePackageLayer(await AddLayerSnapshot(layer));
    if (response == null) return;
    itemLayers.update((layers) => {
      layers[index] = response;
      return layers;
    });
    $itemRenderConfig.selectedLayer = layer;
    applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, index);
  };

  const setCape = function (cape) {
    $itemRenderConfig.cape = cape;
  };
  const skinSetted = async function () {
    isSkinSetting = true;
    try {
      var result = await SetCurrentTexture(
        $itemPackage.id,
        new CurrentTextureConfig(
          modelTexture,
          $itemPackage.model,
          $itemRenderConfig.isFlatten,
          $itemRenderConfig.cape?.id
        )
      );
      if (result) {
        showToast("Skin changed", HumanHandsUpIcon);
        applyAnimations($itemPackage, CHANGE_TYPE.SKIN_SET, -1);
        userSettings.set(result);
      }
    } catch (e) {
      showToast("Failed to set skin", undefined, "error");
    }
    isSkinSetting = false;
  };
  //collections
  const openCollectionPicker = async function () {
    isCollectionDialogOpen = true;
    isCollectionPickerLoading = true;
    const fetched = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id
    );
    pickerCollections = fetched.items;
    isCollectionPickerLoading = false;
  };
  const addToCollection = async function (e) {
    const collection = e.detail.collection;
    var result = await AddPackageToCollection(collection.id, $itemPackage.id);
    isCollectionDialogOpen = false;
    showToast("Added to collection");
  };
  const removeFromCollection = async function (e) {
    const collection = e.detail.collection;
    var result = await RemovePackageFromCollection(
      collection.id,
      $itemPackage.id
    );
    isCollectionDialogOpen = false;
    showToast("Removed from collection");
  };
  //subscribtions
  itemPackage.subscribe(async (pack) => {
    if (!loaded) return;
    $itemRenderConfig.item = pack;
    //update package
    await UpdatePackageData(pack);
    if (isItemSet) {
      //generate flatten layers
      const globalLayer = await GetGlobalLayer(pack);
      await SetGlobalLayer(globalLayer);
    }
  });
  itemRenderConfig.subscribe((layer) => {
    if (!loaded) return;
    updateTexture();
  });
  itemModelType.subscribe(async (model) => {
    if (!loaded) return;
    $itemRenderConfig.model =
      model == MODEL_TYPE.ALEX ? ALEX_MODEL : STEVE_MODEL;
    if (!loaded || !isItemSet) return;
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
          model={$itemRenderConfig.model.model}
          modelName={$itemRenderConfig.model.name}
          defaultAnimation={DefaultAnimation}
          bind:addAnimation={updateAnimation}
        />
      {:else}
        <Placeholder></Placeholder>
      {/if}
    </div>
  </div>
  <div class="item-data">
    <div class="data">
      <div class="item-name">
        <SectionTitle label={$_("name")} placeholder={!loaded} />
        <Placeholder style="height:46px;margin-bottom:16px;" {loaded}>
          <div style="display:grid; grid-template-columns:1fr auto;gap:8px;">
            <input
              id="item-title"
              class:disabled={$itemPackage?.publisher.id != $currentUser?.id}
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
        </Placeholder>
        <Placeholder style="height:24px;max-width:100px;" {loaded}>
          <Label variant="common"
            >{$itemPackage.type == PACKAGE_TYPE.OUTFIT
              ? $_("outfit")
              : $_("outfit_set")}</Label
          >
          {#if $itemPackage.social.isShared}
            <Label variant="rare">{$_("shared")}</Label>
          {/if}
          {#if $userSettings.currentTexturePackageId == $itemPackage.id}
            <Label variant="ancient">Current skin</Label>
          {/if}
          <br />
        </Placeholder>
        <br />
      </div>
      <SectionTitle
        label={isItemSet ? $_("layers") : $_("variants")}
        placeholder={!loaded}
      />
      <div class="item-layers">
        {#if loaded}
          {#if $itemPackage?.publisher.id == $currentUser?.id && $isMobileView}
            <div style="display: flex;">
              {#if isItemSet}
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
                label={isItemSet
                  ? $_("layersOpt.addLayer")
                  : $_("layersOpt.addVariant")}
                type="tertiary"
              />
            </div>
            <br />
          {/if}
          {#each [...$itemLayers].reverse() as item, index (item.id)}
            <div class="item-layer">
              <ItemLayer
                renderProvider={$itemModelType == MODEL_TYPE.STEVE
                  ? defaultProvider.steve
                  : defaultProvider.alex}
                selectable={!isItemSet}
                controls={isItemSet}
                readonly={$itemPackage?.publisher.id != $currentUser?.id}
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
                selected={item?.id == $itemRenderConfig.selectedLayer?.id}
                on:click={() => ($itemRenderConfig.selectedLayer = item)}
              />
            </div>
          {/each}
        {:else}
          <Placeholder style="height:66px;margin-bottom:4px;" />
          <Placeholder style="height:66px;margin-bottom:4px;" />
        {/if}
        {#if $itemPackage?.publisher.id == $currentUser?.id && !$isMobileView}
          <div style="display: flex;flex-wrap:wrap;margin-top:8px;gap:8px;">
            {#if isItemSet}
              <Button
                on:click={openOutfitPicker}
                icon={AddIcon}
                disabled={!loaded}
                label={$_("importOutfit")}
                type="tertiary"
              />
            {/if}
            <Placeholder {loaded} loadedStyle="flex:1;">
              <Button
                on:click={importLayer}
                icon={ImportPackageIcon}
                disabled={!loaded}
                label={isItemSet
                  ? $_("layersOpt.addLayer")
                  : $_("layersOpt.addVariant")}
                type="tertiary"
              />
            </Placeholder>
          </div>
        {/if}
      </div>
      <br />
      {#if isItemSet && $integrationSettings != null}
        <SectionTitle label="Capes" placeholder={!loaded} />
        {#if $integrationSettings.capes.length == 0}
          <InfoLabel
            closeable={false}
            type="info"
            description="You have no capes linked to your minecraft account"
          />
        {:else}
          <div class="horizontal-list">
            {#each $integrationSettings.capes as cape}
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
      <SectionTitle label={$_("description")} placeholder={!loaded} />
      <Placeholder style="height:64px;margin-bottom:8px;" {loaded}>
        <textarea
          id="item-description"
          class:disabled={$itemPackage?.publisher.id != $currentUser?.id}
          class="description-input"
          bind:value={$itemPackage.description}
          placeholder={$_("description")}
        ></textarea>
      </Placeholder>
      <SectionTitle label={$_("model")} placeholder={!loaded} />
      <Placeholder style="height:48px;margin-bottom:8px;" {loaded}>
        <ModelSelection bind:group={$itemModelType} disabled={!loaded} />
      </Placeholder>
      <br />
      <Placeholder style="height:24px;width:200px;" {loaded}>
        <Checkbox
          style="margin-left:12px;"
          label={$_("modelOpt.oldFormat")}
          bind:value={$itemRenderConfig.isFlatten}
        />
      </Placeholder>
      <br />
      {#if loaded}
        <OutfitActions
          outfitPackage={$itemPackage}
          setMySkinAvailable={$currentUser?.id != null &&
            isItemSet &&
            $integrationSettings?.id != null}
          {isSkinSetting}
          loading={!loaded}
          mobile={$isMobileView}
          on:skinSet={skinSetted}
          on:share={sharePackage}
          on:download={downloadImage}
          on:shareDialog={() => (isShareDialogOpen = true)}
          on:collectionDialog={openCollectionPicker}
        />
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
        outfits={pickerOutfits.items}
        itemsPerPage={24}
        totalItemsCount={pickerOutfits.total}
        categories={pickerCategories}
        on:optionsChanged={fetchWadrobeItemsFromEvent}
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
      <div style="margin-top:16px;" class="horizontal-list">
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
