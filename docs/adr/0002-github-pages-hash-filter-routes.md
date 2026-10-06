# GitHub Pages hosting, so the Filter lives in the URL hash

The app is a static build deployed to GitHub Pages from `master` via GitHub Actions: free, and the repo is already there. GitHub Pages has no SPA fallback for unknown paths, so the active Filter is kept in the URL hash (`#/active`, `#/completed`) rather than in a path like `/active`, which would 404 on reload. The Vite `base` is `/todo/` because the site is served from the repo subpath.
