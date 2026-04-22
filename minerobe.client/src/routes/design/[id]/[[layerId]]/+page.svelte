<script lang="ts">
  //api
  import { DownloadTexture, GetPackage } from "$src/api/pack";
  import { FetchSettings } from "$src/api/settings";
  import { GetAccount } from "$src/api/integration/minecraft.js";
  import {
    AddPackageToWardrobe,
    GetWadrobeCollectionsWithPackageContext,
    RemovePackageFromWardrobe,
  } from "$src/api/wardrobe.js";

  //services
  import { ExportImage } from "$src/data/export.js";
  import { ShowToast } from "$src/data/toast.js";
  import { navigateToOutfitPackage } from "$src/helpers/other/navigationHelper";
  import type { RenderAnimation } from "$src/data/animation.js";

  //consts
  import { APP_STATE } from "$src/data/enums/app.js";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit.js";
  import type { MODEL_TYPE } from "$src/data/enums/model.js";

  //models
  import type { PagedResponse, PageOptions } from "$data/models/base";
  import type { OutfitPackageCollectionWithPackageContext } from "$data/models/collection";
  import { OutfitPackageRenderConfig } from "$data/models/render";
  import { MinerobeUserSettings } from "$data/models/user";

  //components
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import Placeholder from "$lib/components/base/Placeholder/Placeholder.svelte";
  import SectionTitle from "$lib/components/base/SectionTitle/SectionTitle.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitLayerList from "$lib/components/outfit/OutfitLayerList/OutfitLayerList.svelte";
  import ModelRadioGroup from "$lib/components/outfit/ModelRadioGroup/ModelRadioGroup.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";
  import CapeList from "$lib/components/outfit/CapeList/CapeList.svelte";
  import CollectionsDialog from "$lib/components/dialog/CollectionsDialog.svelte";
  import SocialInfo from "$lib/components/social/SocialInfo.svelte";
  import MenuButton from "$lib/components/other/MenuButton/MenuButton.svelte";

  //icons
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import EditIcon from "$src/icons/edit.svg?raw";
  import HeartIcon from "$icons/heart.svg?raw";
  import HeartFilledIcon from "$icons/heart-filled.svg?raw";

  import { _ } from "svelte-i18n";
  import { writable, type Writable } from "svelte/store";
  import { onDestroy, onMount } from "svelte";
  import { propertyStore } from "svelte-writable-derived";
  //api
  import {
    AddPackageToCollection,
    RemovePackageFromCollection,
  } from "$src/api/collection.js";
  //services
  import { SetMinecraftSkin } from "$src/data/integration.js";
  import { replaceState } from "$app/navigation";
  //consts
  import {
    BASE_TEXTURE,
    CURRENT_APP_STATE,
    CURRENT_USER,
    IS_MOBILE_VIEW,
  } from "$src/data/static.js";
  //models
  import type {
    Cape,
    MinecraftAccount,
  } from "$data/models/integration/minecraft";
  import { OutfitLayer, type OutfitPackage } from "$model/package";
  import DefaultAnimation from "$src/animation/default.js";
  import HandsUpAnimation from "$src/animation/handsup";
  //components
  //icons
  import { THREE } from "$lib/three.js";

  interface Props {
    data: any;
  }

  let { data }: Props = $props();

  const renderConfiguration: Writable<OutfitPackageRenderConfig> = writable(
    new OutfitPackageRenderConfig(),
  );
  const itemPackage: Writable<OutfitPackage> = propertyStore(
    renderConfiguration,
    "item",
  );
  const itemPackageLayers: Writable<OutfitLayer[]> = propertyStore(
    itemPackage,
    "layers",
  );
  let loaded = $state(false);
  let isOutfitSet = $state(false);
  let isMinecraftIntegrated = $state(false);
  let userSettings: MinerobeUserSettings = $state(null);
  let integrationSettings: MinecraftAccount = $state(null);
  let renderer: any = $state(null);

  // dialog data
  let dialogCollections: PagedResponse<OutfitPackageCollectionWithPackageContext> =
    $state(null);
  let isCollectionsDialogOpen = $state(false);

  //others
  let isSkinSetting = $state(false);
  let outfitRender = $state(null);

  let stateSub = null;
  onMount(async () => {
    stateSub = CURRENT_APP_STATE.subscribe(async (state) => {
      if (state != APP_STATE.READY && state != APP_STATE.GUEST_READY) return;
      const threeModule = await THREE.getThree();
      renderer = new threeModule.WebGLRenderer({
        alpha: true,
      });
      renderer.outputColorSpace = threeModule.LinearSRGBColorSpace;

      $itemPackage = await GetPackage(data.id);
      isOutfitSet = $itemPackage.type === PACKAGE_TYPE.OUTFIT_SET;
      $renderConfiguration.item = $itemPackage;

      if (!isOutfitSet) {
        if (data.layerId == null && $itemPackage.layers.length > 0)
          $renderConfiguration.selectedLayerId = $itemPackage.layers[0]?.id;
        else $renderConfiguration.selectedLayerId = data.layerId;
      }
      if (data.isFlat != null) $renderConfiguration.isFlatten = data.isFlat;
      if (data.model != null) $itemPackage.model = data.model as MODEL_TYPE;

      if (state == APP_STATE.READY) {
        userSettings = await FetchSettings();
        if (isOutfitSet && userSettings?.baseTexture != null)
          $renderConfiguration.baseTexture = userSettings.baseTexture.layers[0];
        else $renderConfiguration.baseTexture = $BASE_TEXTURE;

        isMinecraftIntegrated =
          userSettings?.integrations.includes("minecraft");
        if (isMinecraftIntegrated && isOutfitSet) {
          integrationSettings = await GetAccount(false);
          $renderConfiguration.cape = integrationSettings.capes?.find(
            (c) => c.id == userSettings?.currentTexture?.capeId,
          );
        }
      } else $renderConfiguration.baseTexture = $BASE_TEXTURE;

      loaded = true;
      setTimeout(() => addAnimation(null), 0);
    });
  });
  onDestroy(() => {
    if (stateSub) stateSub();
  });

  //layers
  const setSelectedLayer = (e) => {
    const layerId = e.item.id;
    renderConfiguration.update((config) => {
      config.selectedLayerId = layerId;
      return config;
    });
    replaceState(`/design/${$itemPackage.id}/${layerId}`, null);
  };

  //export
  const exportPackage = async (usebaseTexture: boolean) => {
    var data = await DownloadTexture($renderConfiguration, usebaseTexture);

    await ExportImage(data.texture.content, data.texture.fileName);
    $itemPackage.social.downloads = data.downloads;
    addAnimation(HandsUpAnimation);
  };

  //animations
  const addAnimation = (animation: RenderAnimation) => {
    if (animation) outfitRender?.addAnimation?.(animation, false);
    outfitRender?.addAnimation?.(DefaultAnimation, true);
  };

  //dialogs
  const openCollectionsDialog = async (e) => {
    let options: PageOptions = e?.options?.options;
    if (!options) options = { page: 0, pageSize: 6, total: 0 };
    dialogCollections = {
      items: null,
      options: options,
      sort: null,
    };
    isCollectionsDialogOpen = true;
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      options.page,
      options.pageSize,
    );
  };

  //actions
  const addToCollection = async function (e) {
    const collection = e.item;
    await AddPackageToCollection(collection.id, $itemPackage.id);
    ShowToast("Item added to collection");
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      dialogCollections.options.page,
      dialogCollections.options.pageSize,
    );
  };
  const removeFromCollection = async function (e) {
    const collection = e.item;
    await RemovePackageFromCollection(collection.id, $itemPackage.id);
    ShowToast("Item removed from collection", "info");
    dialogCollections = await GetWadrobeCollectionsWithPackageContext(
      $itemPackage.id,
      undefined,
      dialogCollections.options.page,
      dialogCollections.options.pageSize,
    );
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
    const item = e.item as Cape;
    $renderConfiguration.cape = item;
  };
  const likeItem = async function () {
    await AddPackageToWardrobe($itemPackage.id);
    ShowToast("Item added to your wardrobe");
    $itemPackage.isInWardrobe = true;
    $itemPackage.social.likes += 1;
  };
  const unlikeItem = async function () {
    await RemovePackageFromWardrobe($itemPackage.id);
    ShowToast("Item removed from your wardrobe", "info");
    $itemPackage.isInWardrobe = false;
    $itemPackage.social.likes -= 1;
  };
