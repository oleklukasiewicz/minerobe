<script lang="ts">
  //services
  import { ConvertFileToFileData, ImportImages } from "$src/data/import";

  //consts
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/outfit";
  import { COLORS_ARRAY } from "$src/data/consts/color";
  import { MODEL_TYPE } from "$src/data/enums/model";

  //models
  import type { OutfitLayer } from "$data/models/package";

  //icons
  import ImportPackageIcon from "$icons/upload.svg?raw";

  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import Select from "../base/Select/Select.svelte";
  import TextBox from "../base/TextBox/TextBox.svelte";
  import DragAndDrop from "../draganddrop/DragAndDrop/DragAndDrop.svelte";
  import OutfitPackageRender from "../render/OutfitPackageRender.svelte";
  import ColorSelect from "../other/ColorSelect/ColorSelect.svelte";
  //icons
  import Checkbox from "../base/Checkbox/Checkbox.svelte";
  import type { BaseDialogProps } from "$src/data/components";

  interface EditLayerDialogProps extends BaseDialogProps {
    item: OutfitLayer;
    onlyTextures?: boolean;
    onedit?: (event?: any) => void;
    onprimaryChange?: (event?: any) => void;
  }

  let {
    open = $bindable(false),
    item = $bindable(),
    onlyTextures = false,
    onedit = null,
    onprimaryChange = null,
    label = "Edit layer",
  }: EditLayerDialogProps = $props();

  const onEdit = () => {
    onedit?.({ item: item });
  };
  const onPrimaryChange = (e) => {
    const value = e.value;
    onprimaryChange?.({ item: item, isPrimary: value });
  };

  const onDrop = async function (e, model) {
    const droppped = e.items[0];
    item[model] = await ConvertFileToFileData(droppped);
    onEdit();
  };
  const onUpload = async function (e, model) {
    const layers = await ImportImages();
    item[model] = layers[0][model];
    onEdit();
  };
</script>

<Dialog bind:open {label}>
  {#snippet children({ isMobile })}
    <div class="editItemDialog" class:mobile={isMobile}>
      {#if !onlyTextures}
        <SectionTitle label="Name" />
        <TextBox bind:value={item.name} oninput={onEdit} />
        <SectionTitle label="Outfit type" />
        <Select
          items={OUTFIT_TYPE_ARRAY}
          bind:value={item.outfitType}
          itemText="normalizedName"
          itemValue="name"
          onselect={onEdit}
        />
        <SectionTitle label="color" />
        <ColorSelect
          items={COLORS_ARRAY}
          bind:value={item.colorName}
          itemText="normalizedName"
          itemValue="name"
          dropDownStyle="max-height: 275px"
          onselect={onEdit}
        />
        <br />
        <Checkbox
          label="Is primary layer"
          bind:value={item.isPrimary}
          onchange={onPrimaryChange}
        />
      {/if}
      <div class="textures">
        <div class="model-selection">
          <SectionTitle label="Classic" />
          <div class="render">
            <DragAndDrop ondrop={(e) => onDrop(e, MODEL_TYPE.STEVE)}>
              <OutfitPackageRender
                resizable
                source={item.steve.content}
                outfitType={item.outfitType}
                model={MODEL_TYPE.STEVE}
              />
            </DragAndDrop>
          </div>
          <div>
            <Button
              icon={ImportPackageIcon}
              label="Upload image"
              onclick={(e) => onUpload(e, MODEL_TYPE.STEVE)}
            />
          </div>
        </div>
        <div class="model-selection">
          <SectionTitle label="Slim" />
          <div class="render">
            <DragAndDrop ondrop={(e) => onDrop(e, MODEL_TYPE.ALEX)}>
              <OutfitPackageRender
                resizable
                source={item.alex.content}
                outfitType={item.outfitType}
                model={MODEL_TYPE.ALEX}
              />
            </DragAndDrop>
          </div>
          <div>
            <Button
              icon={ImportPackageIcon}
              label="Upload image"
              onclick={(e) => onUpload(e, MODEL_TYPE.ALEX)}
            />
          </div>
        </div>
      </div>
    </div>
  {/snippet}
</Dialog>

<style lang="scss">
  .editItemDialog {
    width: calc(75vh - 120px);
    max-width: 100%;
    &.mobile {
      width: 100%;
    }
    .textures {
      margin-top: 8px;
      display: flex;
      flex-direction: row;
      gap: 8px;
      .model-selection {
        flex-direction: column;
        flex: 1;
        display: flex;
        text-align: center;
        .render {
          padding: 4px;
          box-sizing: border-box;
          display: flex;
          aspect-ratio: 1;
          overflow: hidden;
          background-color: var(--color-theme-D1);
          margin-bottom: 8px;
        }
      }
    }
  }
</style>
