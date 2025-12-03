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

### 4. `all.ts`

Optionally, re-export Routers' vars via your root's `all.ts`.  
At the very top of `all.ts` add:

```ts
// ROUTER
export * from '/router/';
export type * from '/router/';
```

### 5. `urls.ts`
   
Create `urls.ts` in the root folder (same level as `package.json`)

```ts
import type { Pattern, Layout, Error } from '/router/types';  // or from '/all.ts'

export const error: Error = () => import('/src/error.svelte');
const layout: Layout = { page: () => import('/src/base.svelte'), error };
const layouts: Layout[] = [layout];  // for nested layouts — [layout, sublayout, ...]

export const patterns: Pattern[] = [
    {re: '', page: () => import('/src/home.svelte'), layouts},
]
```

> Router expects `error` and `patterns` to be exported.

### 6. `error`, `layout` and first route in `pattern`

- Create `.svelte` pages for 'error', 'base layout' and 'home', call them as you want
- And specify paths to them in `error`, `layout` and first route in `patterns`.

II. Diving deep into `Layout` and `Pattern`
===========================================

There are 4 params, that are common for both 'layout' and 'pattern' declaration:
- `page`
- `error`
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
import { Sides } from '/router/';  // or from '/all.ts' in case you use root index.ts
```
```ts
{re: '', page: () => import('/src/home.svelte'), page: () => import('/src/home.js'), side: Sides.SERVER, layouts}
```

There are 'SERVER', 'CLIENT' and 'UNIVERSAL'.

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
    return { article }
}
```
Or using `routeStore`:
```ts
import { routeStore } from '/router/';
export async function load({ url, params, data, fetch, setHeaders, depends, parent, untrack, slugs }) {
    const response = await fetch(`/api/articles/${slugs.id}/`);
    const article = await response.json();
    return {article}
}
```

Advanced usage
==============

If you inspect `import type { Pattern } from '/router/types';` you'll see that there are much more options to pass to `Pattern`.

There are also:
```ts
layout?: string,      // E.g: 'CUSTOM', 'CUSTOM'
wrapper?: string,     // Can be used for css class for <main>
title?: string,       // Can be used for <title>
h1?: string,          // Can be used for <h1>
name?: string,        // 'id' of a route
extras?: string[],    // Any additions to use in layout
```

That's just variables, that could be defined in one place and used in base layout somehow.
They convert to properties of `routeStore`, and it's totally up to you how to use them, but here are an examples of a layout and page on steroids:

`urls.ts`:
```ts
import { Sides } from '/router/enums.ts';
import type { Pattern, Layout, Error } from '/router/types.ts';

// ENUMS
export enum Layouts {
    DEFAULT = 'DEFAULT',
    CUSTOM = 'CUSTOM',
    BLANK = 'BLANK',
}

export enum Wrappers {
    WIDE = 'WIDE',
    DEFAULT = 'DEFAULT',
    NARROW = 'NARROW',
}

export enum Extras {
    GO_TOP = 'GO_TOP',
}

// ERRORS
export const error: Error = () => import('/src/error.svelte');

// DEFAULTS
const layout: Layout = {page: () => import('/src/base.svelte'), error: error}
const layouts: Layout[] = [layout];

// SPECIFIC
const task_layout: Layout = {page: () => import('/src/tasks/task.svelte'), error: error}
const task_layouts: Layout[] = [layout, task_layout];

export const patterns: Pattern[] = [
    {
        re: '',
        page: () => import('/src/tasks/tasks.svelte'),
        layouts: layouts,
        layout: Layouts.DEFAULT,
        extras: [Extras.GO_TOP],
        wrapper: Wrappers.DEFAULT
    },
    {
        re: 'articles',
        page: () => import('/src/tasks/task_form.svelte'),
        layouts: layouts,      
        layout: Layouts.DEFAULT, 
        extras: [],              
        wrapper: Wrappers.DEFAULT,
        title: 'Articles', 
        h1: 'Recent Articles',
        name: 'ARTICLES',
    },
    {
        re: 'article/(<id>[0-9]+)',
        page: () => import('/src/tasks/results.svelte'),
        layouts: task_layouts,
        layout: Layouts.CUSTOM,
        extras: [Extras.GO_TOP],
        wrapper: Wrappers.WIDE
    },
]
```

`base.svelte`:
```html
<script>
    // ROUTER
    import { routeStore, Layouts, Wrappers, Extras, beforeNavigate } from '/all.ts';
    let title   = $derived($routeStore.title);
    let h1      = $derived($routeStore.h1);
    let path    = $derived($routeStore.url.pathname + $routeStore.url.search);
    let layout  = $derived($routeStore.layout);
    let wrapper = $derived($routeStore.wrapper);
    let name    = $derived($routeStore.name);
    let extras  = $derived($routeStore.extras);
    beforeNavigate(() => {
        $titleStore = null;
        $h1Store = null;
    });

    // CSRF
    import '/lib/csrf.ts';
    
    // CUSTOM
    import { Nprogress, GoTop } from '/all.ts';
    import Header from '/src/Header.svelte';

    let { children } = $props();
</script>

<svelte:head>
    <title>{title || 'My Project'}</title>
</svelte:head>

{#if layout !== Layouts.BLANK}
    <Header/>
{/if}

{#key path}
    {#if layout === Layouts.DEFAULT}
        <main
            class={`Wrapper`}
            class:_Wide={wrapper === Wrappers.WIDE}
            class:_Default={wrapper === Wrappers.DEFAULT}
            class:_Narrow={wrapper === Wrappers.NARROW}
            class:_Form={wrapper === Wrappers.FORM}
            data-name={name}
        >
            {#if h1}
                <div class="HEADING">
                    <h1 class="TITLE">{h1}</h1>
                </div>
            {/if}
            {@render children?.()}
        </main>
    {:else}
        {@render children?.()}
    {/if}
{/key}

<Nprogress/>

{#if extras?.length && extras.includes(Extras.GO_TOP)}
    <GoTop/>
{/if}
```
