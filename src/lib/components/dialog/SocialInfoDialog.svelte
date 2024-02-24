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
  <SectionTitle label="Name" />
  <h3 style="margin: 0px;">{item.name}</h3>
  <SectionTitle label="Author" />
  <Label variant="unique">{item.publisher.name}</Label>
  <SectionTitle label="Info" />
  <div style="font-family: minecraft;margin:8px 0px;" class="icon-small">
    <SocialInfo data={item.social}/>
  </div>
  <br />
  <SectionTitle label="Actions" />
  <div style="display:flex;gap:8px;max-width:500px;">
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
    min-width: 500px;
    div {
      display: flex;
      flex-direction: row;
    }
  }
</style>
