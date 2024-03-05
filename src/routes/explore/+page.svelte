<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import DownloadIcon from "$icons/download.svg?raw";
  import { showToast } from "$src/data/cache";
  import { onMount } from "svelte";
  import Menu from "$lib/components/other/Menu/Menu.svelte";
  import MenuItem from "$lib/components/other/MenuItem/MenuItem.svelte";

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
<Menu label="Wardrobe">
  <MenuItem label="Download" icon={DownloadIcon} selected/>
</Menu>

<style lang="scss">
  @import "style.scss";
</style>
