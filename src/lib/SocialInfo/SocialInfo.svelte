<script lang="ts">
  import type { PackageSocialData } from "$src/data/common";
  import HeartSmallIcon from "$icons/small/heart.svg?raw";
  import DownloadSmallIcon from "$icons/small/download.svg?raw";
  import { normalizeNumber } from "$src/helpers/dataHelper";

  export let data: PackageSocialData;
  export let dense = false;

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
  {#if data?.likes > 0}
    <div class="icon-custom-small mc-font">
      {@html HeartSmallIcon}
      <div class="info-text">
        {normalizedLikes}
      </div>
    </div>
  {/if}
  {#if data?.downloads > 0}
    <div class="icon-custom-small mc-font">
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
    gap: 8px;
    margin-top: 2px;
    &.dense {
      height: 22px;
    }
  }
  .icon-custom-small > svg {
    transform: scale(0.79);
  }
  .info-text {
    vertical-align: top;
    display: inline-table;
    margin-top: 1px;
  }
</style>
