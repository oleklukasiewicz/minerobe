<script lang="ts">
  //main imports
  import { page } from "$app/stores";
  //api
  import { AddPackage } from "$src/api/pack";
  import {
    AddCollectionToWardrobe,
    AddPackageToWardrobe,
  } from "$src/api/wardrobe";
  //services
  import {
    navigateToCollection,
    navigateToOutfitPackageEdit,
  } from "$src/helpers/other/navigationHelper";
  import { ShowToast } from "$src/data/toast";
  //consts
  import { CURRENT_USER, IS_MOBILE_VIEW } from "$src/data/static";
  //model
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { OutfitPackage } from "$src/data/models/package";
  import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/enums/outfit";
  //components
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";
  import Button from "$lib/components/base/Button/Button.svelte";
  import OutfitPackageTypePickerDialog from "$lib/components/dialog/OutfitPackageTypePickerDialog.svelte";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  //icons
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import { OutfitPackageCollection } from "$src/data/models/collection";
  import { AddCollection } from "$src/api/collection";

  let menuOpened = true;
  let isCreating = false;
  let isTypePickerDialogOpen = false;

  let selectedView = "sets";

  $: selectedView = $page.route.id.split("/")[2] || "sets";

  const openOutfitTypePickerDialog = function () {
    isTypePickerDialogOpen = true;
  };
  const newOutfit = async function (type) {
    isCreating = true;
    isTypePickerDialogOpen = false;
    const name = type == PACKAGE_TYPE.OUTFIT_SET ? "New set" : "New outfit";
    const newPack = new OutfitPackage(name, MODEL_TYPE.ALEX, [], type);
    newPack.publisherId = $CURRENT_USER.id;
    newPack.description = "";
    newPack.outfitType =
      type == PACKAGE_TYPE.OUTFIT
        ? OUTFIT_TYPE.DEFAULT
        : OUTFIT_TYPE.OUTFIT_SET;
    try {
      const resp = await AddPackage(newPack);
      if (resp == null) {
        isCreating = false;
        return;
      }
      await AddPackageToWardrobe(resp.id);
      isCreating = false;
      navigateToOutfitPackageEdit(resp.id);
    } catch (e) {
      isCreating = false;
      ShowToast("Error creating new outfit", "error");
    }
  };
  const newCollection = async function () {
    isCreating = true;
    isTypePickerDialogOpen = false;
    const collection = new OutfitPackageCollection();
    collection.name = "New collection";
    collection.publisherId = $CURRENT_USER.id;
    collection.description = "";
    try {
      const resp = await AddCollection(collection);
      if (resp == null) {
        isCreating = false;
        return;
      }
      await AddCollectionToWardrobe(resp.id);
      isCreating = false;
      navigateToCollection(resp.id);
    } catch (e) {
      isCreating = false;
      ShowToast("Error creating new collection", "error");
    }
  };
  const newItem = async function (e) {
    if (e.detail.type === PACKAGE_TYPE.OUTFIT_COLLECTION) {
      await newCollection();
    } else {
      await newOutfit(e.detail.type);
    }
  };
</script>

<div id="wardrobe-view" class:mobile={$IS_MOBILE_VIEW}>
  <div id="navigation" class:opened={menuOpened}>
    <div>
      <Menu let:opened let:top opened={menuOpened} top={$IS_MOBILE_VIEW}>
        {#if !$IS_MOBILE_VIEW}
          <MenuItemHeader
            label="Wardrobe"
            icon={MenuIcon}
            {opened}
            on:click={() => (menuOpened = !menuOpened)}
          />
          <div>
            <Button
              icon={AddIcon}
              label={"Create new item"}
              on:click={openOutfitTypePickerDialog}
              onlyIcon={!menuOpened}
              disabled={isCreating}
              size={menuOpened ? "medium" : "auto"}
              style="height: 40px"
            />
          </div>
          <MenuSeparator />
        {/if}
        <MenuItem
          label="Sets"
          icon={AnimationIcon}
          {opened}
          {top}
          selected={selectedView == "sets"}
          href="/wardrobe"
        />
        <MenuItem
          {opened}
          {top}
          label="Outfits"
          icon={ShoppingBagIcon}
          selected={selectedView == "outfits"}
          href="/wardrobe/outfits"
        />
        <MenuItem
          {opened}
          {top}
          label="Collections"
          icon={ListIcon}
          selected={selectedView == "collections"}
          href="/wardrobe/collections"
        />
      </Menu>
    </div>
  </div>
  <div id="content">
    <slot></slot>
  </div>
  {#if $IS_MOBILE_VIEW}
    <Button
      icon={AddIcon}
      label={"Create new item"}
      on:click={openOutfitTypePickerDialog}
      fab={"dynamic"}
      size={"large"}
    />
  {/if}
  <OutfitPackageTypePickerDialog
    bind:open={isTypePickerDialogOpen}
    on:select={newItem}
  />
</div>

<style lang="scss">
  @use "layout_style.scss";
</style>
