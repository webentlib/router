import { Sides } from './enums';

export interface Error {
    (): object,  // .svelte error page
}

export interface Layout {
    page: () => object,    // .svelte page
    error?: () => object,  // .svelte error page
    js?: () => object,     // .js/ts of a page with `load` function (of describe it in `<script module>`)
    side?: Sides,          // Run js on SERVER | FRONT | UNIVERSAL
    options?: object,      // E.g. {ssr: true, prerender: false}
}

interface PatternAndRoute extends Layout {
    layout?: string,      // E.g: 'CUSTOM', 'CUSTOM'
    wrapper?: string,     // Can be used for css class for <main>
    title?: string,       // Can be used for <title>
    h1?: string,          // Can be used for <h1>
    name?: string,        // 'id' of a route
    extras?: string[],    // Any additions to use in layout
}

export interface Pattern extends PatternAndRoute {
    re: string,           // Regular expression in string
    layouts?: Layout[],   // Array of `Layout`s
}

export interface Route extends PatternAndRoute {
    re: RegExp,          // RegExp from sting defined in Pattern
    url: URL,            // URL
    slugs: object,       // Slugs from Pattern — 'tasks/(<id>[0-9]+)' —> {id: 1}
    patter: Pattern,     // Pattern
    layouts?: object[],  // Loaded .svelte layouts
}