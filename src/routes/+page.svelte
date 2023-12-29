<script lang="ts">
  import OutfitPackageSnapshotList from "$lib/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import { FetchLandingPage } from "$src/api/landing";
  import { defaultRenderer } from "$src/data/cache";
  import { onMount } from "svelte";

  let mostLiked = [];
  let mostLikedReady = false;
  onMount(async () => {
    let landing = await FetchLandingPage();
    mostLiked = landing.mostLiked;
    mostLikedReady = true;
  });
</script>

<h1 id="view-title">Welcome to Minerobe</h1>
<OutfitPackageSnapshotList items={mostLiked} ready={mostLikedReady} renderer={$defaultRenderer} dense={false}/>

<style lang="scss">
  @import "style.scss";
</style>
