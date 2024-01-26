<script lang="ts">
  import RatioButton from "$component/base/RatioButton/RatioButton.svelte";
  import { MODEL_TYPE } from "$src/data/consts";
  import { _ } from "svelte-i18n";

  export let disabled:boolean=false;
  export let group:any;
</script>

<div class="item-model">
  <RatioButton
    label={$_("modelOpt.steve")}
    value={MODEL_TYPE.STEVE}
    {disabled}
    bind:group={group}
  />
  <RatioButton
    label={$_("modelOpt.alex")}
    value={MODEL_TYPE.ALEX}
   {disabled}
    bind:group={group}
  />
</div>
<style lang="scss">
  .item-model {
    display: flex;
    flex-direction: row;
  }
</style>
