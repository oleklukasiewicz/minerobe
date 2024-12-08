<script lang="ts">
  import { _ } from "svelte-i18n";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { currentUser, isMobileView, isUserGuest } from "$src/data/cache";
  import { createEventDispatcher } from "svelte";

  import DownloadIcon from "$icons/download.svg?raw";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import CloudIcon from "$icons/cloud.svg?raw";
  import ListIcon from "$icons/list.svg?raw";
  import MoreHorizontalIcon from "$icons/more-horizontal.svg?raw";
  import type { OutfitPackage } from "$data/models/package";

  const dispatch = createEventDispatcher();

  export let outfitPackage: OutfitPackage;
  export let loading: boolean = false;
  export let mobile: boolean = false;
  export let readonly: boolean = false;
  export let isSkinSetting: boolean = false;
  export let setMySkinAvailable = false;
  export const downloadImage = function () {
    dispatch("download");
  };
  export const sharePackage = function () {
    dispatch("share");
  };
  export const shareDialog = function () {
    dispatch("shareDialog");
  };
  export const collectionDialog = function () {
    dispatch("collectionDialog");
  };
  export const skinSet = function (e) {
    dispatch("skinSet", e.detail);
  };
</script>

<div class="item-actions" class:mobile>
  {#if setMySkinAvailable}
    <Button
      icon={isSkinSetting ? LoaderIcon : HumanHandsUpIcon}
      size="large"
      label={isSkinSetting ? "Setting skin..." : "Set my skin"}
      style="flex:1;"
      on:click={skinSet}
    />
  {/if}
  <div style={$isMobileView || !setMySkinAvailable ? "flex:1;" : ""}>
    <Button
      on:click={downloadImage}
      label={$_("download")}
      onlyIcon={!$isMobileView && setMySkinAvailable}
      icon={DownloadIcon}
      disabled={outfitPackage.layers.length == 0 || loading}
      size="large"
    />
  </div>
  {#if $currentUser?.id != null}
    <div>
      <Button
        on:click={collectionDialog}
        label={"Add to collection"}
        onlyIcon={!$isMobileView}
        disabled={outfitPackage.layers.length == 0 || loading}
        icon={ListIcon}
        size="large"
        type="tertiary"
      />
    </div>
  {/if}
  {#if outfitPackage.publisher.id == $currentUser?.id && !readonly}
    {#if outfitPackage.social.isShared}
      <div>
        <Button
          on:click={shareDialog}
          type="tertiary"
          icon={MoreHorizontalIcon}
          onlyIcon={!$isMobileView}
          label={$_("shareinfo")}
          size="large"
        />
      </div>
    {:else}
      <div>
        <Button
          on:click={sharePackage}
          type="tertiary"
          icon={CloudIcon}
          disabled={outfitPackage.layers.length == 0 || loading}
          onlyIcon={!$isMobileView}
          label={$_("sharePackage")}
          size="large"
        />
      </div>
    {/if}
  {/if}
</div>

<style lang="scss">
  .item-actions {
    display: flex;
    flex-direction: row;
    gap: 8px;
    &.mobile {
      display: grid !important;
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr;
    }
  }
</style>
