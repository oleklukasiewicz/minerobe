<script lang="ts">
  import DownloadIcon from "$icons/download.svg?raw";
  import HeartIcon from "$icons/heart.svg?raw";
  import HomeIcon from "$icons/home.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import ClockIcon from "$icons/clock.svg?raw";
  import { onMount } from "svelte";
  import Menu from "$lib/components/base/Menu/Menu.svelte";
  import Select from "$lib/components/base/Select/Select.svelte";

  onMount(() => {});
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
  </div>
</div>

<style lang="scss">
  @import "style.scss";
</style>
