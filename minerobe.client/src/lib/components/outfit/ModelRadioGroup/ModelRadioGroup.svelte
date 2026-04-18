<script lang="ts">
  //consts
  import { MODEL_TYPE } from "$src/data/enums/model";

  //models
  import { ValueData } from "$data/models/base";

  //components
  import RadioGroup from "$lib/components/base/RadioGroup/RadioGroup.svelte";

  interface ModelRadioGroupProps {
    selectedValue?: string;
  }

  let { selectedValue = $bindable("") }: ModelRadioGroupProps = $props();
</script>

<RadioGroup
  bind:selectedValue
  options={[
    new ValueData(MODEL_TYPE.STEVE, "Classic"),
    new ValueData(MODEL_TYPE.ALEX, "Slim"),
  ]}
/>
