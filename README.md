I. Installation
===============

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

```ts
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
const layouts: Layout[] = [layout];  // for nested layouts — [layout, sublayout, ...]

export const patterns: Pattern[] = [
    {re: '', page: () => import('/src/home.svelte'), layouts},
]
```

> Router expects only `patterns` to be exported.

### 6. `error`, `layout` and first route in `pattern`

- Create `.svelte` pages for 'error', 'base layout' and 'home', call them as you want
- And specify paths to them in `error`, `layout` and first route in `patterns`.

II. Diving deep into `Layout` and `Pattern`
===========================================

There are 4 params, that are common for both 'layout' and 'pattern' declaration:
- `page`
- `js`
- `side`
- `options`  
Let's talk about it.

So now we have only:
```ts
{re: '', page: () => import('/src/home.svelte'), layouts},
```

### 1. And, even now we can export `load` function in `home.svelte`s' `<script module>`, just like it was in the good old Sapper.

`home.svelte`:
```html
<script module>
    export async function load({ url, params, data, fetch, setHeaders, depends, parent, untrack }) {
        const response = await fetch(`/api/articles/`);
        const articles = await response.json();
        return {articles}
    }
</script>
```

### 2. Sure, we could also describe `load` function in separate file, and specify its' path like this:
```ts
{re: '', page: () => import('/src/home.svelte'), js: () => import('/src/home.js'), layouts},
```

### 3. To specify side to execute `load`, add `side` param to pattern:

```ts
import { Sides } from '/router/';  // or from '/' in case you use root index.ts
```
```ts
{re: '', page: () => import('/src/home.svelte'), page: () => import('/src/home.js'), side: Sides.SERVER, layouts}
```

There are 'SERVER', 'CLIENT' and 'UNIVERSAL'

It could be passed via enum:
```ts
export enum Sides {
    SERVER = 'SERVER',
    CLIENT = 'CLIENT',
    UNIVERSAL = 'UNIVERSAL',
}
```
Or just as string, like `side: 'UNIVERSAL'`.
Enum is recommended.

### 4. Also there are `options` param:

https://svelte.dev/docs/kit/page-options

III. Matching slugs
===================

1. Sure we want match complex urls and access slugs as params, for pages like:
```ts
{re: 'articles/(<id>[0-9]+)', page: () => import('/src/articles/article.svelte'), layouts},
```

Here we declare group `(<id>[0-9]+)`, where `id` is the named param, which is available in:
- `load` function as in incoming param `slugs` objects.
- `import { routeStore } from '/router/';` as `$routeStore.slugs`.

So `load` function using `slugs` could look like that:
```ts
export async function load({ url, params, data, fetch, setHeaders, depends, parent, untrack, slugs }) {
    const response = await fetch(`/api/articles/${slugs.id}/`);
    const article = await response.json();
    return {article}
}
```
Or using `routeStore`:
```ts
import {get} from 'svelte/store';
import { routeStore } from '/router/';
export async function load({ url, params, data, fetch, setHeaders, depends, parent, untrack, slugs }) {
    const response = await fetch(`/api/articles/${get(routeStore).slugs}/`);
    const article = await response.json();
    return {article}
}
```

Advanced usage
==============

TODO