<script lang="ts">
  import type { OutfitPackage } from "$src/data/common";
  import Label from "../base/Label/Label.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import HearthIcon from "$icons/heart.svg?raw";
  import DownloadIcon from "$icons/download.svg?raw";
  import SpotlightIcon from "$icons/spotlight.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  const goToItemPage = () => {
    dispatch("itempage");
  };
  const unSharePackage = () => {
    dispatch("unshare");
  };

  export let item: OutfitPackage;
</script>

<div class="social-dialog">
  <SectionTitle label="Name" />
  <h3 style="margin: 0px;">{item.name}</h3>
  <SectionTitle label="Author" />
  <Label variant="unique">{item.publisher.name}</Label>
  <SectionTitle label="Info" />
  <div style="font-family: minecraft;margin:8px;" class="icon-small">
    <div>
      {@html HearthIcon}
      <div style="margin-top:2px;margin-left:4px;">
        {item.social.likes}
      </div>
    </div>
    &nbsp;&nbsp;&nbsp;
    <div>
      {@html DownloadIcon}
      <div style="margin-top:2px;margin-left:4px;">
        {item.social.downloads || 0}
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
      title={$_("unsharepackage")}
      class="secondary"
      >{@html CloseIcon}
      {$_("unsharepackage")}</button
    >
  </div>
</div>

<style lang="scss">
  .social-dialog {
    margin: 8px;
    min-width: 500px;
    div {
      display: flex;
      flex-direction: row;
    }
  }
</style>
