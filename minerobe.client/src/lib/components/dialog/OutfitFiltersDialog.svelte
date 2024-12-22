<script lang="ts">
  import { COLORS_ARRAY } from "$src/data/consts/color";
  import { OUTFIT_TYPE_ARRAY } from "$src/data/consts/outfit";
  import { PACKAGE_TYPE } from "$src/data/enums/outfit";
  import { OutfitFilter } from "$src/data/models/filter";
  import { createEventDispatcher } from "svelte";
  import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import Select from "../base/Select/Select.svelte";
  import Sliders2Icon from "$icons/sliders-2.svg?raw";

  const dispatch = createEventDispatcher();

  export let open = false;
  export let filter: OutfitFilter = new OutfitFilter();
  export let hideType = false;
  export let hideColor = false;
  export let hideIsShared = false;
  export let hideOutfitType = false;

  const onFilter = () => {
    dispatch("filter", { filter: filter });
  };
</script>

<Dialog bind:open label="Filters">
  <div id="outfit-filters-dialog">
    {#if !hideType}
      <div>
        <SectionTitle label="Type" />
        <Select
          placeholder="Type"
          itemText="name"
          itemValue="value"
          clearable
          items={[
            { name: "Set", value: PACKAGE_TYPE.OUTFIT_SET },
            { name: "Outfit", value: PACKAGE_TYPE.OUTFIT },
          ]}
          bind:selectedItem={filter.type}
        />
      </div>
    {/if}
    {#if !hideColor}
      <div>
        <SectionTitle label="Color" />
        <Select
          placeholder="Color"
          multiple
          items={COLORS_ARRAY}
          itemText="normalizedName"
          itemValue="name"
          dropDownStyle="max-height: 275px"
          clearable
          bind:selectedItem={filter.colors}
        />
      </div>
    {/if}
    {#if !hideOutfitType}
      <div>
        <SectionTitle label="Outfit Type" />
        <Select
          placeholder="Outfit Type"
          items={OUTFIT_TYPE_ARRAY}
          itemText="normalizedName"
          itemValue="name"
          multiple
          clearable
          bind:selectedItem={filter.outfitType}
        />
      </div>
    {/if}
    {#if !hideIsShared}
      <div>
        <SectionTitle label="Is Shared" />
        <Select
          placeholder="Is Shared"
          itemText="name"
          itemValue="value"
          clearable
          items={[
            { name: "Shared", value: true },
            { name: "Not shared", value: false },
          ]}
          bind:selectedItem={filter.isShared}
        />
      </div>
    {/if}
    <div id="filter-btn">
      <Button label="Filter items" on:click={onFilter} icon={Sliders2Icon} />
    </div>
  </div>
</Dialog>

<style lang="scss">
  #outfit-filters-dialog {
    min-width: 33vw;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    #filter-btn {
      margin-top: 16px;
    }
  }
</style>
