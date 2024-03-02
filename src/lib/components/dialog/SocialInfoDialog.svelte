<script lang="ts">
  import type { OutfitPackage } from "$src/data/common";
  import Label from "../base/Label/Label.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import SpotlightIcon from "$icons/spotlight.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import { _ } from "svelte-i18n";
  import { createEventDispatcher } from "svelte";
  import Button from "../base/Button/Button.svelte";
  import SocialInfo from "../social/SocialInfo/SocialInfo.svelte";

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
  <div class="data">
    <div style="flex:1;">
      <SectionTitle label="Name" />
      <h3 style="margin: 0px;">{item.name}</h3>
    </div>
    <div>
      <SectionTitle label="Author" />
      <Label variant="unique">{item.publisher.name}</Label>
    </div>
    <div>
      <SectionTitle label="Social" />
      <div style="font-family: minecraft;margin:8px 0px;" class="icon-small">
        <SocialInfo data={item.social} />
      </div>
    </div>
  </div>
  <br />
  <SectionTitle label="Actions" />
  <div style="display:flex;gap:8px;max-width:calc(100vw - 16px);">
    <Button
      on:click={goToItemPage}
      label={$_("goToItemPage")}
      icon={SpotlightIcon}
    />
    <Button
      type="tertiary"
      on:click={unSharePackage}
      icon={CloseIcon}
      label={$_("unsharepackage")}
    />
  </div>
</div>

<style lang="scss">
  .social-dialog {
    margin: 8px;
    min-width:min(400px, calc(100vw - 16px));
    & > .data {
      display: grid;
      grid-template-columns: 1fr auto auto;
      max-width: calc( 100vw - 16px);
      gap: 32px;
      margin-right: 8px;
    }
  }
</style>
