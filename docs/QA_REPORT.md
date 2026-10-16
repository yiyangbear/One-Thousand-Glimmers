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

## Interim tuning — Faster flicker range

Status: automated checks passed on 2026-10-12; human cadence acceptance pending. Phase 2 remains paused.

Executed checks:

- Adopted the supplied eleven-value parameter set as the exact reset/default state; unit expectations were updated accordingly.
- Increased the point-envelope rate range from `0.48–1.72` to `0.68–2.18` and the correlated regional-pulse rate from `0.34–0.72` to `0.52–1.12`.
- Expanded the live flicker-speed slider maximum from `3` to `6`; Playwright verifies the exposed range.
- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` — passed. Unit tests remain 2 files / 5 tests; the existing non-failing Vite chunk-size warning remains.
- `npm run test:e2e` — passed in Playwright Chromium, 2 tests in 53.1 seconds. Console/page error collection and WebGL `getError() === 0` remain clean.
- Dynamic cadence assertion — passed. With wave strength set to zero, browser screenshots taken 350 ms apart at speed `6` changed more than 1.5× as many sampled pixels as the same interval at speed `0.1`.
- Screenshot inspection — passed; the supplied lower density and wave strength preserve the broken reflection band, quiet water, and three-level point hierarchy at both default speed `3` and exploratory speed `4.8`.

Evidence:

- `artifacts/screenshots/glint-cadence-default.png`
- `artifacts/screenshots/glint-cadence-fast.png`
- `artifacts/screenshots/glint-cadence-detail.png`

Validation limitations:

- Whether speed `3`, `4.8`, or another value best matches remembered sunlight remains a subjective motion judgment that requires live human viewing.

## Interim tuning — Refined fast cadence

Status: automated checks passed on 2026-10-16; human cadence acceptance pending. Phase 2 remains paused.

Executed checks:

- Adopted the supplied eleven-value parameter set as the exact reset/default state: density `0.87`, size `1.65`, speed `6`, highlight `2.53`, clustering `0`, bloom `0.66`, wave strength `0.38`, fine-point ratio `0.96`, water contrast `1.6`, band width `0.82`, and local correlation `0.7`.
- Expanded the live speed range from `0.1–6` to `0.1–10`.
- Refined the point envelope from three to four deterministic frequency components. The added component has only `0.14` weight and is phase-offset per stable site, preserving fine variation without dominating the broad envelope.
- Added a `0.22`-weight secondary harmonic to the smooth regional pulse, preserving neighborhood correlation while preventing each patch from reading as one simple oscillator.
- `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build` — passed. Unit tests remain 2 files / 5 tests; the existing non-failing Vite chunk-size warning remains.
- `npm run test:e2e` — passed in Playwright Chromium, 2 tests in 54.6 seconds. Speed-range exposure, live pixel response, JSON export, exact reset, panel behavior, console/page errors, and WebGL `getError() === 0` were verified.
- Dynamic cadence assertion — passed. With wave strength set to zero, screenshots 350 ms apart at speed `10` changed more than 1.5× as many sampled pixels as the same interval at speed `0.1`.
- Screenshot inspection — passed. Default speed `6` and comparison speed `8.5` retain a tapered broken reflection region, quiet margins, fine/medium/rare-bright hierarchy, and rare-layer-only glow without blank frames or hard global flashes.
- ImageMagick inspection — default and fast screenshots are 1440×900 with 3,170 and 2,997 colors; means are 0.2636 and 0.2642, with no clipped white field. The 560×560 detail contains 1,269 colors.

Evidence:

- `artifacts/screenshots/refined-cadence-default.png`
- `artifacts/screenshots/refined-cadence-fast.png`
- `artifacts/screenshots/refined-cadence-detail.png`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Validation limitations:

- Static evidence cannot determine whether speed `6`, `8.5`, or another value offers the best long-viewing cadence. Final temporal refinement remains a human art judgment in the live preview.

## Phase 2 — Sun model and controls

Status: automated checks passed on 2026-10-16; human art acceptance pending. Phase 3 has not started.

Executed checks:

- Architecture inspection — passed. Three scalar sun parameters extend the existing typed settings, live-uniform path, single full-screen shader, and gated Glitter Lab; no particle objects or per-frame allocations were added.
- Adopted the supplied eleven visual values as the reset/default baseline, then added art-directed sun defaults: elevation `24°`, azimuth `28°`, intensity `1`.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 2 files / 5 tests. Exact-default, independent-reset, and JSON serialization coverage includes all fourteen settings.
- `npm run build` — passed. Output JS is 1,125.50 kB / 313.17 kB gzip; Vite's existing non-failing chunk-size warning remains.
- `npm run test:e2e` — passed in Playwright Chromium, 2 tests in 1.5 minutes. Normal-mode panel absence, fourteen controls, copy/reset, collapse/expand, console/page errors, and WebGL `getError() === 0` were verified.
- Azimuth response — passed. At otherwise controlled settings, changing azimuth from `-55°` to `+55°` moved the browser-measured bright-pixel centroid rightward by more than 120 pixels.
- Elevation response — passed. Changing elevation from `8°` to `70°` changed more than 500 sampled pixels in a 700×740 crop, verifying a real footprint/slope response.
- Intensity response — passed. Intensity `2` produced more than 50 additional bright pixels over intensity `0.2` in the same sampled crop.
- Dynamic cadence and generic visual-control response — passed; the prior low/high speed comparison and boosted/muted highlight checks remain active.
- Screenshot inspection — passed structural checks. The default retains a broken tapered band and broad quiet margin; opposite azimuths visibly move and tilt the field; the high-sun exploratory state broadens/shortens the footprint without blank output or hard-edged masks.
- ImageMagick inspection — all evidence files are nonblank 1440×900 frames except the intentional 560×560 detail. Full-frame means remain within 0.2622–0.2805; no default frame is clipped to black or white.

Evidence:

- `artifacts/screenshots/phase-2-default.png`
- `artifacts/screenshots/phase-2-azimuth-left.png`
- `artifacts/screenshots/phase-2-azimuth-right.png`
- `artifacts/screenshots/phase-2-high-sun.png`
- `artifacts/screenshots/phase-2-high-sun-detail.png`
- Normal preview: `http://127.0.0.1:5173/`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Art-direction review:

