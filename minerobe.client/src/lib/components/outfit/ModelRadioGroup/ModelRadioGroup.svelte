<script lang="ts">
  import RadioGroup from "$lib/components/base/RadioGroup/RadioGroup.svelte";
  import { MODEL_TYPE } from "$src/data/consts/model";
  import { ValueData } from "$src/model/base";

  export let selectedValue = "";
</script>

<RadioGroup
  bind:selectedValue
  options={[
    new ValueData(MODEL_TYPE.STEVE, "Classic"),
    new ValueData(MODEL_TYPE.ALEX, "Slim"),
  ]}
/>
