<script lang="ts">
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import MenuItemHeader from "$lib/components/base/MenuItemHeader/MenuItemHeader.svelte";
  import { CURRENT_USER, IS_MOBILE_VIEW } from "$src/data/static";
  import MenuIcon from "$src/icons/menu.svg?raw";
  import ShoppingBagIcon from "$icons/shopping-bag.svg?raw";
  import AnimationIcon from "$icons/animation.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import AddIcon from "$icons/plus.svg?raw";
  import MenuSeparator from "$lib/components/base/MenuSeparator/MenuSeparator.svelte";
  import { OUTFIT_TYPE, PACKAGE_TYPE } from "$src/data/enums/outfit";
  import Button from "$lib/components/base/Button/Button.svelte";
  import MenuItem from "$lib/components/base/MenuItem/MenuItem.svelte";
  import OutfitPackageTypePickerDialog from "$lib/components/dialog/OutfitPackageTypePickerDialog.svelte";
  import { OutfitPackage } from "$src/data/models/package";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { AddPackage } from "$src/api/pack";
  import { AddPackageToWardrobe } from "$src/api/wardrobe";
  import { navigateToOutfitPackageEdit } from "$src/helpers/other/navigationHelper";
  import { ShowToast } from "$src/data/toast";
  import { page } from "$app/stores";

  let menuOpened = true;
  let isCreating = false;
  let isTypePickerDialogOpen = false;

  let selectedView = "sets";

  $: selectedView = $page.route.id.split("/")[2] || "sets";

  const openOutfitTypePickerDialog = function () {
    isTypePickerDialogOpen = true;
  };
  const newOutfit = async function (e) {
    const type = e.detail.type;
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
    on:select={newOutfit}
  />
</div>

<style lang="scss">
  @use "layout_style.scss";
</style>
