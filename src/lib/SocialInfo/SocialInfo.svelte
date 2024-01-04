<script lang="ts">
  import type { PackageSocialData } from "$src/data/common";
  import HeartSmallIcon from "$icons/small/heart.svg?raw";
  import DownloadSmallIcon from "$icons/small/download.svg?raw";

  export let data: PackageSocialData;
  export let dense = false;

  let normalizedLikes: string = "";
  let normalizedLikesPostFix: string = "";
  let normalizedDownloads: string = "";
  let normalizedDownloadsPostFix: string = "";

  $: {
    if (data) {
      if (data.likes != null) {
        if (data.likes > 999) {
          if (data.likes > 999999) {
            normalizedLikes = (data.likes / 1000000).toFixed(1);
            normalizedLikesPostFix = "m";
          } else {
            normalizedLikes = (data.likes / 1000).toFixed(1);
            normalizedLikesPostFix = "k";
          }
        } else {
          normalizedLikes = data.likes?.toString();
          normalizedLikesPostFix = "";
        }
      }
      if (data.downloads != null) {
        if (data.downloads > 999) {
          if (data.downloads > 999999) {
            normalizedDownloads = (data.downloads / 1000000).toFixed(1);
            normalizedDownloadsPostFix = "m";
          } else {
            normalizedDownloads = (data.downloads / 1000).toFixed(1);
            normalizedDownloadsPostFix = "k";
          }
        } else {
          normalizedDownloads = data.downloads?.toString();
          normalizedDownloadsPostFix = "";
        }
      }
    }
  }
</script>

<div class="social-info" class:dense>
  {#if data?.likes > 0}
    <div class="icon-custom-small mc-font">
      {@html HeartSmallIcon}
      <div class="info-text">
        {normalizedLikes}{normalizedLikesPostFix}
      </div>
    </div>
  {/if}
  {#if data?.downloads > 0}
    <div class="icon-custom-small mc-font">
      {@html DownloadSmallIcon}
      <div class="info-text">
        {normalizedDownloads}{normalizedDownloadsPostFix}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .social-info {
    display: flex;
    gap: 8px;
    margin-top: 2px;
    &.dense
    {
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
