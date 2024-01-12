<script lang="ts">
  import { _ } from "svelte-i18n";
  import { SetCurrentSkin } from "$src/api/settings";
  import type { OutfitPackage } from "$src/data/common";
  import HumanHandsUpIcon from "$icons/human-handsup.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";

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

<button on:click={setSkin} class:disabled={item.layers.length == 0} {style} class="set-skin-btn">
  {#if skinIsSetting}
    {@html LoaderIcon}{$_("skinIsSetting")}
  {:else}
    {@html HumanHandsUpIcon}{$_("setSkin")}
  {/if}
</button>
<style lang="scss">
.set-skin-btn
{
  font-size: larger;
}
</style>