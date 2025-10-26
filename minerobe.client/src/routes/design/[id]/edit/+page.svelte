<script lang="ts">
  //main imports
  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";
  //api
  import {
    GetPackage,
    UpdatePackage,
    UpdatePackageLayer,
    SetPackageLayerOrder,
    RemovePackageLayerWithPackageContext,
    AddPackageLayer,
    RemovePackage,
    AddRemoteLayerToPackage,
  } from "$src/api/pack";
  import { FetchSettings } from "$src/api/settings";
  import { GetAccount } from "$src/api/integration/minecraft.js";
  import {
    GetWadrobeCollectionsWithPackageContext,
    GetWadrobePackagesSingleLayer,
  } from "$src/api/wardrobe.js";
  import {
    AddPackageToCollection,
    RemovePackageFromCollection,
  } from "$src/api/collection.js";
  import { SharePackage, UnSharePackage } from "$src/api/social.js";
  //services
  import { ImportImages, ImportImagesFromFiles } from "$src/data/import.js";
  import { ExportImage } from "$src/data/export.js";
  import { OutfitPackageToTextureConverter } from "$src/data/render.js";
  import { ShowToast } from "$src/data/toast.js";
  import { debounce } from "$src/data/base.js";
  import { SetMinecraftSkin } from "$src/data/integration.js";
  //consts
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    IS_MOBILE_VIEW,
  } from "$src/data/static.js";
  //models
  import { OutfitFilter } from "$data/models/filter.js";
  import { APP_STATE, CHANGE_TYPE } from "$src/data/enums/app.js";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit.js";
  import type { RenderAnimation } from "$src/data/animation.js";
  import type {
    Cape,
    MinecraftAccount,
  } from "$data/models/integration/minecraft";
  import { PagedModel, PagedResponse, PageOptions } from "$data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  import { OutfitLayer, type OutfitPackage } from "$model/package";
  import DefaultAnimation from "$src/animation/default.js";
  import { OutfitPackageRenderConfig } from "$data/models/render";
  import { MinerobeUserSettings } from "$data/models/user";
  import HandsUpAnimation from "$src/animation/handsup";
  import {
    navigateToOutfitPackage,
    navigateToWardrobe,
  } from "$src/helpers/other/navigationHelper.js";
  //components
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitLayerList from "$lib/components/outfit/OutfitLayerList/OutfitLayerList.svelte";
  import DragAndDrop from "$lib/components/draganddrop/DragAndDrop/DragAndDrop.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";
  import CollectionsDialog from "$lib/components/dialog/CollectionsDialog.svelte";
  import EditLayerDialog from "$lib/components/dialog/EditLayerDialog.svelte";
  import OutfitPickerDialog from "$lib/components/dialog/OutfitPickerDialog.svelte";
  import OverviewDialog from "$lib/components/dialog/OverviewDialog.svelte";
  import ConfirmDialog from "$lib/components/dialog/ConfirmDialog.svelte";
  //icons
  import TrashIcon from "$icons/trash.svg?raw";
  import ImportPackageIcon from "$icons/upload.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import CloudIcon from "$icons/cloud.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import MoreHorizontalIcon from "$icons/more-horizontal.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import { GetAnimationForPackageChange } from "$src/helpers/render/animationHelper.js";
  import ColorSelect from "$lib/components/other/ColorSelect/ColorSelect.svelte";
  import { COLORS_ARRAY } from "$src/data/consts/color.js";
  import { THREE } from "$lib/three.js";
  import MenuButton from "$lib/components/other/MenuButton/MenuButton.svelte";

  export let data;

  const renderConfiguration: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig()
  );
  const itemPackage: Writable<OutfitPackage> = propertyStore(
    renderConfiguration,
    "item"
  );
  const itemPackageLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers"
  );
  let loaded = false;
  let isOutfitSet = false;
  let isMinecraftIntegrated = false;
  let userSettings: MinerobeUserSettings = null;
  let integrationSettings: MinecraftAccount = null;
  let renderer: any = null;

  // dialog data
  let dialogSelectedLayer: OutfitLayer = null;
  let dialogCollections: PagedResponse<OutfitPackageCollectionWithPackageContext> =
    null;
  let dialogOutfitPickerItems: PagedResponse<OutfitPackage> =
    new PagedResponse<OutfitPackage>();
  let dialogOutfitsPickerOptions: PagedModel<OutfitFilter> =
    new PagedModel<OutfitFilter>();
  let isLayerEditDialogOpen = false;
  let isOverviewDialogOpen = false;
  let isRemoveDialogOpen = false;
  let isCollectionsDialogOpen = false;
  let isOutfitPickerDialogOpen = false;

  //others
  let isSkinSetting = false;

  //api helpers
  const UpdatePackageDebounced = debounce(async () => {
    await UpdatePackage($itemPackage);
  }, 500);
  const UpdatePackageLayersOrder = debounce(async function () {
    const layers = $itemPackage.layers;
    if (layers.length == 0) return;
    await SetPackageLayerOrder(
      $itemPackage.id,
      layers.map((x) => x.id)
    );
  }, 500);

  let __addAnimation = function (
    animation: RenderAnimation,
    force: boolean = false
  ) {};

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      const threeModule = await THREE.getThree();
      renderer = new threeModule.WebGLRenderer({
        alpha: true,
      });
      renderer.outputColorSpace = threeModule.LinearSRGBColorSpace;

      $itemPackage = await GetPackage(data.id);
      isOutfitSet = $itemPackage.type === PACKAGE_TYPE.OUTFIT_SET;
      $renderConfiguration.item = $itemPackage;
      if (!isOutfitSet && $itemPackage.layers.length > 0) {
        $renderConfiguration.selectedLayerId = $itemPackage.layers[0]?.id;
      }

      userSettings = await FetchSettings();
      if (isOutfitSet && userSettings?.baseTexture != null)
        $renderConfiguration.baseTexture = userSettings.baseTexture.layers[0];
      else $renderConfiguration.baseTexture = $BASE_TEXTURE;

      isMinecraftIntegrated = userSettings?.integrations.includes("minecraft");
      if (isMinecraftIntegrated && isOutfitSet) {
        integrationSettings = await GetAccount(false);
        $renderConfiguration.cape = integrationSettings.capes?.find(
          (c) => c.id == userSettings?.currentTexture?.capeId
        );
      }
      itemPackage.subscribe(async (item) => {
        if (loaded) await UpdatePackageDebounced();
      });
      loaded = true;
      setTimeout(() => addAnimation(null), 0);
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  //layers
  const setSelectedLayer = (e) => {
    const layerId = e.detail.item.id;
    renderConfiguration.update((config) => {
      config.selectedLayerId = layerId;
      return config;
    });
  };
  const moveLayerDown = async (e) => {
    const layer = e.detail.item;
    const index = e.detail.index;
    itemPackage.update((item) => {
      item.layers.splice(index, 1);
      item.layers.splice(index - 1, 0, layer);
      return item;
    });
    addAnimation(
      GetAnimationForPackageChange(CHANGE_TYPE.LAYER_DOWN, layer.outfitType)
    );
  };
  const moveLayerUp = (e) => {
    const layer = e.detail.item;
    const index = e.detail.index;
    itemPackage.update((item) => {
      item.layers.splice(index, 1);
      item.layers.splice(index + 1, 0, layer);
      return item;
    });
    addAnimation(
      GetAnimationForPackageChange(CHANGE_TYPE.LAYER_UP, layer.outfitType)
    );
  };
  const removeLayer = async (e) => {
    const layer = e.detail.item;
    await RemovePackageLayerWithPackageContext(layer, $itemPackage.id);
    itemPackage.update((item) => {
      item.layers = item.layers.filter((l) => l.id !== layer.id);
      if (!isOutfitSet && layer.id == $renderConfiguration.selectedLayerId)
        $renderConfiguration.selectedLayerId = item.layers[0]?.id;
      return item;
    });
    addAnimation(
      GetAnimationForPackageChange(CHANGE_TYPE.LAYER_REMOVE, layer.outfitType)
    );
  };
  const editLayer = async function (e) {
    const item = e.detail.item;
    itemPackageLayers.update((layers) => {
      const index = layers.findIndex((x) => x.id == item.id);
      layers[index] = item;
      return layers;
    });

    await UpdatePackageLayer(item);
    addAnimation(
      GetAnimationForPackageChange(CHANGE_TYPE.LAYER_ADD, item.outfitType)
    );
  };
  const dropLayer = async (e) => {
    const layer = e.detail.item;
    const option = e.detail.option;
    const file = e.detail.file;

    const index = $itemPackageLayers.findIndex((x) => x.id == layer.id);

    itemPackage.update((item) => {
      item.layers[index][option] = file;
      return item;
    });

    await UpdatePackageLayer($itemPackageLayers[index]);
    addAnimation(
      GetAnimationForPackageChange(CHANGE_TYPE.LAYER_ADD, layer.outfitType)
    );
  };

  //imports
  const importImage = async () => {
    const layers = await ImportImages();
    const addedlayers = await Promise.all(
      layers.map(async (layer) => {
        layer.sourcePackageId = $itemPackage.id;
        layer.id = null;
        return await AddPackageLayer(layer);
      })
    );
    renderConfiguration.update((config) => {
      config.item.layers.push(...addedlayers);
      if (!isOutfitSet) config.selectedLayerId = addedlayers[0]?.id;
      return config;
    });
    addAnimation(
      GetAnimationForPackageChange(CHANGE_TYPE.LAYER_ADD, layers[0].outfitType)
    );
  };
  const importLayerFromDrop = async (e) => {
    const files = e.detail.items;
    const layers = await ImportImagesFromFiles(files);
    const addedlayers = await Promise.all(
      layers.map(async (layer) => {
        layer.sourcePackageId = $itemPackage.id;
        layer.id = null;
        return await AddPackageLayer(layer);
      })
    );
    renderConfiguration.update((config) => {
      config.item.layers.push(...addedlayers);
      if (!isOutfitSet) config.selectedLayerId = addedlayers[0]?.id;
      return config;
    });
    addAnimation(
      GetAnimationForPackageChange(CHANGE_TYPE.LAYER_ADD, layers[0].outfitType)
    );
  };

  //export
  const exportPackage = async () => {
    const texture = new OutfitPackageToTextureConverter().SetOptions(
      $renderConfiguration
    );
    if (userSettings?.baseTexture == null || !isOutfitSet)
      texture.SetBaseTexture(null);
    await ExportImage(
      await texture.ConvertAsyncWithFlattenSettingsAsync(),
      $itemPackage.name
    );
    addAnimation(GetAnimationForPackageChange(CHANGE_TYPE.DOWNLOAD, null));
  };
  const exportPackageWithoutBaseTexture = async () => {
    const texture = new OutfitPackageToTextureConverter().SetOptions(
      $renderConfiguration
    );
    texture.SetBaseTexture(null);
    await ExportImage(
      await texture.ConvertAsyncWithFlattenSettingsAsync(),
      $itemPackage.name
    );
    addAnimation(HandsUpAnimation);
  };

  //animations
  const addAnimation = (animation: RenderAnimation) => {
    if (animation) __addAnimation(animation, false);
    __addAnimation(DefaultAnimation, true);
  };

  //dialogs
  const openLayerEditDialog = (e) => {
    const layer = e.detail.item;
    dialogSelectedLayer = structuredClone(layer);
    isLayerEditDialogOpen = true;
  };
  const openOverviewDialog = () => (isOverviewDialogOpen = true);
  const openRemoveDialog = () => (isRemoveDialogOpen = true);
  const openCollectionsDialog = async (e) => {
    let options = e?.detail?.options?.options;
    if (!options) options = { page: 0, pageSize: 6, total: 0 };

    dialogCollections =
      new PagedResponse<OutfitPackageCollectionWithPackageContext>();
    dialogCollections.options = options.page;
    dialogCollections.items = null;
    dialogCollections.sort = [];

    isCollectionsDialogOpen = true;
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      options.page,
      options.pageSize
    );
  };
  const openOutfitPickerDialog = async (e) => {
    let options = e?.detail?.options;
    if (!options) {
      options = new PagedModel<OutfitFilter>();
      options.page = 0;
      options.pageSize = 12;
      options.total = 0;
    }
    dialogOutfitsPickerOptions = options;
    dialogOutfitPickerItems.items = null;
    isOutfitPickerDialogOpen = true;

    dialogOutfitPickerItems = await GetWadrobePackagesSingleLayer(
      dialogOutfitsPickerOptions
    );
  };

  //actions
  const deletePackage = async () => {
    await RemovePackage($itemPackage.id);
    navigateToWardrobe();
  };
  const addToCollection = async function (e) {
    const collection = e.detail.item;
    await AddPackageToCollection(collection.id, $itemPackage.id);
    ShowToast("Item added to collection");
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      dialogCollections.options.page,
      dialogCollections.options.pageSize
    );
  };
  const removeFromCollection = async function (e) {
    const collection = e.detail.item;
    await RemovePackageFromCollection(collection.id, $itemPackage.id);
    ShowToast("Item removed from collection", "info");
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      dialogCollections.options.page,
      dialogCollections.options.pageSize
    );
  };
  const sharePackage = async function () {
    const sharedSocialInfo = await SharePackage($itemPackage.social.id);
    itemPackage.update((item) => {
      item.social = sharedSocialInfo;
      return item;
    });
    ShowToast("Item shared");
  };
  const unsharePackage = async function () {
    const unSharedpackageInfo = await UnSharePackage($itemPackage.social.id);
    itemPackage.update((item) => {
      item.social = unSharedpackageInfo;
      return item;
    });
    ShowToast("Item unshared");
  };
  const goToPackagePage = async function () {
    navigateToOutfitPackage($itemPackage);
  };
  const addPackageLayer = async function (e) {
    const packs = e.detail.items;
    for (let pack of packs) {
      const newPack = pack;
      const layer = newPack.layers[0];
      await AddRemoteLayerToPackage(layer.id, $itemPackage.id);
      itemPackage.update((pack) => {
        pack.layers.push(layer);
        return pack;
      });
      addAnimation(
        GetAnimationForPackageChange(CHANGE_TYPE.LAYER_ADD, layer.outfitType)
      );
    }
    isOutfitPickerDialogOpen = false;
  };
  const setSkin = async function () {
    isSkinSetting = true;
    await SetMinecraftSkin($renderConfiguration);
    userSettings = await FetchSettings();
    addAnimation(HandsUpAnimation);
    ShowToast("Skin set successfully");
    isSkinSetting = false;
  };
  const setCape = function (e) {
    const item = e.detail.item as Cape;
    $renderConfiguration.cape = item;
  };
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <div id="render-node">
          <DragAndDrop on:drop={importLayerFromDrop}>
            <OutfitPackageRender
              pauseOnIntersection
              on:textureUpdate={UpdatePackageLayersOrder}
              bind:addAnimation={__addAnimation}
              source={$renderConfiguration.item}
              isDynamic
              cape={$renderConfiguration?.cape?.texture}
              layerId={$renderConfiguration.selectedLayerId}
              isFlatten={$renderConfiguration.isFlatten}
              resizable
              {renderer}
              resizeDebounce={0}
              baseTexture={$renderConfiguration.baseTexture}
            />
          </DragAndDrop>
        </div>
      </Placeholder>
    </div>
  </div>
  <div id="item-data">
    <SectionTitle label="Name" placeholder={!loaded} />
    <Placeholder {loaded} height="40px">
      <div id="item-data-title">
        <input class="title-input" bind:value={$itemPackage.name} />
        <Button
          onlyIcon
          icon={TrashIcon}
          label={"Delete item"}
          type={"tertiary"}
          on:click={openRemoveDialog}
        />
      </div>
    </Placeholder>
    <div id="item-data-type">
      <Placeholder {loaded} height="24px" width="120px">
        <Label>{isOutfitSet ? "Outfit set" : "Outfit"}</Label>
      </Placeholder>
      {#if $itemPackage?.social?.isShared}
        <Placeholder {loaded} height="24px" width="120px">
          <Label variant="rare">Shared</Label>
        </Placeholder>
      {/if}
      {#if loaded && userSettings?.currentTexture?.packageId == $itemPackage.id}
        <Placeholder {loaded} height="24px" width="120px">
          <Label variant="ancient">Current skin</Label>
        </Placeholder>
      {/if}
    </div>
    <div id="item-data-layers">
      <SectionTitle
        label={isOutfitSet ? "Outfits" : "Variants"}
        placeholder={!loaded}
      />
      {#if loaded}
        <OutfitLayerList
          packageId={$itemPackage.id}
          items={$itemPackageLayers}
          selectable={!isOutfitSet}
          selectedLayerId={$renderConfiguration.selectedLayerId}
          movable={isOutfitSet}
          dropable
          on:edit={openLayerEditDialog}
          on:moveUp={moveLayerUp}
          on:moveDown={moveLayerDown}
          on:select={setSelectedLayer}
          on:delete={removeLayer}
          on:drop={dropLayer}
          model={$itemPackage.model}
        ></OutfitLayerList>
      {/if}
      <div id="item-data-layers-options">
        {#if isOutfitSet || !loaded}
          <Placeholder {loaded} height="40px" loadedStyle={"flex:1"}>
            {#if isOutfitSet}
              <Button
                label={"Add outfit"}
                icon={AddIcon}
                iconSize="medium"
                type={"tertiary"}
                on:click={openOutfitPickerDialog}
              />
            {/if}
          </Placeholder>
        {/if}
        {#if loaded}
          <Button
            iconSize="medium"
            label={isOutfitSet ? "Import image" : "Import variant"}
            icon={ImportPackageIcon}
            type={"tertiary"}
            on:click={importImage}
          />
        {/if}
      </div>
    </div>
    {#if isMinecraftIntegrated && loaded && isOutfitSet}
      <div id="item-data-integration">
        <SectionTitle label="Capes" />
        <CapeList
          items={integrationSettings?.capes}
          selectedCapeId={$renderConfiguration?.cape?.id}
          on:select={setCape}
        />
      </div>
    {/if}
    <div id="item-data-description">
      <SectionTitle label="Description" placeholder={!loaded} />
      <Placeholder height="40px" {loaded}>
        <textarea
          id="description-input"
          bind:value={$itemPackage.description}
          placeholder="Enter description here..."
        ></textarea>
      </Placeholder>
      {#if loaded && isOutfitSet}
        <SectionTitle label="Color" />
        <ColorSelect
          bind:selectedItem={$itemPackage.colorName}
          placeholder="Select color"
          dropDownStyle="max-height: 40vh;"
          items={COLORS_ARRAY}
          autocomplete
          clearable
          itemText="normalizedName"
          itemValue="name"
        />
      {/if}
    </div>
    <div id="item-data-model">
      <SectionTitle label="Model" placeholder={!loaded} />
      <Placeholder height="40px" {loaded}>
        <ModelRadioGroup bind:selectedValue={$itemPackage.model} />
      </Placeholder>
    </div>
    <div id="item-data-minimal">
      <Placeholder width="150px" height="30px" {loaded}>
        <Checkbox
          label="Minimal format"
          bind:value={$renderConfiguration.isFlatten}
        />
      </Placeholder>
    </div>
    <div id="item-data-action">
      {#if loaded}
        {#if isMinecraftIntegrated && isOutfitSet}
          <Button
            label={isSkinSetting ? "Setting skin..." : "Set my skin"}
            type="primary"
            icon={isSkinSetting ? LoaderIcon : HumanHandsUpIcon}
            size="large"
            on:click={setSkin}
            disabled={isSkinSetting}
          />
        {/if}
        <MenuButton
          hideMenuButton={!isOutfitSet}
          containerStyle={isMinecraftIntegrated && isOutfitSet ? "" : "flex:1"}
          on:click={exportPackage}
          label="Download"
          type="primary"
          size="large"
          onlyIcon={isMinecraftIntegrated && !$IS_MOBILE_VIEW && isOutfitSet}
          icon={DownloadIcon}
        >
          <Button
            label="Download only texture"
            type="quaternary"
            size="medium"
            icon={DownloadIcon}
            on:click={exportPackageWithoutBaseTexture}
          />
        </MenuButton>
        <Button
          label="Manage collections"
          type="tertiary"
          size="large"
          onlyIcon={!$IS_MOBILE_VIEW}
          icon={ListIcon}
          on:click={openCollectionsDialog}
        />
        {#if !$itemPackage?.social?.isShared}
          <Button
            disabled={$itemPackage?.layers.length == 0}
            label="Share"
            icon={CloudIcon}
            onlyIcon={!$IS_MOBILE_VIEW}
            size={"large"}
            type={"tertiary"}
            on:click={sharePackage}
          />
        {:else}
          <Button
            on:click={openOverviewDialog}
            label="Overview"
            icon={MoreHorizontalIcon}
            onlyIcon={!$IS_MOBILE_VIEW}
            size={"large"}
            type={"tertiary"}
          />
        {/if}
      {:else}
        <Placeholder height="46px" />
        <Placeholder height="46px" />
      {/if}
    </div>
  </div>
  <!-- Dialogs -->
  <EditLayerDialog
    on:edit={editLayer}
    bind:open={isLayerEditDialogOpen}
    item={dialogSelectedLayer}
  />
  <OverviewDialog
    bind:open={isOverviewDialogOpen}
    item={$itemPackage}
    on:unshare={unsharePackage}
    on:share={sharePackage}
    on:page={goToPackagePage}
  />
  <ConfirmDialog
    bind:open={isRemoveDialogOpen}
    message={"Do you want to delete this item?"}
    label={"Delete item"}
    cancelIcon={null}
    confirmLabel={"Delete"}
    on:confirm={deletePackage}
  />
  <CollectionsDialog
    loading={dialogCollections?.items == null}
    bind:open={isCollectionsDialogOpen}
    items={dialogCollections}
    pageSizes={[6, 12, 24]}
    on:unselect={removeFromCollection}
    on:select={addToCollection}
    on:optionsChanged={openCollectionsDialog}
  />
  <OutfitPickerDialog
    items={dialogOutfitPickerItems}
    packageContext={$itemPackage}
    options={dialogOutfitsPickerOptions}
    pageSizes={[6, 12, 24]}
    bind:open={isOutfitPickerDialogOpen}
    loading={dialogOutfitPickerItems?.items == null}
    on:optionsChanged={openOutfitPickerDialog}
    on:select={addPackageLayer}
    on:filter={openOutfitPickerDialog}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