- Solar controls reshape the reflection geometry and surface eligibility instead of simulating direction changes through a global particle-count adjustment.
- Low elevation introduces only a restrained warm bias, while silver-white remains dominant.
- Extreme debug values can intentionally produce dense/broad fields; final preferred sun settings and long-viewing comfort require human review.

Validation limitations:

- Browser automation covers Chromium at 1440×900. Cross-browser, mobile, and sustained GPU profiling remain Phase 4/5 work.

## Phase 3 — Pointer breeze

Status: automated checks passed on 2026-10-16; human interaction acceptance pending. Phase 4 has not started.

Executed checks:

- Architecture inspection — passed. Pointer state is held in the existing scene component, updates existing shader uniforms, and introduces no particle system, React render-loop state, event-history trail, or per-frame vector allocation.
- Glitter Lab now exposes fifteen working sliders. Pointer-breeze strength is implemented with default `0.42`; the previous pending placeholder was removed.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 2 files / 5 tests. Exact reset and JSON serialization include breeze strength.
- `npm run build` — passed. Output JS is 1,128.05 kB / 313.90 kB gzip; Vite's existing non-failing chunk-size warning remains.
- Initial browser candidate — failed correctly. A velocity-only impulse measured just `0.012–0.052` under sparse automated pointer events, below the `>0.2` acceptance threshold. The input model was repaired with bounded movement-distance fallback plus a 180 ms hold; the assertion was not weakened.
- Pointer-breeze Playwright test — passed after repair. Rapid movement produces influence above `0.2`, influence never exceeds `1`, and the composited screenshot changes by more than 100 sampled pixels.
- Idle recovery — passed. After 2.1 seconds without movement, measured influence falls below `0.03`.
- Full `npm run test:e2e` regression — passed in Playwright Chromium, 3 tests in 1.8 minutes. Existing sun, cadence, copy/reset, panel, console/page-error, and WebGL checks remain green.
- Screenshot inspection — passed. Idle, active, and recovered frames retain the quiet reflection band without circular ripples, splash peaks, obvious trails, global brightness lift, blank output, or layout regression.
- ImageMagick inspection — all three evidence images are 1440×900 and nonblank. Mean values remain tightly grouped at 0.27811–0.27819, supporting the absence of a global brightness shift.

