<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import DownloadIcon from "$icons/download.svg?raw";
  import { showToast } from "$src/data/cache";
  import { onMount } from "svelte";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import Checkbox from "$lib/components/base/Checkbox/Checkbox.svelte";

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
<Menu label="Wardrobe" open items={
  [
    { label: "All", icon: DownloadIcon },
    { label: "Tops", icon: DownloadIcon,type: "separator"},
    { label: "Bottoms", icon: DownloadIcon,type: "header"},
    { label: "Shoes", icon: DownloadIcon,badge:"4" },
    { label: "Accessories", icon: DownloadIcon },
  ]
}>
</Menu>
<Checkbox value={true} />
<style lang="scss">
  @import "style.scss";
</style>
