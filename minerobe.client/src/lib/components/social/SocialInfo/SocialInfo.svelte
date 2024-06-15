<script lang="ts">
  import HeartSmallIcon from "$icons/small/heart.svg?raw";
  import DownloadSmallIcon from "$icons/small/download.svg?raw";
  import { normalizeNumber } from "$src/helpers/data/dataHelper";
  import type { PackageSocialData } from "$src/model/package";

  export let data: PackageSocialData;
  export let dense = false;
  export let showLikes = true;
  export let showDownloads = true;

  let normalizedLikes: string = "";
  let normalizedDownloads: string = "";

  $: {
    if (data) {
      if (data.likes != null) {
        normalizedLikes = normalizeNumber(data.likes);
      }
      if (data.downloads != null) {
        normalizedDownloads = normalizeNumber(data.downloads);
      }
    }
  }
</script>

<div class="social-info" class:dense>
  {#if data?.likes > 0 && showLikes}
    <div class="icon-custom-small mc-font data">
      {@html HeartSmallIcon}
      <div class="info-text">
        {normalizedLikes}
      </div>
    </div>
  {/if}
  {#if data?.downloads > 0 && showDownloads}
    <div class="icon-custom-small mc-font data">
      {@html DownloadSmallIcon}
      <div class="info-text">
        {normalizedDownloads}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .social-info {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 2px;
    &.dense {
      height: 22px;
    }
    &>.data
    {
      min-width: 35px;
    }
  }
  .info-text {
    vertical-align: top;
    display: inline-table;
    margin-top: 1px;
  }
</style>
