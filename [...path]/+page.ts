import { Router, routeStore } from '../router.js';
import { Sides } from '../enums.ts';
import type { Pattern, Route } from '../types.ts';

export let prerender = false;
export let entries = () => [];
export let ssr = true;
export let csr = true;
export let trailingSlash = 'never';
export let config = {};  // not sure


export async function load(params) {

    const pattern: Pattern = Router.get_pattern(params.url.pathname);
    const route: Route = await Router.get_route(pattern, params);
    routeStore.update((v) => ({...v, ...route}));

    for (const [k, v] of Object.entries(pattern?.options || {})) {
        eval(`${k} = ${v}`);
    }

    params.data = await Router.call_loads(params, pattern, route, Sides.UNIVERSAL);

    return params.data;
}