<script>
    import { Router } from '../router.ts';
	import { page } from '$app/state';

    async function get_error() {
	    const default_error = await Router.get_default_error();

	    const pattern = Router.get_pattern(page.url.pathname);
	    let route_error;
	    if (pattern) {
	        route_error = await Router.get_error(pattern);
        }

	    const error =  route_error || default_error;

	    return error
    }
</script>

<svelte:head><title>{page.error.message}</title></svelte:head>

{#await get_error() then Error}
    {#if Error}
        <Error/>
    {:else}
        <div class="Error">
            <h1 class="ErrorStatus">{page.status}</h1>
            <div class="ErrorMessage">{page.error.message}</div>
        </div>
    {/if}
{/await}


<style>
    /*:global(body:has( > div > .Error)) {background:#fff;overflow-y:scroll;}*/
    .Error {position:fixed;left:0;top:0;right:0;bottom:0;padding-top:48px;text-align:center;}
        .ErrorStatus {font-size:48px;margin:0 0 24px;font-weight:bold;font-family:sans-serif;}
        .ErrorMessage {font-size:24px;font-family:sans-serif;}
</style>