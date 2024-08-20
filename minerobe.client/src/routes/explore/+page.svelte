<script lang="ts">
  import DownloadIcon from "$icons/download.svg?raw";
  import HeartIcon from "$icons/heart.svg?raw";
  import HomeIcon from "$icons/home.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import ClockIcon from "$icons/clock.svg?raw";
  import { onMount } from "svelte";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import Select from "$lib/components/base/Select/Select.svelte";
  import OutfitPresenter from "$lib/components/outfit/OutfitPresenter/OutfitPresenter.svelte";

  import { appState } from "$data/cache";
  import { GetStudioPackage } from "$src/api/wardrobe";
  import { APP_STATE } from "$src/data/consts";
  import { CAMERA_CONFIG_SIDE_IZO } from "$src/consts/render";
  let testpackage = null;
  let laoded = false;
  onMount(async () => {
    appState.subscribe(async (state) => {
      if (state != APP_STATE.READY) return;
      testpackage = await GetStudioPackage();
      laoded = true;
    });
  });
  const compare = (a, b) => {
    return a?.value == b;
  };
  let selected = "all";
  const onSelect = async (e) => {
    selected = e.detail.value;
  };
</script>

<div class="layout">
  <div>
    <Menu
      comparer={compare}
      value={selected}
      label="Explore"
      on:select={onSelect}
      open
      items={[
        { label: "All", icon: HomeIcon, value: "all" },
        { label: "Featured", icon: LoaderIcon, value: "featured" },
        { type: "separator" },
        { label: "Liked", icon: HeartIcon, value: "liked" },
        { label: "Downloaded", icon: DownloadIcon, value: "downloaded" },
        { label: "Last updated", icon: ClockIcon, value: "lastUpdated" },
        { label: "Collections", type: "header" },
      ]}
    ></Menu>
  </div>
  <div class="list">
    <Select
      let:item
      let:multiple
      selectedItem={"item2"}
      items={["item1", "item2", "item3"]}
    ></Select>
    {#if laoded}
      <OutfitPresenter item={testpackage}/>
    {/if}
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
