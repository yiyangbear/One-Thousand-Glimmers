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

## Interim milestone — Glitter Lab

Status: automated checks passed on 2026-10-12; human acceptance pending. Phase 2 remains paused.

Executed checks:

- Architecture inspection — passed; panel state is isolated in React, parameter definitions/defaults live in `src/lib`, and the renderer updates the existing material uniforms without rebuilding shader code.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 2 files / 5 tests. Added exact-default, independent-reset, and JSON serialization checks.
- `npm run build` — passed. Output JS is 1,118.17 kB / 311.33 kB gzip; the existing non-failing Vite chunk-size warning remains.
- `npm run test:e2e` — passed in Playwright Chromium, 2 tests. Verified normal-mode panel absence, seven implemented sliders, pending pointer-breeze label, expand/collapse, clipboard JSON, reset values, console/page error absence, and WebGL `getError() === 0`.
- Actual render response — passed. Playwright raised density, size, highlight, and bloom, captured the final composited page, then set highlight intensity to zero and captured again. Browser-decoded PNG statistics confirmed the enhanced state contained materially more bright pixels.
- Defect found and repaired — early browser runs exposed that React state updated a detached uniform container rather than the active `ShaderMaterial.uniforms`; controls appeared to move but did not affect rendering. The renderer now writes directly to the live material, and all browser checks pass after repair.
- Screenshot inspection — passed for panel layout, values, default state, adjusted state, and absence of blank frames or major color-block regressions.
- ImageMagick structural analysis — passed: both evidence images are 1440×900; the default frame contains 1,180 colors and the adjusted frame 1,408 colors. Their pixel difference is 598,670 pixels (46.19%), including parameter, time, and panel-value changes.

Evidence:

- `artifacts/screenshots/glitter-lab-default.png`
- `artifacts/screenshots/glitter-lab-adjusted.png`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Validation limitations:

- Naturalness at extreme parameter values is not guaranteed; Glitter Lab intentionally permits exploratory values outside the art-directed default.
- Mouse breeze remains unimplemented and has no slider, as required.

## Interim milestone — Visual refactor

Status: automated checks passed on 2026-10-12; human art acceptance pending. Phase 2 remains paused.

Executed checks:

- Architecture inspection — passed; the same full-screen shader and stable-uniform path are retained. The visual field is now divided into fine, medium, and bright procedural layers without per-frame object allocation.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 2 files / 5 tests. Glitter Lab defaults and JSON now include fine-point ratio and water contrast.
- `npm run build` — passed. Output JS is 1,120.76 kB / 311.97 kB gzip; the existing non-failing chunk-size warning remains.
- `npm run test:e2e` — passed in Playwright Chromium, 2 tests. Nine live sliders, clipboard/reset behavior, hidden normal mode, WebGL state, console health, actual final-frame parameter response, and three screenshots were verified.
- Screenshot repair cycle — the first refactor candidate failed visual inspection because unbounded derivative anti-aliasing illuminated cell boundaries as crosses and grid scratches. Capping the point-edge derivative and increasing the true fine-point radius removed those artifacts; Playwright checks and screenshots were rerun.
- Final screenshot inspection — passed structural checks: highlights are discrete near-round points with clear fine/medium/rare-bright hierarchy; no ellipses dominate; no crosses, grid boundaries, obvious wave lines, blank frames, or large clipped fields remain.
- ImageMagick analysis — default and recommended images are 1440×900 with 2,608 and 2,768 colors. Their means are 0.2665 and 0.2671, confirming a substantially deeper base than the previous ~0.34–0.36 field without collapsing into black. The 600×520 detail contains 1,169 colors.

Evidence:

- `artifacts/screenshots/visual-refactor-default.png`
- `artifacts/screenshots/visual-refactor-optimized.png`
- `artifacts/screenshots/visual-refactor-detail.png`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Art-direction review:

- Fine-point density and multi-scale hierarchy are materially stronger while the reflection band remains uneven and locally clustered.
- Glow is limited to rare bright events; it does not create a universal pale shell around every point.
- Water is darker, cooler, and more varied. Final naturalness, long-duration comfort, and the preferred density still require human review.

Validation limitations:

- Automated screenshots validate structure, not the full subjective quality of several minutes of motion.
- Sustained frame-time profiling across integrated and discrete GPUs remains outstanding.

## Interim milestone — Sun-glitter spatial organization

Status: automated checks passed on 2026-10-12; human art acceptance pending. Phase 2 remains paused.

Executed checks:

- Architecture inspection — passed; the work remains inside the existing full-screen shader, Glitter Lab state model, and live-uniform update path. No particle objects or per-frame populations were introduced.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 2 files / 5 tests. Exact defaults and JSON coverage now include reflection-band width and local flicker correlation.
- `npm run build` — passed. Output JS is 1,123.35 kB / 312.63 kB gzip; the existing non-failing Vite chunk-size warning remains.
- `npm run test:e2e` — passed in Playwright Chromium, 2 tests. Eleven working sliders, clipboard/reset behavior, hidden normal mode, WebGL state, console health, actual final-frame parameter response, and three screenshots were verified.
- Test repair cycle — the first full browser run completed all expensive screenshot/clipboard/reset work but hit the original 30-second timeout on the final panel re-open. The screenshot-heavy test now has a 60-second limit; it reran successfully in 33.3 seconds. No visual or runtime assertion was bypassed.
- Screenshot inspection — passed structural checks: a tapered, broken, off-center active band replaces the uniform full-screen field; quiet water occupies most of the frame; fine, medium, and rare bright points remain distinct; restrained directional water texture is visible without hard wave outlines.
- ImageMagick structural analysis — all images are nonblank. Default and recommended screenshots are 1440×900 with 3,725 and 3,225 colors, means 0.2617 and 0.2633, and luminance extrema within 0.0588–1.0. The 560×560 detail contains 1,213 colors.

Evidence:

- `artifacts/screenshots/glint-field-default.png`
- `artifacts/screenshots/glint-field-optimized.png`
- `artifacts/screenshots/glint-field-detail.png`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Art-direction review:

- The near-zero outside-band candidate floor materially reduces the previous starfield reading while preserving occasional peripheral glints.
- Ripple affinity, slope matching, and broken-field masking create visible strings and local patches within the reflection region.
- Only the rare bright layer produces a halo; most points remain crisp and small.
- Final judgment of naturalism, patch timing over several minutes, and emotional fit remains a human art-acceptance item.

Validation limitations:

- Static screenshots cannot fully prove that neighboring glints feel organically correlated in motion; the shader mechanism and autonomous frame changes are verified, but prolonged viewing remains necessary.
- Cross-browser/GPU frame-time profiling is still deferred to Phase 4/5.
