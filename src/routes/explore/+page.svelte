<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import DownloadIcon from "$icons/download.svg?raw";
  import RatioGroup from "$lib/components/base/RatioGroup/RatioGroup.svelte";
  import Dialog from "$lib/components/base/Dialog/Dialog.svelte";
  import AddVariantDialog from "$lib/components/dialog/AddVariantDialog.svelte";
  import { showToast } from "$src/data/cache";
</script>

<h1 id="view-title">Explore new outfits</h1>
<Button fab="dynamic" icon={DownloadIcon} label="tets" size="small" on:click={()=> showToast("skin changed")}/>

<style lang="scss">
  @import "style.scss";
</style>
