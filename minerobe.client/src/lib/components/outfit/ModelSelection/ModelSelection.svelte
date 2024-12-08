<script lang="ts">
  import RatioGroup from "$lib/components/base/RatioGroup/RatioGroup.svelte";
  import { MODEL_TYPE } from "$src/data/enums/model";
  import { _ } from "svelte-i18n";

  export let disabled: boolean = false;
  export let group: any;
</script>

<div class="item-model" class:disabled>
  <RatioGroup
    bind:value={group}
    values={[
      {
        value: MODEL_TYPE.ALEX,
        label: $_("modelOpt.alex"),
      },
      {
        value: MODEL_TYPE.STEVE,
        label: $_("modelOpt.steve"),
      },
    ]}
    size="large"
  />
</div>

<style lang="scss">
  .item-model {
    display: flex;
    flex-direction: row;
  }
</style>