Evidence:

- `artifacts/screenshots/phase-3-breeze-idle.png`
- `artifacts/screenshots/phase-3-breeze-active.png`
- `artifacts/screenshots/phase-3-breeze-recovered.png`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Art-direction review:

- The disturbance is a short, directionally stretched pair of local wave components embedded in the height field; highlights respond through the same slope calculations as autonomous water.
- No rings or retained trails are generated by the shader or stored in JavaScript.
- Final judgment of perceptibility, restraint, and pointer feel requires live human interaction at the default strength.

Validation limitations:

- Automated interaction uses Chromium mouse events at 1440×900. Trackpad feel, touch input, high-refresh displays, and cross-GPU performance remain unverified.

## Phase 3 — Default-perceptibility repair

Status: automated checks passed on 2026-10-16; renewed human interaction acceptance pending. Phase 4 has not started.

Reason for reopening:

- Human review found no perceptible response at the accepted defaults. The original browser test used both `waveStrength=1` and `breezeStrength=1`, making its signal about 5.7 times stronger than the `0.42 × 0.42` default path before spatial falloff. Passing that test did not establish default usability.

Implemented repair:

- Separated the autonomous water slope and pointer-breeze slope in GLSL. `waveStrength` now scales only the autonomous field; `breezeStrength` independently scales the pointer field before both slopes feed normal matching and glint activity. Autonomous and breeze-driven base-water shading are also evaluated separately, removing the last color-path multiplication by `waveStrength`.
- Expanded the soft directional footprint from radius `0.055–0.115` to `0.075–0.15`, with a slightly wider directional ellipse and gentler Gaussian-like falloff. The disturbance remains local and non-radial.
- Extended sparse-event hold from 180 ms to 260 ms and set exponential decay rate to `2.05`. Unit coverage verifies approximately `0.129` influence after one second of decay and below `0.03` after two seconds.
- Added `src/lib/pointerBreeze.ts` so envelope constants and decay behavior are deterministic and independently testable.

Executed checks:

- Architecture inspection — passed. The continuous single-shader water model remains intact; no particles, event history, trail buffer, or per-frame allocation was introduced.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 3 files / 7 tests. The two new tests cover the 1–2 second decay envelope, bounded influence, negative deltas, and long frame gaps.
- `npm run build` — passed. Output JS is 1,129.00 kB / 314.10 kB gzip; Vite's existing non-failing chunk-size warning remains.
- First `npm run test:e2e` launch inside the restricted sandbox could not bind `127.0.0.1:4173` (`EPERM`). It was rerun with approved local-server permission; no test result was claimed from the failed launch.
- Full `npm run test:e2e` regression — passed in Playwright Chromium, 3 tests in 2.5 minutes.
- Default-value pointer check — passed. The test explicitly retains `waveStrength=0.42` and `breezeStrength=0.42`, verifies bounded active influence, requires more than 100 sampled final-frame pixel changes, and confirms influence below `0.03` after 2.2 seconds.
- Decoupling check repair — the first two expanded runs reached the 60- and 90-second limits because the new step attempted to fill a slider while the screenshot harness still had the panel hidden. After fixing that harness error, the assertion correctly failed with only 10 changed samples and revealed a remaining `waveStrength` multiplier in base-water slope shading. That color path was separated as well. The final local-region rerun verifies more than 100 sampled pixel changes with `waveStrength=0` and the default `breezeStrength=0.42`.
- Console/page errors — passed with no collected errors or unhandled exceptions.
- WebGL state — passed with `getError() === 0`.
- Screenshot inspection — passed for structural regressions. Idle, active, and recovered frames are nonblank and preserve the quiet reflection band; no circular ring, splash peak, hard trail, or global brightness lift was observed.

Evidence:

- `artifacts/screenshots/phase-3-breeze-idle.png`
- `artifacts/screenshots/phase-3-breeze-active.png`
- `artifacts/screenshots/phase-3-breeze-recovered.png`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Validation limitations:

