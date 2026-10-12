# QA Report

This file is append-only by phase: commands and evidence are recorded after they are actually run. A subjective art-quality judgment is never represented as an automated pass.

## Phase 0

Status: passed on 2026-10-12.

Executed checks:

- Required-file inspection — passed; all six requested project-context files are present.
- Architecture inspection — passed; rendering, shader, and pure-helper boundaries are documented before visual implementation.
- `npm run typecheck` — passed.
- `npm run lint` — initially failed on a Fast Refresh warning; component extraction fixed it; rerun passed with zero warnings.
- `npm test` — passed, 1 file / 2 deterministic-helper tests.
- `npm run build` — passed with Vite 7.3.7.
- `npm audit --json` — initially found vulnerabilities in the Vitest 3 dependency chain; Vitest was upgraded to 5.0.4; installation audit then reported 0 vulnerabilities.

Notes:

- Browser rendering and screenshots are intentionally deferred to Phase 1 because Phase 0 has no artwork.
- npm reported unapproved optional/install scripts for `esbuild` and `fsevents`, but the production build completed successfully; no manual script approval was required.

## Phase 1

Status: automated checks passed on 2026-10-12; human art acceptance pending.

Executed checks:

- Architecture inspection — passed; the render loop lives in `src/components`, GLSL lives in `src/shaders`, deterministic pure helpers remain in `src/lib`, and no particle objects are recreated per frame.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 1 file / 3 tests. The added check verifies a stable sparse deterministic selection.
- `npm run build` — passed. Output JS is 1,113.84 kB / 309.75 kB gzip; Vite emitted a non-failing chunk-size warning.
- `npm run test:e2e` — passed in Playwright Chromium, 1 test. Verified a visible 1440×900 canvas, renderer-ready state, zero collected console errors, zero page exceptions, and WebGL `getError() === 0`.
- Screenshot smoke inspection — passed after one repair cycle. The first candidate was technically valid but visually too close to blank; stable-site size, band density, and low-level water variation were increased, then browser checks were rerun.
- ImageMagick structural analysis — passed: both PNGs are 1440×900; normal frame has 274 colors with range 0.278–0.878, later frame has 366 colors with range 0.278–0.843. They are not blank or clipped fields.
- Temporal smoke comparison — passed: frames 1.8 seconds apart differ at 364,027 pixels (28.09%), confirming autonomous evolution. This check does not claim that subjective motion quality is correct.

Evidence:

- `artifacts/screenshots/phase-1-normal.png`
- `artifacts/screenshots/phase-1-later.png`
- Local preview: `http://127.0.0.1:5173/`

Art-direction review:

- Automated/manual screenshot inspection found no pure-black background, neon palette, star shapes, bloom halos, obvious large color blocks, particle trails, or layout breakage.
- The reflection field is visibly nonuniform and forms a broken, tapered band with calm negative space.
- Human review is still required for perceived naturalness, appropriate restraint, brightness hierarchy, and comfort over several minutes.

Validation limitations:

- Phase 1 has no sun controls or pointer breeze by design, so those state screenshots are not applicable yet.
- Long-duration cadence and performance across multiple GPUs/browsers are deferred to later phases.
