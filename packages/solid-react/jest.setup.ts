import "@inrupt/jest-jsdom-polyfills";
globalThis.fetch = async () => new Response();