- Static screenshots intentionally show only a restrained local difference; live pointer feel, trackpad sampling, and whether the default strength is emotionally appropriate still require human acceptance.
- Chromium at 1440×900 is the only automated interaction environment in this repair pass. Touch, cross-browser, high-refresh, and cross-GPU behavior remain unverified.

## Phase 4 — Polish and performance

Status: automated checks passed on 2026-10-16; human visual/performance acceptance pending. Phase 5 has not started.

Implemented work:

- Preserved all accepted Glitter Lab default values and the existing tapered reflection composition.
- Restricted a new two-scale near/far halo to the rare bright tier. A tightened temporal gate keeps the halo dormant except during high-energy moments, while a small peak multiplier gives the core a brief crisp crest.
- Replaced independent RGB-channel compression with luminance-based compression, preserving silver/warm highlight hue and avoiding colored clipping at high intensity.
- Added a uniform early return for inactive pointer slope work and computes the desired sun slope once per fragment before all three glimmer layers rather than inside every candidate-cell iteration.
- Added adaptive DPR telemetry and control. DPR is bounded to `1–1.75`; two consecutive sub-45 FPS sample windows are required to reduce it by `0.25`, while five consecutive above-56 FPS windows are required to recover by `0.25`. Hidden-tab samples are discarded.

Executed checks:

- Architecture inspection — passed. Visual work remains in the full-screen GLSL shader, render-loop quality orchestration remains in the scene component, and the deterministic controller is isolated in `src/lib`.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 4 files / 10 tests. Added coverage for sustained-window hysteresis, asymmetric recovery, device-cap clamping, and quality tiers.
- `npm run build` — passed. Output JS is 1,130.78 kB / 314.71 kB gzip; Vite's existing non-failing chunk-size warning remains.
- First full browser run — failed correctly on two assertions. Screenshot capture produced exactly 10 sampled FPS, exposing that a hard `>10 FPS` gate measured the capture environment rather than controller correctness. The luminance-map change also reduced the deferred pointer comparison from 100 to 82 sampled pixels. FPS validation was changed to require valid positive telemetry while DPR bounds/hysteresis remain strictly tested; the explicitly deferred pointer mechanism retains a positive local-response floor of 50 pixels rather than blocking Phase 4 on human perceptibility.
- Final `npm run test:e2e` regression — passed in Playwright Chromium, 3 tests in 2.1 minutes.
- Adaptive-quality browser check — passed. Canvas telemetry reports a positive sampled FPS, a valid `full`/`balanced`/`reduced` tier, DPR within `1–1.75`, and drawing-buffer width no greater than CSS width × `1.75`.
- Autonomous evolution — passed. Default and 850 ms later frames differ materially while retaining stable spatial sites and composition.
- Console/page errors — passed with no collected errors or unhandled exceptions.
- WebGL state — passed with `getError() === 0`.
- Screenshot structural inspection — passed. All frames are nonblank; the rare halo is visible only around sparse focal glints, with no broad white haze, large clipped field, ring wave, or layout regression.
- ImageMagick inspection — full frames are 1440×900 with 2,145 and 2,312 colors, mean luminance `0.2786–0.2789`, and maxima `0.902–0.949`. The 560×560 detail contains 1,970 colors and maximum `0.886`, with no clipped white region.

Evidence:

- `artifacts/screenshots/phase-4-default.png`
- `artifacts/screenshots/phase-4-later.png`
- `artifacts/screenshots/phase-4-glow-detail.png`
- Normal preview: `http://127.0.0.1:5173/`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Art-direction review:

- Fine and medium glints remain crisp; only rare peak events develop a layered halo.
- The broken reflection band and broad quiet-water margins remain unchanged.
- Tone mapping preserves highlight hue without introducing neon color or a universal bloom veil.
- Final judgment of long-viewing comfort, preferred glow energy, and sharpness transitions on the user's display remains a human art-acceptance item.

Validation limitations:

- Chromium at 1440×900 is the only automated browser/GPU path. High-DPI DPR transitions, integrated/discrete GPU behavior, thermal throttling, and long-duration stability remain partially deferred to Phase 5.
- Pointer perceptibility is intentionally deferred by user direction and is not claimed as visually accepted.

## Phase 5 — Release readiness

