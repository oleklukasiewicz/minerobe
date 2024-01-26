<script lang="ts">
  import {
    BuildCollectionQuery,
    FetchDocsFromQuery,
    QueryWhere,
  } from "$src/data/firebase";
  import { onMount } from "svelte";
  import OutfitPackageSnapshotList from "$component/outfit/OutfitPackageSnapshotList/OutfitPackageSnapshotList.svelte";
  import Placeholder from "$component/base/Placeholder/Placeholder.svelte";
  import { OutfitPackageLink } from "$src/data/common";
  import { OUTFIT_TYPE } from "$src/data/consts";
  import { FetchOutfitSetSnapshotFromLink } from "$src/api/sets";
  import { FetchOutfitSnapshotFromLink } from "$src/api/outfits";

  export let data: any;

  let items = [];
  let laoded = false;
  onMount(async () => {
    const query = await BuildCollectionQuery("query", [
      new QueryWhere("publisherId", "==", data.id),
      new QueryWhere("variantId", "==", "none"),
      new QueryWhere("isShared", "==", true),
    ]);
    const itemsQuery = await FetchDocsFromQuery([query]);
    const itemsLinks =
      itemsQuery[0].map(
        (d: any) => new OutfitPackageLink(d.id, d.model, d.type)
      ) || [];
    for (let i = 0; i < itemsLinks.length; i++) {
      const item = itemsLinks[i];
      if (item.type == OUTFIT_TYPE.OUTFIT_SET) {
        items.push(await FetchOutfitSetSnapshotFromLink(item));
      } else {
        items.push(await FetchOutfitSnapshotFromLink(item));
      }
    }
      laoded = true;
  });
</script>
<div class="items">
{#if !laoded}
  <Placeholder />
{:else}
  <OutfitPackageSnapshotList {items} dense={false}/>
{/if}
</div>
<style lang="scss">
    @import "style.scss";
</style>
