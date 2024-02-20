<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import DownloadIcon from "$icons/download.svg?raw";
  import { showToast } from "$src/data/cache";
  import { onMount } from "svelte";

  onMount(() => {
    console.log("mounted");
  });
</script>

<h1 id="view-title">Explore new outfits</h1>
<Button
  fab="dynamic"
  icon={DownloadIcon}
  label="tets"
  size="small"
  on:click={() => showToast("skin changed")}
/>

<style lang="scss">
  @import "style.scss";
</style>
