<script>
    export let label = "";
    export let value = "";
    export let group = "";
    export let isDisabled = false;
</script>

<span
    class="toggle-button"
    title={label}
    class:selected={value == group}
    class:disabled={isDisabled}
    on:click={() => (group = value)}
>
    {label}
</span>

<style>
    .toggle-button {
        flex: 1;
        text-align: center;
    }
    .toggle-button {
        font-family: minecraft;
        text-decoration: none;
        color: var(--color-theme-font);
        box-sizing: border-box;
        padding: 14px 16px;
        display: inline-table;
        cursor: pointer;
        transition: background-color var(--time), border-color var(--time),
            color var(--time);
        user-select: none;
        border-top: 2px solid var(--color-theme-D1);
        background-color: var(--color-theme-D2);
        border-bottom: 2px solid var(--color-theme-D4);
    }
    .toggle-button:hover {
        border-top-color: var(--color-theme-D2);
        background-color: var(--color-theme-D3);
        border-bottom-color: var(--color-theme-D4);
    }
    .toggle-button:active {
        color: var(--color-theme);
        background-color: var(--color-hover);
        border-top-color: var(--color-hover-L1);
        border-bottom-color: var(--color-hover-D1);
    }
    .toggle-button.selected {
        border-top: 2px solid var(--color-accent-L1);
        background-color: var(--color-accent);
        border-bottom: 2px solid var(--color-accent-D1);
        color: var(--color-accent-font);
    }
    .toggle-button.selected:hover {
        color: var(--color-accent-font);
        background-color: var(--color-accent-D1);
        border-top-color: var(--color-accent);
        border-bottom-color: var(--color-accent-D2);
    }
    .toggle-button.selected:active {
        color: var(--color-theme);
        background-color: var(--color-hover);
        border-top-color: var(--color-hover-L1);
        border-bottom-color: var(--color-hover-D1);
    }
</style>