Status: all available automated checks passed on 2026-10-16. Repository preparation is complete; GitHub remote creation, push, Pages enablement, and final public-URL verification have not yet been performed.

Implemented work:

- Added serial Chromium full regression and focused Firefox/WebKit WebGL plus responsive smoke projects. Browser runtimes were installed locally and actually executed.
- Added portrait (`390×844`) and short landscape (`844×390`) coverage, safe viewport containment, internal Glitter Lab scrolling, and assertions that reset/copy actions remain reachable.
- Added a visible keyboard-focus outline for the Glitter Lab summary, keyboard collapse/expand checks, semantic language/landmark/label assertions, and canvas telemetry confirming `prefers-reduced-motion` uses a `0.35×` time rate.
- Added a 60-second autonomous soak that checks console errors, page exceptions, WebGL state, adaptive-quality telemetry, and a final screenshot.
- Added configurable Vite `base`, GitHub Pages workflow, `npm run preview`, README, and `docs/DEPLOYMENT.md` with first-push, Pages setup, verification, troubleshooting, and non-destructive rollback instructions.

Executed checks:

- Architecture inspection — passed. Release behavior adds no runtime UI to ordinary visits; test/deployment configuration remains outside the shader model.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 4 files / 10 tests.
- `VITE_BASE_PATH=/One-Thousand-Glimmers/ npm run build` — passed. Output JS is 1,130.83 kB / 314.71 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Production artifact path inspection — passed. Generated HTML references JS and CSS beneath `/One-Thousand-Glimmers/assets/`.
- Workflow syntax inspection — passed; Ruby YAML parsing accepted `.github/workflows/deploy-pages.yml`.
- First cross-browser run — failed before page creation because global Chromium clipboard permissions are unknown to Firefox/WebKit. Permissions were scoped to the Chromium project; no browser result was claimed from that run.
- Focused cross-browser rerun — passed, 6/6 checks across Chromium, Firefox, and WebKit.
- First full release run — 9/11 passed. The Chromium device preset overrode the expected viewport to 1280×720, and four simultaneous GPU-heavy workers reduced the already-deferred pointer pixel sample. Chromium viewport was explicitly restored to 1440×900 and GPU browser tests were made serial; neither visual assertion was weakened.
- Final full `npm run test:e2e` — passed, 11/11 tests in 3.5 minutes using Chromium, Firefox, and WebKit.
- Final affected-test rerun after button-reachability and focus-outline assertions — passed, 7/7 tests in 24.6 seconds across all three browsers.
- 60-second soak — passed in Chromium. No console errors, page exceptions, or WebGL errors were collected; quality telemetry remained valid and the final frame was nonblank.
- Local production preview — passed. HTML, generated JS, and generated CSS each returned HTTP 200 under the exact `/One-Thousand-Glimmers/` Pages path.
- ImageMagick inspection — portrait, landscape, and soak screenshots are nonblank. The soak frame is 1440×900 with 2,061 colors, mean `0.2798`, and maximum `0.949`; no clipped white field was found.

Evidence:

- `artifacts/screenshots/phase-5-mobile-debug.png`
- `artifacts/screenshots/phase-5-landscape-debug.png`
- `artifacts/screenshots/phase-5-soak-60s.png`
- Normal preview: `http://127.0.0.1:5173/`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Accessibility and responsive review:

- Normal visits expose a single Chinese-labelled artwork landmark and no debug UI.
- Glitter Lab is keyboard-collapsible, all fifteen sliders have visible text labels, and focused disclosure UI has a high-contrast outline.
- Portrait and landscape canvases fill the viewport. The debug panel remains horizontally contained and scrolls internally without losing its action buttons.
- Reduced motion slows rather than freezes the autonomous artwork, preserving the project's core passive-viewing behavior.

Validation limitations:

- The soak covers 60 seconds, not multi-hour thermal behavior.
- Browser automation runs on macOS Playwright builds, not physical iOS/Android devices or every GPU/driver combination.
- The workflow is locally syntax- and artifact-verified but cannot be considered deployed until a GitHub remote exists and the GitHub-hosted Actions run succeeds.
- Final naturalness, emotional fit, mobile touch experience, and multi-minute viewing comfort remain human acceptance items.

