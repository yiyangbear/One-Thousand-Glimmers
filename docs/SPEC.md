# Product and Visual Specification

## Experience

- The page immediately renders a full-viewport river surface.
- Autonomous animation continues indefinitely without pointer input.
- Resize and device-pixel-ratio changes preserve full-screen coverage.
- The first milestone contains no complex UI, sound, architecture, window frame, or narrative text.

## Rendering model

- A continuous multi-scale height field represents water.
- Surface derivatives provide an approximate normal.
- A directional reflection envelope and deterministic spatial candidates create uneven, locally stable glimmers.
- Time-varying phase/envelope functions modulate intensity continuously at different rates.
- Randomness is deterministic and reproducible.
- Render-loop work does not allocate a new particle population every frame.

## Phase 1 requirements

- Full-screen WebGL canvas and quiet blue-gray base water.
- Perceptible but subdued multi-scale surface evolution.
- Stable spatial glimmer sites with continuous independent flicker.
- Many very small highlights, fewer medium highlights, and rare bright highlights.
- Clustered, nonuniform distribution.
- Responsive layout and a graceful WebGL initialization error message.
- Reduced-motion preference lowers animation rate without stopping autonomous change.

## Later-phase requirements

- Phase 2: physically motivated sun elevation/azimuth/intensity controls that alter band position, width, length, density, and highlight response; hideable controls.
- Phase 3: bounded pointer breeze with spatial/temporal decay and no splash/ring/trail language.
- Phase 4: restrained glow, rhythm tuning, performance scaling, final visual polish.
- Phase 5: expanded tests, cross-browser/responsive verification, accessibility/deployment readiness.

## Quality targets

- No uncaught page errors or WebGL errors in the supported QA browser.
- TypeScript, lint, unit tests, and production build pass.
- Screenshot evidence exists for each applicable acceptance state.
- Target smooth interaction on modern desktop hardware; quality should degrade by resolution scaling rather than changing the artistic logic.

