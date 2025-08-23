# Installation

1. Pull this repo to the root folder (same lvl as `package.json`) folder to get `router/` folder.
2. `svelte.config.js`:

Add `routes: 'router/'` to `config.kit.files`:

```js
const config = {
    ...
    kit: {
        files: {
            ...
            routes: 'router/',
            ...
    },
    ...
}
```

Or paste this between `const config = {...}` declaration and `export default config;`:

```js
// Router
config.kit.files.routes = 'router/'
```

3. Ensure `allow: ['..']` in `vite.config.ts`
   
Add `allow: ['..']` to `server.fs`:

```js
export default defineConfig({
	...
    server: {
        fs: {
            allow: ['..'],  // Allow serving files from one level up to the project root
        },
    },
}
```

Or define 'config' like this:

```js
const config = defineConfig({
	...
    server: {
        fs: {
            allow: [],
        },
    },
}

// Allow seeking root
config.server.fs.allow.push('..');

export default config;
```

4. Create `urls.ts` in foot folder (same lvl as `package.json`)

```js
import { Sides } from '/router/enums.ts';
import type { Pattern, Error } from '/router/types.ts';

const error: Error = () => import('/src/error.svelte');
const layout: Layout = {page: () => import('/src/base.svelte'), error: error};
const layouts = [layout];

const patterns: Pattern[] = [
    {re: '',                      page: () => import('/src/home.svelte'), layouts},
    {re: 'articles',              page: () => import('/src/articles/articles.svelte'), layouts},
    {re: 'articles/(<id>[0-9]+)', page: () => import('/src/articles/article.svelte'), layouts},
]

export { patterns, error}
```

Check `/router/types.ts:Pattern` type to get more.
— Details will be added here later.  # TODO

# Usage

```js
import { routeStore } from '/router/router.ts';

$routeStore
```

Check `/router/types.ts:Route` type to get more.
— Details will be added here later.  # TODO

# `load` function in `<script module>`

Yes, one can define `load` function just in `.svelte` page in `<script module>` like in good old Sapper.

```html
<script module>
    import {get, routeStore} from '/all.js';

    export async function load({ url, params, data, fetch, setHeaders, depends, parent, untrack}) {
        const article_id = get(routeStore).slugs.id;
        const response = await fetch(`/api/articles/${article_id}/`);
        const article = await response.json();
        return {article}
    }
</script>

<script>
    const { data } = $props();
    
    let articles = $derived.by(() => {
        let articles = $state(data.articles);
        return articles;
    }) 
</script>

{#each article in articles}
    <div>
        <h1>{article.title}</h1>
        <div>{article.text}</div>
    </div>
{/each}
```