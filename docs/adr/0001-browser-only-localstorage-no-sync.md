# Browser-only storage in localStorage, no sync for the MVP

The MVP has no backend: Todos live in the browser's `localStorage`, so they exist on one device and one browser only. We accepted that because the app is for one person's daily use and a backend is coming anyway with the planned AI features (which need a server to hold an API key); building sync now would mean building that layer twice. Data is stored under a versioned key (`todos:v1`, envelope `{ version: 1, todos: [...] }`) and unreadable data falls back to an empty list, so the later move to a backend is a migration rather than a rewrite.

## Considered Options

- In-memory only: rejected, Todos must survive a reload for daily use.
- A real backend (own API, Supabase, Firebase) now: deferred until the AI work needs one.
