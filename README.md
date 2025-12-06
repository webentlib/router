# Installation

### 1. `git clone https://github.com/webentlib/router.git`

### 2. `svelte.config.js`:

Add `routes: 'router/'` to `config.kit.files`:

```ts
const config = {
    ...
    kit: {
        files: {
            ...
            routes: 'router/', 
            errorTemplate: 'router/error.html',  // optional
            ...
    },
    ...
}
```

### 3. `vite.config.js`:
   
Ensure `allow: ['..']` in `vite.config.ts`

```ts
export default defineConfig({
	...
    server: {
        fs: {
            allow: ['..'],  // allow serving files from one level up to the project root
        },
    },
}
```

# Usage

### 1. `urls.ts`
   
Create `urls.ts` in the root folder (same level as `package.json`)

Its' contents could be just:

```js
export const patterns = [
    {re: '', page: () => import('/src/home.svelte')},
]
```

But let 's make it more robust:

```ts
import type { Pattern, Layout, Error } from '/router/types';

export const error: Error = () => import('/src/error.svelte');  // for all layouts, pages and 404
const layout: Layout = { page: () => import('/src/base.svelte')};
const layouts: Layout[] = [layout];

export const patterns: Pattern[] = [
    {re: '', page: () => import('/src/home.svelte'), layouts},
]
```

Each layout or page can export `load` function in `<script module>`, just like it was in the good old Sapper.

`home.svelte`:
```html
<script module>
    export async function load({ url, params, data, fetch, setHeaders, depends, parent, untrack, slugs }) {
        const response = await fetch(`/api/users/${slugs.id}/`);
        const user = await response.json();
        return {user}
    }
</script>
```

One can just explore `router/types.ts`, but here is full example of `urls.ts`:

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

// DEFAULTS
export const error: Error = () => import('/src/error.svelte');
const layout: Layout = {page: () => import('/src/base.svelte')}
const layouts: Layout[] = [layout];

// SPECIFIC
const user_layout: Layout = {page: () => import('/src/tasks/task.svelte')}
const user_layouts: Layout[] = [layout, ...layouts];

export const patterns: Pattern[] = [
    {
        re: 'user/(<id>[0-9]+)',
        page: () => import('/src/users/user.svelte'),
        layouts: user_layout,
        
        // In case load function needs to be described in separate file: 
        // js: () => import('/path-to-separate-js-file-with-load-function.js'),
        
        // In case load function needs to be executed only on server:
        // (other options are: SERVER | BROWSER | UNIVERSAL)
        // side: Sides.SERVER,
        
        // Custom erro just for that page:
        // error: () => import('/path-to-custom-error.svelte') 
        
        // Options
        // (https://svelte.dev/docs/kit/page-options)
        // options: {...},
        
        // Some optional stuff, that'll be just passed to a routeStore,
        // that can be used in layout or page later (see base.html example).
        title: 'My page title',
        h1: 'My page h1',
        name: 'MY_PAGE_STRING_ID',
        layout: Layouts.CUSTOM,
        wrapper: Wrappers.WIDE,
        extras: [Extras.GO_TOP],
    },
]
```

### 2. `base.svelte`

```html
<script>
    import { routeStore } from '/router/';
    import { Layouts, Extras } from '/urls';

    let title = $derived($routeStore.title);
    let h1 = $derived($routeStore.h1);
    let layout = $derived($routeStore.layout);
    let wrapper = $derived($routeStore.wrapper);
    let name = $derived($routeStore.name);
    let extras = $derived($routeStore.extras);
    
    let { children } = $props();
</script>

<svelte:head>
    <title>{title || 'My Project'}</title>
</svelte:head>

{#if !layout || layout === Layouts.DEFAULT}
    <Header/>
    <main data-name={name} class={`WRAPPER` + (wrapper ? ' _' + wrapper : '')}>
        {#if h1}
            <div class="HEADING">
                <h1 class="TITLE">{h1}</h1>
            </div>
        {/if}
        {@render children?.()}
    </main>
{:else if layout === Layouts.BLANK}
    <main data-name={name} class={`WRAPPER` + (wrapper ? ' _' + wrapper : '')}>
        {@render children?.()}
    </main>
{:else if layout === Layouts.CUSTOM}
    {@render children?.()}
{/if}

{#if extras?.length && extras.includes(Extras.GO_TOP)}
    <!--GoTop/-->
{/if}
```

### 2. `routeStore`, `load` and `slugs` object

`load` function now accepts `slugs` object to get access group names specified in `user/(<id>[0-9]+)`:
```ts
export async function load({ url, params, data, fetch, setHeaders, depends, parent, untrack, slugs }) {
    const response = await fetch(`/api/articles/${slugs.id}/`);
    const article = await response.json();
    return { article }
}
```
Same for `routeStore`:
```ts
import { routeStore } from '/router/';

console.log($routeStore.slugs.id)
```