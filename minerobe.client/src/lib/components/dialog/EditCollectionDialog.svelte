<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { OutfitPackageCollection } from "$src/data/models/collection";
    import Button from "../base/Button/Button.svelte";
  import Dialog from "../base/Dialog/Dialog.svelte";
  import SectionTitle from "../base/SectionTitle/SectionTitle.svelte";
  import TextBox from "../base/TextBox/TextBox.svelte";
  import Checkbox from "../base/Checkbox/Checkbox.svelte";

  interface Props {
    open?: boolean;
    label?: string;
    collection?: OutfitPackageCollection;
    onsave?: (event?: any) => void;
  }

  let { open = $bindable(false), label = "Edit Collection", collection = $bindable(null) ,
    onsave = null
  }: Props = $props();

  let name = $state("");
  let description = $state("");
  let isShared = $state(false);

  const syncFormFromCollection = () => {
    name = collection?.name ?? "";
    description = collection?.description ?? "";
    isShared = collection?.social?.isShared ?? false;
  };

  run(() => {
    syncFormFromCollection();
  });

  const handleSave = () => {
    const nextCollection = {
      ...collection,
      name,
      description,
      social: {
        ...(collection?.social ?? {}),
        isShared,
      },
    } as OutfitPackageCollection;

    collection = nextCollection;
    onsave?.({ detail: { collection: nextCollection } });
    open = false;
  };
</script>

<Dialog bind:open {label}>
  <div id="edit-collection-dialog">
    <div>
      <SectionTitle label="name" />
      <TextBox placeholder="Collection Name" bind:value={name} />
    </div>
    <div>
      <SectionTitle label="description" />
      <textarea placeholder="Description" bind:value={description}
      ></textarea>
    </div>
    <Checkbox label="Is Shared" bind:value={isShared} />
    <div id="actions">
      <Button label="Save" onclick={handleSave} />
    </div>
  </div>
</Dialog>

<style lang="scss">
  #edit-collection-dialog {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 30vw;
    max-width: 400px;
    div {
      display: flex;
      flex-direction: column;
    }
    #actions {
      display: block;
      margin-top: 8px;
    }
  }
</style>
