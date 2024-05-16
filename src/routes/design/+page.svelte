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
  } from "$data/consts";
  import {
    OutfitLayer,
    OutfitPackage,
    WardrobePagedResponse,
  } from "$data/common";
  import {
    currentUser,
    defaultRenderer,
    wardrobe,
    isMobileView,
    userSettings,
    showToast,
    baseTexture,
    appState,
  } from "$data/cache";
  import {
    GetStudioPackage,
    GetWadrobePackagesSingleLayer,
    GetWadrobeSummary,
  } from "$src/api/wardrobe";
  import { OutfitPackageRenderConfig } from "$src/data/model";
  import DefaultAnimation from "$animation/default";

  import ImportPackageIcon from "$icons/upload.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import TrashIcon from "$icons/trash.svg?raw";

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
    OrderPackageLayer,
    RemovePackage,
    RemovePackageLayer,
    SetGlobalLayer,
    UpdatePackageData,
    UpdatePackageLayer,
  } from "$src/api/pack";
  import {
    SetAsDownloadPackage,
    SharePackage,
    UnSharePackage,
  } from "$src/api/social";
  import {
    AddLayerSnapshot,
    GetGlobalLayer,
  } from "$src/helpers/package/packageHelper";

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
  let modelTexture: string = null;
  let newVariantLayer = null;
  let defaultProvider = null;

  let loaded = false;
  let isDragging = false;

  let pickerOutfits: WardrobePagedResponse | any = {};
  let pickerCategories = [];
  let isPickerLoading = true;

  let isOutfitPickerOpen = false;
  let isDeleteDialogOpen = false;
  let isShareDialogOpen = false;
  let isAddVariantDialogOpen = false;
  let isCollectionDialogOpen = false;

  let updateAnimation = function (anim) {};

  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      defaultProvider = await CreateDefaultRenderProvider($defaultRenderer);

      const pack = await GetStudioPackage();
      $itemPackage = pack;
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

      if (isItemSet && $userSettings.baseTexture != null)
        $itemRenderConfig.setBaseTextureFromLayer($userSettings.baseTexture);
      else $itemRenderConfig.setBaseTextureFromString($baseTexture);

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
    const isRemoved = await RemovePackageLayer(layer.id);
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
    const layer = e.detail.texture;
    await UpdatePackageLayer(await AddLayerSnapshot(layer));
  };
  const addNewRemoteLayer = async function (outfit: OutfitPackage) {
    // isOutfitPickerOpen = false;
    // l//et layer = await outfitsInstance.fetchHelper.fetchLayer(
    //   outfit.id,
    //   outfit.layers[0].id
    // );
    // //check if layer already exists
    // if ($itemLayers.find((x) => x.id == outfit.id && x.id == layer.variantId))
    //   return;
    // itemLayers.update((layers) => {
    //   layer.id = outfit.id;
    //   layer.type = LAYER_TYPE.REMOTE;
    //   const newRemote = layer;
    //   layers.unshift(newRemote);
    //   $itemRenderConfig.selectedLayer = newRemote;
    //   applyAnimations($itemPackage, CHANGE_TYPE.LAYER_ADD, 0);
    //   return layers;
    // });
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
          layer,
          layer,
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
      $itemRenderConfig.getLayersForModel(
        !(isItemSet && $userSettings.baseTexture != null)
      ),
      $itemRenderConfig,
      $itemPackage.name
    );
    if (
      $currentUser?.id != $itemPackage.publisher.id ||
      $itemPackage.social.isShared
    ) {
      const resp = await SetAsDownloadPackage($itemPackage.social.id);
      if (resp == null) return;
      $itemPackage.social = resp;
    }

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
    const options = {
      itemsPerPage: 24,
      page: 0,
      filters: {
        category: "",
        search: "",
      },
    };
    const summary = await GetWadrobeSummary();
    pickerCategories = summary.outfitTypes.filter(
      (x:any) => x.outfitType.toLowerCase() != OUTFIT_TYPE.OUTFIT_SET
    ).map((x:any) => x.outfitType);
    await fetchWadrobeItems(options);
  };
  const fetchWadrobeItemsFromEvent = async function (e) {
    await fetchWadrobeItems(e.detail);
  };
  const fetchWadrobeItems = async function (options) {
    isPickerLoading = true;
    const items = await GetWadrobePackagesSingleLayer(
      PACKAGE_TYPE.OUTFIT,
      options.filters.category,
      options.filters.search,
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
          newLayer,
          newLayer,
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

  const skinSetted = function (e) {
    const isSetted = e.detail.isSuccessful;
    if (isSetted) {
      applyAnimations($itemPackage, CHANGE_TYPE.SKIN_SET, 0);
    }
  };
  //collections
  const addToCollection = async function (e) {
    const collection = e.detail.collection;

    isCollectionDialogOpen = false;
  };
  const removeFromCollection = async function (e) {
    const collection = e.detail.collection;

    isCollectionDialogOpen = false;
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
          <div style="display:flex; flex-direction:row">
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
          {#if isItemSet && $itemPackage.id == $userSettings.currentSkin?.id}
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
        {/if}
      </div>
      <br />
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
          label="Old format model"
          bind:value={$itemRenderConfig.isFlatten}
        />
      </Placeholder>
      <br />
      {#if loaded}
        <OutfitActions
          outfitPackage={$itemPackage}
          {modelTexture}
          loading={!loaded}
          mobile={$isMobileView}
          on:share={sharePackage}
          on:skinSet={skinSetted}
          on:download={downloadImage}
          on:shareDialog={() => (isShareDialogOpen = true)}
          on:collectionDialog={() => (isCollectionDialogOpen = true)}
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
  <Dialog bind:open={isCollectionDialogOpen} label="Collections"
    ><CollectionPicker
      pack={$itemPackage}
      items={$wardrobe.collections}
      on:add={addToCollection}
      on:remove={removeFromCollection}
    />
  </Dialog>
</div>

<style lang="scss">
  @import "style.scss";
</style>
