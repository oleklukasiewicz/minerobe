<script lang="ts">
  import Button from "$lib/components/base/Button/Button.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  import { CAMERA_CONFIG } from "$src/data/consts/render";
  import type { OutfitLayer } from "$src/model/package";

  import UpIcon from "$src/icons/chevron-up.svg?raw";
  import DownIcon from "$src/icons/chevron-down.svg?raw";
  import DeleteIcon from "$src/icons/close.svg?raw";
  import EditIcon from "$src/icons/edit.svg?raw";
  import ExternalLinkIcon from "$src/icons/external-link.svg?raw";

  export let item: OutfitLayer;
  export let model: "alex" | "steve";
  export let outfitType: string;
  export let readonly = false;
  export let movable = true;
  export let canUp = true;
  export let canDown = true;
  export let editable = true;
  export let removable = false;
  export let link = null;
  export let selected = false;
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<a class="outfit-layer-list-item" class:selected class:readonly on:click>
  <div class="render">
    <OutfitPackageRender
      source={item[model].content}
      {model}
      {outfitType}
      cameraOptions={CAMERA_CONFIG.getForOutfit(outfitType)}
    />
  </div>
  <div class="data">
    <span class="name">{item.name}</span>
    <Label variant="common">{item.outfitType}</Label>
  </div>

  <div class="actions">
    {#if !readonly}
      {#if movable}
        <Button
          onlyIcon
          icon={UpIcon}
          size="large"
          type="quaternary"
          disabled={!canUp}
          whiteText={selected}
        />
        <Button
          onlyIcon
          icon={DownIcon}
          size="large"
          type="quaternary"
          disabled={!canDown}
          whiteText={selected}
        />
      {/if}
      {#if movable && (editable || removable || link)}
        <div class="separator vertical"></div>
      {/if}
      {#if editable}
        <Button
          onlyIcon
          icon={EditIcon}
          whiteText={selected}
          size="large"
          type="quaternary"
        />
      {/if}
      {#if editable && (removable || link)}
        <div class="separator vertical"></div>
      {/if}
      {#if removable}
        <Button
          onlyIcon
          icon={DeleteIcon}
          whiteText={selected}
          size="large"
          type="quaternary"
        />
      {/if}
      {#if removable && link}
        <div class="separator vertical"></div>
      {/if}
    {/if}
    {#if link}
      <Button
        onlyIcon
        whiteText={selected}
        icon={ExternalLinkIcon}
        size="large"
        type="tertiary"
        href={link}
      />
    {/if}
  </div>
</a>

<style lang="scss">
  @use "OutfitlayerListItem.scss";
</style>
