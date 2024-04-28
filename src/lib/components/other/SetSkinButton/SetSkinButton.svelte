<script lang="ts">
  import { _ } from "svelte-i18n";

  import type { OutfitPackage } from "$src/data/common";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";
  import Button from "$lib/components/base/Button/Button.svelte";
  import { createEventDispatcher } from "svelte";
  import { showToast } from "$src/data/cache";
  import { SetCurrentSkin } from "$src/helpers/other/minecraftServicesHelper";

  const dispatch = createEventDispatcher();

  export let item: OutfitPackage = null;
  export let texture = null;
  export let style = null;

  let skinIsSetting = false;
  const setSkin = async function () {
    skinIsSetting = true;
    const isSetted = await SetCurrentSkin(item.id, item.model, texture);
    skinIsSetting = false;
    if (isSetted) showToast("Skin changed", HumanHandsUpIcon);
    else showToast("Failed to change skin", undefined, "error");

    dispatch("setSkin", { isSuccessful: isSetted });
  };
</script>

<Button
  on:click={setSkin}
  {style}
  disabled={item.layers.length == 0}
  icon={skinIsSetting ? LoaderIcon : HumanHandsUpIcon}
  label={skinIsSetting ? $_("skinIsSetting") : $_("setSkin")}
  size="large"
  textAlign="center"
></Button>
