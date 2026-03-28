<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //models
  import type { OutfitLayer } from "$data/models/package";
  import type { MODEL_TYPE } from "$src/data/enums/model";
  import type { OUTFIT_TYPE } from "$src/data/enums/outfit";
  //components
  import Button from "$lib/components/base/Button/Button.svelte";
  import Label from "$lib/components/base/Label/Label.svelte";
  import OutfitPackageRender from "$lib/components/render/OutfitPackageRender.svelte";
  //icons
  import UpIcon from "$src/icons/chevron-up.svg?raw";
  import DownIcon from "$src/icons/chevron-down.svg?raw";
  import DeleteIcon from "$src/icons/close.svg?raw";
  import EditIcon from "$src/icons/edit.svg?raw";
  import ExternalLinkIcon from "$src/icons/external-link.svg?raw";
  import LoaderIcon from "$icons/loader.svg?raw";

  const dispatch = createEventDispatcher();

  interface Props {
    item: OutfitLayer;
    outfitType?: OUTFIT_TYPE;
    model: MODEL_TYPE;
    readonly?: boolean;
    movable?: boolean;
    canUp?: boolean;
    canDown?: boolean;
    editable?: boolean;
    removable?: boolean;
    link?: any;
    selected?: boolean;
    packageId?: string;
    isPrimary?: boolean;
    dense?: boolean;
    labels?: boolean;
  }

  let {
    item,
    outfitType = null,
    model,
    readonly = false,
    movable = true,
    canUp = true,
    canDown = true,
    editable = true,
    removable = false,
    link = null,
    selected = false,
    packageId = null,
    isPrimary = false,
    dense = false,
    labels = true
  }: Props = $props();

  const onMoveUp= function (e) {
    e.stopPropagation();
    dispatch("moveUp", { item: item });
  };
  const onMoveDown= function (e) {
    e.stopPropagation();
    dispatch("moveDown", { item: item });
  };
  const onEdit= function (e) {
    e.stopPropagation();
    dispatch("edit", { item: item });
  };
  const onDelete= function (e) {
    e.stopPropagation();
    dispatch("delete", { item: item });
  };
  const onSelect= function (e) {
    e.stopPropagation();
    dispatch("select", { item: item });
  };
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<a
  class="outfit-layer-list-item"
  class:selected
  class:readonly
  class:dense
  title={item.name}
  onclick={onSelect}
>
  <div class="render">
    {#if isPrimary}
      <span class="primary-layer-icon">{@html LoaderIcon}</span>
    {/if}
    <OutfitPackageRender
      source={item[model].content}
      {model}
      outfitType={outfitType || item.outfitType}
    />
  </div>
  {#if !dense}
    <div class="data">
      <span class="name">{item.name}</span>
      {#if labels}
        <Label variant="common">{item.outfitType}</Label>
        {#if item.sourcePackageId == packageId}
          <Label variant={"rare"}>Image</Label>
        {/if}
      {/if}
    </div>

    <div class="actions">
      {#if !readonly}
        {#if editable}
          <Button
            onlyIcon
            icon={EditIcon}
            whiteText={selected}
            size="large"
            type="quaternary"
            label="Edit"
            onclick={onEdit}
          />
        {/if}
        {#if editable && (movable || removable || link)}
          <div class="separator vertical"></div>
        {/if}
        {#if movable}
          <Button
            onlyIcon
            icon={UpIcon}
            label="Move up"
            size="large"
            type="quaternary"
            disabled={!canUp}
            whiteText={selected}
            onclick={onMoveUp}
          />
          <Button
            onlyIcon
            label="Move down"
            icon={DownIcon}
            size="large"
            type="quaternary"
            disabled={!canDown}
            whiteText={selected}
            onclick={onMoveDown}
          />
        {/if}
        {#if movable && (removable || link)}
          <div class="separator vertical"></div>
        {/if}
        {#if removable}
          <Button
            onlyIcon
            icon={DeleteIcon}
            whiteText={selected}
            size="large"
            label="Delete"
            type="quaternary"
            onclick={onDelete}
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
          label="Open"
          type="tertiary"
          target="_blank"
          href={link}
        />
      {/if}
    </div>
  {/if}
</a>

<style lang="scss">
  @use "OutfitLayerListItem.scss";
</style>
