<script lang="ts">
  import OutfitPackageSnapshotList from "$lib/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import { FetchLandingPage } from "$src/api/landing";
  import { defaultRenderer } from "$src/data/cache";
  import { navigateToOutfitPackage } from "$src/helpers/navigationHelper";
  import { onMount } from "svelte";

  let mostLiked = [];
  let mostDownloaded = [];
  onMount(async () => {
    let landing = await FetchLandingPage();
    mostLiked = landing.mostLiked;
    mostDownloaded = landing.mostDownloaded;
  });
  const goToItemPage = (e) => {
    const item = e.detail;
    navigateToOutfitPackage(item);
  };
</script>

<h1 id="view-title">Welcome to Minerobe</h1>
<h2>Most Liked</h2>
<OutfitPackageSnapshotList
  items={mostLiked}
  renderer={$defaultRenderer}
  dense={false}
  on:select={goToItemPage}
  minItemWidth={175}
/>
<h2>Most Downloaded</h2>
<OutfitPackageSnapshotList
  items={mostDownloaded}
  renderer={$defaultRenderer}
  minItemWidth={175}
  dense={false}
  on:select={goToItemPage}
/>

<style lang="scss">
  @import "style.scss";
</style>
