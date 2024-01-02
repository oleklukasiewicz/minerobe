<script lang="ts">
  import OutfitPackageSnapshotList from "$lib/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import Placeholder from "$lib/Placeholder/Placeholder.svelte";
  import { FetchLandingPage } from "$src/api/landing";
  import { defaultRenderer, isMobileView } from "$src/data/cache";
  import { navigateToOutfitPackage } from "$src/helpers/navigationHelper";
  import { onMount } from "svelte";

  let mostLiked = [];
  let mostRecent = [];
  let mostDownloaded = [];
  let landingLoaded = false;
  onMount(async () => {
    let landing = await FetchLandingPage();
    mostLiked = landing.mostLiked;
    mostDownloaded = landing.mostDownloaded;
    mostRecent = landing.mostRecent;
    landingLoaded = true;
  });
  const goToItemPage = (e) => {
    const item = e.detail.item;
    const variant = e.detail.layer;
    navigateToOutfitPackage(item, variant.variantId);
  };
</script>

<div id="content" class:mobile={$isMobileView}>
  <div class="banner">
    <h1 id="view-title">Welcome to Minerobe</h1>
    <p id="view-description">
      Minerobe is a collection of Minecraft skins and outfits. You can use them
      in your own Minecraft worlds or use them as a base for your own skins.
    </p>
  </div>
  {#if landingLoaded}
    <h2 class="list-title">Most Recent</h2>
    <OutfitPackageSnapshotList
      items={mostRecent}
      renderer={$defaultRenderer}
      dense={false}
      on:innerselect={goToItemPage}
    />
    <h2 class="list-title">Most Liked</h2>
    <OutfitPackageSnapshotList
      items={mostLiked}
      renderer={$defaultRenderer}
      dense={false}
      on:innerselect={goToItemPage}
    />
    <h2 class="list-title">Most Downloaded</h2>
    <OutfitPackageSnapshotList
      items={mostDownloaded}
      renderer={$defaultRenderer}
      dense={false}
      on:innerselect={goToItemPage}
    />
  {:else}
    <br />
    <Placeholder style="height:48px;margin-bottom:8px;" />
    <div class="placeholders">
      {#each Array(10) as _}
        <Placeholder style="min-width:175px;height:268px;" />
      {/each}
    </div>
    <br />
    <Placeholder style="height:48px;margin-bottom:8px;" />
    <div class="placeholders">
      {#each Array(10) as _}
        <Placeholder style="min-width:175px;height:268px;" />
      {/each}
    </div>
    <br />
    <Placeholder style="height:48px;margin-bottom:8px;" />
    <div class="placeholders">
      {#each Array(10) as _}
        <Placeholder style="min-width:175px;height:268px;" />
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  @import "style.scss";
</style>
