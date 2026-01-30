<script>
    import { onMount } from 'svelte';
    import {routeStore} from '../../router.ts';
    import { page } from '$app/state';
    const {data} = $props();

    onMount(() => {
        const handlePopState = (event) => {
            let url = $routeStore.url = new URLSearchParams(location.search);
            url.searchParams = new URLSearchParams(location.search);
            routeStore.update((v) => ({...v, ...{ url }}));
        };

        window.addEventListener('popstate', handlePopState);
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
