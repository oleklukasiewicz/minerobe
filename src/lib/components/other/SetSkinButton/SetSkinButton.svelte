<script lang="ts">
  import { _ } from "svelte-i18n";
  import { SetCurrentSkin } from "$src/api/settings";
  import type { OutfitPackage } from "$src/data/common";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import Button from "$lib/components/base/Button/Button.svelte";

  export let item: OutfitPackage = null;
  export let texture = null;
  export let style = null;

  let skinIsSetting = false;
  const setSkin = async function () {
    skinIsSetting = true;
    await SetCurrentSkin(item.id, item.model, texture);
    skinIsSetting = false;
  };
</script>

<Button
  on:click={setSkin}
  disabled={item.layers.length == 0}
  icon={skinIsSetting ? LoaderIcon : HumanHandsUpIcon}
  label={skinIsSetting ? $_("skinIsSetting") : $_("setSkin")}
  size="large"
  textAlign="center"
></Button>
