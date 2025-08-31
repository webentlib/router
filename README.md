# Installation

### 1. `git clone https://github.com/webentlib/router.git`

To your root folder (same level as `package.json`) to get `router/` folder.

### 2. `svelte.config.js`:

Add `routes: 'router/'` to `config.kit.files`:

```ts
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

### 3. `vite.config.js`:
   
Ensure `allow: ['..']` in `vite.config.ts`, if not —  
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

### 4. `index.ts`

Optionally, re-export Routers' vars via your root's `index.ts`.
At the very top of `index.ts` add:

```ts
// ROUTER
export { routeStore, titleStore, h1Store, Sides } from '/router/';
export type { Pattern, Layout, Error } from '/router/';
```

### 5. `urls.ts`
   
Create `urls.ts` in the root folder (same level as `package.json`)

```ts
import type { Pattern, Error } from '/router/types';  // or from '/' in case you use root index.ts

const error: Error = () => import('/src/error.svelte');
const layout: Layout = { page: () => import('/src/base.svelte'), error };
const layouts: Layout[] = [layout];

export const patterns: Pattern[] = [
    {re: '', page: () => import('/src/home.svelte'), layouts},
]
```

Router expects only `patterns` to be exported.

### 6. `error`, `layout` and first route in `pattern`

Create `.svelte` pages for 'error', 'base layout' and 'home'; call them as you want, and specify paths to them in `error`, `layout` and first route in `patterns`.

# Diving deep into `Pattern`.

### 1. ... 

# Usage

```js
import { routeStore } from '/router/';

$routeStore
```

Check `/router/types.ts:Route` type to get more.
— Details will be added here later.  # TODO

# `load` function in `<script module>`

Yes, one can define `load` function just in `.svelte` page in `<script module>` like in good old Sapper.

```html
<script module>
    import {get} from 'svelte/store';
    import {routeStore, titleStore, h1Store} from '/router/';

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