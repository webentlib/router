<script>
    import {routeStore} from '../../router.ts';
    const {data} = $props();
</script>

{#snippet draw(routeStore, index)}
    {@const Layout = routeStore.layouts[index]}
    {@const Page = routeStore.page}
    {#if routeStore.layouts.length && index < routeStore.layouts.length}
        <Layout {data}>
            {@render draw(routeStore, index + 1)}
        </Layout>
    {:else}
        <Page {data}/>
    {/if}
{/snippet}

{@render draw($routeStore, 0)}
