<script lang="ts">
  //consts
  import { MODEL_TYPE } from "$src/data/consts/model";
  //models
  import { ValueData } from "$src/model/base";
  //components
  import RadioGroup from "$lib/components/base/RadioGroup/RadioGroup.svelte";

  export let selectedValue = "";
</script>

<RadioGroup
  bind:selectedValue
  options={[
    new ValueData(MODEL_TYPE.STEVE, "Classic"),
    new ValueData(MODEL_TYPE.ALEX, "Slim"),
  ]}
/>
