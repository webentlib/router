<script>
    import { Router, routeStore } from '../router.ts';
	import { page } from '$app/state';

	let Error = $state($routeStore?.error);
	$effect(async() => {
	    let pattern = Router.get_pattern(page.url.pathname);
        Error = await Router.get_error(pattern);
    });

	// m.b. better derived.by(() => { let Error = $state(); return Error;})
</script>

{#if Error}
    <Error/>
{/if}
