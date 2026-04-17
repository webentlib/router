<script>
    import { untrack } from 'svelte';
    import { routeStore } from '../../router.ts';
    import { page as pageStore } from '$app/stores';

    const { data } = $props();

    $effect(() => {
        const pageStoreUrl = $pageStore.url;
        untrack(() => {
            if ($routeStore.url.href != pageStoreUrl.href) {
                $routeStore.url = pageStoreUrl;
            }
        });
    });
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
