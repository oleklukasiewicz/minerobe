<script lang="ts">
  import type { OutfitPackage } from "$src/model/package";
  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import Label from "../base/Label/Label.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import SocialInfo from "../social/SocialInfo/SocialInfo.svelte";
  import CloudIcon from "$icons/cloud.svg?raw";
  import CloseIcon from "$icons/close.svg?raw";
  import SpotlightIcon from "$icons/spotlight.svg?raw";
  export let open: boolean;
  export let item: OutfitPackage;
</script>

<Dialog bind:open label="Overview">
  <div id="overview-dialog">
    <div class="item-data">
      <div class="title-section">
        <SectionTitle label="Name" />
        <h3 class="item-title">{item.name}</h3>
      </div>
      <div>
        <SectionTitle label="Author" />
        <Label variant="unique">{item.publisher.name}</Label>
      </div>
    </div>
    <SectionTitle label="Social" />
    <SocialInfo data={item.social} />
    <SectionTitle label="Actions" />
    <div class="item-actions">
      {#if item.social.isShared}
        <Button label="item page" icon={SpotlightIcon} />
        <Button label="Unshare" type="tertiary" icon={CloseIcon} />
      {:else}
        <Button label="Share" icon={CloudIcon} />
      {/if}
    </div>
  </div>
</Dialog>

<style lang="scss">
  #overview-dialog {
    min-width: 300px;
    .item-data {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 16px;
      margin-right: 8px;
      margin-bottom: 8px;
      .title-section {
        min-width: 12vw;
        max-width: 300px;
        .item-title {
          margin: 0;
          text-overflow: ellipsis;
          text-wrap: nowrap;
          overflow: hidden;
        }
      }
    }
    .item-actions {
      display: flex;
      gap: 8px;
    }
  }
</style>
