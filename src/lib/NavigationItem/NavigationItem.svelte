<script>
    import { page } from '$app/stores';  
    export let label = "";
    export let isSelected = false;
    export let viewId = "";
</script>

<a
    href={"/" + viewId}
    class:selected={$page.route.id=="/"+viewId}
>
    <span>{label}</span>
</a>

<style lang="scss">
   @import "NavigationItem.scss";
</style>