</script>

<div id="item-page" class:mobile={$IS_MOBILE_VIEW}>
  <div id="item-render">
    <div id="render">
      <Placeholder {loaded}>
        <div id="render-node">
          <OutfitPackageRender
            bind:this={outfitRender}
            pauseOnIntersection
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
        </div>
      </Placeholder>
    </div>
  </div>
  <div id="item-data">
    <SectionTitle
      label={isOutfitSet ? "Outfit set" : "Outfit"}
      placeholder={!loaded}
    />
    <Placeholder {loaded} height="40px">
      <div id="item-data-title">
        {$itemPackage.name}
      </div>
    </Placeholder>
    <div id="item-data-type">
      <Placeholder {loaded} height="24px" width="120px">
        <Label variant="unique">{$itemPackage.publisher.name}</Label>
      </Placeholder>
      {#if loaded && userSettings?.currentTexture.packageId == $itemPackage.id}
        <Placeholder {loaded} height="24px" width="120px">
          <Label variant="ancient">Current skin</Label>
        </Placeholder>
      {/if}
      <Placeholder {loaded} height="24px" width="120px">
        <SocialInfo dense data={$itemPackage.social} />
      </Placeholder>
    </div>
    <div id="item-data-layers">
      <SectionTitle
        label={isOutfitSet ? "Outfits" : "Variants"}
        placeholder={!loaded}
      />
      {#if loaded}
        <OutfitLayerList
          dense={!isOutfitSet}
          link={"/design/"}
          readonly={isOutfitSet}
          packageId={$itemPackage.id}
          items={$itemPackageLayers}
          selectable={!isOutfitSet}
          selectedLayerId={$renderConfiguration.selectedLayerId}
          movable={false}
          removable={false}
          editable={false}
          onselect={setSelectedLayer}
          model={$itemPackage.model}
        ></OutfitLayerList>
      {/if}
    </div>
    {#if isMinecraftIntegrated && loaded && isOutfitSet}
      <div id="item-data-integration">
        <SectionTitle label="Capes" />
        <CapeList
          items={integrationSettings?.capes}
          selectedCapeId={$renderConfiguration.cape?.id}
          onselect={setCape}
        />
      </div>
    {/if}
    {#if $itemPackage?.description?.length > 0}
      <div id="item-data-description">
        <SectionTitle label="Description" placeholder={!loaded} />
        <Placeholder height="40px" {loaded}>
          <div id="item-description">{$itemPackage.description}</div>
        </Placeholder>
      </div>
    {/if}
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
            onclick={setSkin}
            disabled={isSkinSetting}
          />
        {/if}
        <MenuButton
          hideMenuButton={!isOutfitSet}
          containerStyle={isMinecraftIntegrated && isOutfitSet ? "" : "flex:1"}
          onclick={() => exportPackage(true)}
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
            onclick={() => exportPackage(false)}
          />
        </MenuButton>
        {#if $CURRENT_USER?.id != $itemPackage.publisher.id && $CURRENT_USER?.id != null}
          {#if $itemPackage.isInWardrobe}
            <Button
              label="Unlike item"
              type="tertiary"
              size="large"
              onlyIcon={!$IS_MOBILE_VIEW}
              icon={HeartFilledIcon}
              onclick={unlikeItem}
            />
          {:else}
            <Button
              label="Like item"
              type="tertiary"
              size="large"
              onlyIcon={!$IS_MOBILE_VIEW}
              icon={HeartIcon}
              onclick={likeItem}
            />
          {/if}
          {#if !$IS_MOBILE_VIEW}
            <span class="separator vertical"></span>
          {/if}
        {/if}
        {#if $CURRENT_USER?.id != null}
          <Button
            label="Manage collections"
            type="tertiary"
            size="large"
            onlyIcon={!$IS_MOBILE_VIEW}
            icon={ListIcon}
            onclick={openCollectionsDialog}
          />
        {/if}
        {#if $CURRENT_USER?.id == $itemPackage.publisher.id}
          <Button
            label="Edit item"
            type="tertiary"
            size="large"
            onlyIcon={!$IS_MOBILE_VIEW}
            icon={EditIcon}
            onclick={() =>
              navigateToOutfitPackage($itemPackage, undefined, true)}
          />
        {/if}
      {:else}
        <Placeholder height="46px" />
        <Placeholder height="46px" />
      {/if}
    </div>
  </div>
  <!-- Dialogs -->
  <CollectionsDialog
    loading={dialogCollections?.items == null}
    bind:open={isCollectionsDialogOpen}
    items={dialogCollections}
    pageSizes={[6, 12, 24]}
    onunselect={removeFromCollection}
    onselect={addToCollection}
    onoptionsChanged={openCollectionsDialog}
  />
</div>

<style lang="scss">
  @use "style.scss";
</style>
