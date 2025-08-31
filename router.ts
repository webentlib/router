import { writable, get } from 'svelte/store';
import type { Writable } from 'svelte/store';
import { error as svelteError } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { patterns, error } from '/urls.ts';
import { Sides } from './enums.ts';
import type { Route } from './types.ts';

export const routeStore: Writable<Route> = writable();
export const titleStore = writable();
export const h1Store = writable();

export const Router: any = {}

Router.get_re = function(pattern_re) {
    pattern_re = pattern_re.replace(/<\w+>/g, '')
    const pattern_enriched = '^\/' + pattern_re + '\/?$';
    const re = new RegExp(pattern_enriched);
    return re;
}

Router.get_pattern = function(pathname) {
    for (const pattern of patterns) {
        const re = Router.get_re(pattern.re);
        if (re.test(pathname)) {
            return pattern;
        }
    }
}

Router.check_404 = function(pattern) {
    if (!pattern) {
        throw svelteError(404, 'Not found')
    }
}

Router.get_route = async function(pattern, params) {
    const route: Route | any = {}
    route.re = Router.get_re(pattern.re);
    route.url = params.url;
    route.slugs = Router.get_slugs(pattern, params.url);
    route.pattern = pattern;

    route.page = (await pattern.page()).default;
    route.error = await Router.get_error(pattern)
    route.layouts = await Router.get_layouts(params, pattern)

    route.js = pattern.js;
    route.side = pattern.side;
    route.options = pattern.options;

    route.wrapper = pattern.wrapper;
    route.layout = pattern.layout;
    route.title = pattern.title;
    route.h1 = pattern.h1;
    route.name = pattern.name;
    route.extras = pattern.extras;
    return route;
}

Router.call_loads = async function(params, current_pattern, route, current_side) {
    for (const pattern of [...(current_pattern.layouts || []), current_pattern]) {
        let execute;
        if (!pattern.side) {
            pattern.side = Sides.UNIVERSAL;
        }
        if (current_side === Sides.SERVER && pattern.side === Sides.SERVER) {
            execute = true;
        } else if (current_side === Sides.UNIVERSAL && pattern.side === Sides.CLIENT && browser) {
            execute = true;
        } else if (current_side === Sides.UNIVERSAL && pattern.side === Sides.UNIVERSAL) {
            execute = true;
        }
        if (!execute) {
            continue;
        }

        const module = pattern.js ? await pattern.js() : await pattern.page();
        const load = module.load;

        if (load) {
            params.data = {...params.data, ...await load({...params, slugs: route.slugs || []})};
        }
    }
    return params.data;
}

Router.get_layouts = async function(params, pattern) {
    const layouts = [];
    for (const layout of pattern.layouts || []) {
        layouts.push((await layout.page()).default);
    }
    return layouts;
}

Router.get_slugs = function(pattern, url) {
    const result = {}
    const slugs = pattern.re.match(/<\w+>/g)?.map(slug => slug.replace('<', '').replace('>', '')) || [];
    const re = Router.get_re(pattern.re);
    const matches = re.exec(url.pathname);
    for (const [index, match] of Object.entries(matches)) {
        const int_index = parseInt(index);
        if (int_index && int_index > 0) {
            result[slugs[index - 1]] = match
        }
    }
    return result;
}

Router.get_error = async function(pattern) {
    let error_to_return;
    if (!pattern) {
        error_to_return = error
    }
    for (const page of [...(pattern?.layouts || []), pattern].reverse()) {
        if (!page?.error) continue;
        error_to_return = page.error
        break
    }
    return (await error_to_return()).default;
}
