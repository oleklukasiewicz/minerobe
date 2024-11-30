<script lang="ts">
  //main imports
  import { createEventDispatcher } from "svelte";
  //model
  import type { OutfitLayer } from "$src/model/package";
  import type { MODEL_TYPE } from "$src/data/consts/model";
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

  const dispatch = createEventDispatcher();

  export let item: OutfitLayer;
  export let model: MODEL_TYPE;
  export let readonly = false;
  export let movable = true;
  export let canUp = true;
  export let canDown = true;
  export let editable = true;
  export let removable = false;
  export let link = null;
  export let selected = false;

  const onMoveUp = function () {
    dispatch("moveUp", { item: item });
  };
  const onMoveDown = function () {
    dispatch("moveDown", { item: item });
  };
  const onEdit = function () {
    dispatch("edit", { item: item });
  };
  const onDelete = function () {
    dispatch("delete", { item: item });
  };
</script>

<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-missing-attribute -->
<a class="outfit-layer-list-item" class:selected class:readonly on:click>
  <div class="render">
    <OutfitPackageRender
      source={item[model].content}
      {model}
      outfitType={item.outfitType}
    />
  </div>
  <div class="data">
    <span class="name">{item.name}</span>
    <Label variant="common">{item.outfitType}</Label>
    {#if item.type == "local"}
      <Label variant={"rare"}>Image</Label>
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
          on:click={onEdit}
        />
      {/if}
      {#if editable && (movable || removable || link)}
        <div class="separator vertical"></div>
      {/if}
      {#if movable}
        <Button
          onlyIcon
          icon={UpIcon}
          size="large"
          type="quaternary"
          disabled={!canUp}
          whiteText={selected}
          on:click={onMoveUp}
        />
        <Button
          onlyIcon
          icon={DownIcon}
          size="large"
          type="quaternary"
          disabled={!canDown}
          whiteText={selected}
          on:click={onMoveDown}
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
          type="quaternary"
          on:click={onDelete}
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