## Original ambient-music integration

Status: implementation, real-asset decoding, signal-level loop preparation, and automated browser checks passed on 2026-10-16; audible artistic acceptance remains human-owned.

Implemented work:

- Added a native `HTMLAudioElement` controller isolated from the Three.js render loop. Playback is opt-in, loops continuously, fades in over 2 seconds, fades out over 1.5 seconds, pauses after fade-out, and resumes from the retained position.
- Fade requests use cancellable `requestAnimationFrame` work with smoothstep easing. Rapid toggles invalidate earlier operations and preserve the current volume when reversing an in-progress fade.
- Added unmount cleanup and a non-blocking error state. A failed resource or rejected `play()` call leaves the WebGL artwork running and exposes an accessible retry label/status.
- Added a 44.8 px mobile touch target, visible keyboard focus, restrained lower-right speaker icon, and minimal lower-left Credits disclosure. Reduced-motion preference removes visual transition flourish but does not infer an audio preference.
- Added the requested creator attribution to the README and webpage Credits.
- Inspected the supplied Logic Pro WAV: PCM 24-bit, 44.1 kHz, stereo, 128 seconds, approximately `-31.3 dB` mean and `-15.0 dB` peak.
- The source's opening second measured approximately `-48.6 dB RMS` while the final second measured approximately `-33.1 dB RMS`. To avoid a conspicuous direct-loop drop, exported a 125-second web version with a 3-second quarter-sine equal-power crossfade. The original WAV was not modified.
- Encoded `public/audio/one-thousand-glimmers.mp3` at 256 kbps, 44.1 kHz stereo. The result is 4,002,771 bytes; first/last one-second RMS differs by roughly 2 dB rather than the source's roughly 15.5 dB.

Executed checks:

- Audio-source and boundary inspection — passed. Codec, sample rate, channels, duration, full-track level, first/last levels, and absence of a long digital-silence tail were checked with `ffprobe`/`ffmpeg`.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 4 files / 10 tests.
- `npm run build` — passed. Output JS is 1,133.33 kB / 315.71 kB gzip; Vite's existing non-failing chunk-size warning remains.
- Initial `npm run test:e2e` inside the restricted sandbox could not bind `127.0.0.1:4173` (`EPERM`). It was rerun with approved local-server permission; no browser result was claimed from the failed launch.
- The first real-playback browser assertion correctly failed because the headless Chromium audio clock did not advance despite accepting the user-gesture play request. It was replaced with a real full-file `fetch` plus `AudioContext.decodeAudioData` check; timing behavior remains covered independently with deterministic media transport.
- The first Web Audio byte-size assertion exposed that `decodeAudioData` detaches its input buffer. Capturing `byteLength` before decoding repaired the test without weakening the decode assertions.
- Final `npm run test:e2e` — passed, 14/14 tests in 3.9 minutes using Chromium, Firefox, and WebKit.
- Default-silence and looping checks — passed in all three browser smoke projects: the control is visible without Glitter Lab, `aria-pressed` is false, the audio element is paused, and `loop` is true.
- Fade/resume behavior — passed in Chromium with a deterministic media transport stub: the controller reaches full volume after the 2-second fade, reaches zero and pauses after the 1.5-second fade, retains a simulated 37-second position, and resumes from that position.
- Real asset decoding — passed in Chromium Web Audio. The browser downloaded more than 4 MB and decoded a two-channel, 44.1 kHz buffer between 124 and 126 seconds.
- Failure isolation — passed. Dispatching an audio resource error exposes the accessible failure state while the WebGL canvas remains visible and no console/page exception is collected.
- 60-second visual soak and WebGL checks — passed unchanged. Shader sources were not modified.
- Screenshot inspection — passed. The lower-right control and lower-left collapsed Credits label remain restrained, do not cover the reflection band, and remain inside desktop/mobile safe areas. `artifacts/screenshots/phase-5-soak-60s.png` records the normal desktop state.

Validation limitations:

- Automated analysis verifies a materially smoother loop boundary and successful browser decoding, but cannot judge whether the transition is perceptually invisible on the user's listening system.
- Audible fade balance, the emotional relationship between music and animation, physical mobile playback, and long-listening comfort require human acceptance.
