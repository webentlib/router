import { Sides } from './enums';

export interface Error {
    (): object,
}

export interface Layout {
    page: () => object,    // .svelte page
    error?: () => object,  // .svelte error page
}

interface PatternAndRoute {
    side?: Sides,         // run js on SERVER | FRONT | UNIVERSAL
    options?: object,     // for +page.js и +page.server.js e.g. {ssr: true, prerender: false}
    layout?: string,      // e.g: base.svelte
    wrapper?: string,     // can be used for css class for <main>
    title?: string,       // can be used for <title>
    h1?: string,          // can be used for <h1>
    name?: string,        // 'id' of a route
    extras?: string[],      // any additions in string to use in layout
}

export interface Pattern extends PatternAndRoute {
    re: string,           // regular expression in string

    page: () => object,   // .svelte page
    error?: () => object, // .svelte error page
    layouts?: Layout[],   // array of `Layout`s

    js?: () => object,    // .js of a page with `load` function (of describe it in `<script module>`)
}

export interface Route extends PatternAndRoute {
    re: RegExp,          // RegExp from sting defined in Pattern

    url: URL,            // URL
    slugs: object,       // slugs from Pattern — 'tasks/(<id>[0-9]+)' —> {id: 1}
    patter: Pattern,     // Pattern

    page: object,        // loaded .svelte page
    error?: object,      // loaded .svelte error page
    layouts?: object[],  // loaded .svelte layouts
}