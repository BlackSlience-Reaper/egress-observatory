/**
 * Local-only offline mode: ?mock=1 on localhost or 127.0.0.1 answers every data request from mock-fixtures.js.
 * Any other host ignores the parameter and never loads the fixtures, so `mock` stays null on the normal path.
 */
const isLocal = ['127.0.0.1', 'localhost'].includes(location.hostname);
const enabled = isLocal && new URLSearchParams(location.search).get('mock') === '1';

// Top-level await: main.js starts its first request only after window.fetch has been replaced.
export const mock = enabled ? (await import('./mock-fixtures.js?v=3')).install() : null;
