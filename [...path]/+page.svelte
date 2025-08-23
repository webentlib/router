<script>
    import {routeStore} from '../router.ts';
    export let data;
</script>

{#snippet draw(routeStore, index)}
    {#if routeStore.layouts.length && index < routeStore.layouts.length}
        <svelte:component this={routeStore.layouts[index]} {data}>
            {@render draw(routeStore, index + 1)}
        </svelte:component>
    {:else}
        <svelte:component this={routeStore.page} {data}/>
    {/if}
{/snippet}

{@render draw($routeStore, 0)}
