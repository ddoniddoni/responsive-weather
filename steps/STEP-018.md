# STEP-018: ADM1 boundary server proxy

## Goal

- Load geoBoundaries ADM1 data through a Next.js API route so the browser no longer fetches GitHub/geoBoundaries URLs directly.
- Keep the existing country and region selection flow working with the current mock weather panel.

## Scope

- Add a same-origin API route for administrative boundaries.
- Move external geoBoundaries fetch logic into a server-only module.
- Keep shared GeoJSON parsing and boundary label helpers client-safe.
- Update the client hook to call `/api/admin-boundaries`.
- Reduce technical map status text so ADM1 implementation details are not shown as primary UI.

## Completion Criteria

- Selecting a country requests `/api/admin-boundaries?countryCode={ISO3}&level=ADM1`.
- Supported countries render regional boundaries without browser CORS or redirect failures.
- Unsupported or failed requests show a user-readable fallback status.
- Existing region click behavior still updates the weather detail panel.
- `npm run lint` and `npm run build` pass.

## Checklist

- [x] Create Step 018 branch
- [x] Add Step 018 plan document
- [x] Add Next.js API route for admin boundaries
- [x] Move external boundary fetch to server-only code
- [x] Update client hook to use same-origin route
- [x] Polish map boundary status labels
- [x] Align weather metric card accent dots with labels
- [x] Verify lint/build
- [x] Commit and push Step 018 branch
