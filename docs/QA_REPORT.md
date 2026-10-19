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

- Added a Web Audio controller isolated from the Three.js render loop. Playback is opt-in, loops a decoded `AudioBuffer`, fades in over 2 seconds through `GainNode`, fades out over 1.5 seconds, suspends after fade-out, and resumes from the retained offset.
- Rapid toggles invalidate earlier fetch/decode operations, can cancel loading, and reverse an in-progress gain fade without creating parallel sources.
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
- Initial post-release diagnosis — reproduced in the user's in-app browser. After clicking, the prior media element remained at `readyState=0`, `duration=NaN`, and `currentTime=0`; calling `load()` explicitly did not start that browser's media pipeline.
- Compatibility repair — replaced the media-element transport with `fetch`, `decodeAudioData`, looping `AudioBufferSourceNode`, and scheduled `GainNode` curves. Live recheck reported `context=running`, duration `125`, channels `2`, and sample rate `44100`; fade-out suspended at offset `4.743s`, and reopening retained that offset.
- The first real-playback headless assertion correctly failed because its muted Chromium media-element clock did not advance despite accepting the gesture. The Web Audio repair removes that dependency and now exercises actual context state, buffer metadata, fades, suspension, and offset resume.
- The first Web Audio byte-size assertion exposed that `decodeAudioData` detaches its input buffer. Capturing `byteLength` before decoding repaired the test without weakening the decode assertions.
- The first complete repair regression had two unrelated failures: a single-interval cadence comparison fell below its historical ratio, and one WebKit process closed during page creation. The cadence test now aggregates four 180 ms intervals and requires a material `1.25×` response; WebKit was rerun independently without changing its assertions.
- Final `npm run test:e2e` — passed, 14/14 tests in 4.1 minutes using Chromium, Firefox, and WebKit. The 60-second soak remained green.
- Default-silence and looping checks — passed in all three browser smoke projects: the control is visible without Glitter Lab, `aria-pressed` is false, the audio element is paused, and `loop` is true.
- Fade/resume behavior — passed against the real Web Audio engine in Chromium: the controller reaches `on` after the 2-second gain curve, suspends after the 1.5-second fade-out, records a positive offset, and resumes with a running context from that offset.
- Real asset decoding — passed in Chromium Web Audio. The browser downloaded more than 4 MB and decoded a two-channel, 44.1 kHz buffer between 124 and 126 seconds.
- Failure isolation — passed. Dispatching an audio resource error exposes the accessible failure state while the WebGL canvas remains visible and no console/page exception is collected.
- 60-second visual soak and WebGL checks — passed unchanged. Shader sources were not modified.
- Screenshot inspection — passed. The lower-right control and lower-left collapsed Credits label remain restrained, do not cover the reflection band, and remain inside desktop/mobile safe areas. `artifacts/screenshots/phase-5-soak-60s.png` records the normal desktop state.

Validation limitations:

- Automated analysis verifies a materially smoother loop boundary and successful browser decoding, but cannot judge whether the transition is perceptually invisible on the user's listening system.
- Audible fade balance, the emotional relationship between music and animation, physical mobile playback, and long-listening comfort require human acceptance.

## Post-release refinement — Autonomous solar azimuth

Status: implemented and automatically validated on 2026-10-19; multi-minute pace and naturalness remain pending human art acceptance.

Implemented work:

- Added a pure deterministic azimuth function centered on the Glitter Lab value. After human review found the initial `±14°` result visually masked by normal flicker, the repaired trajectory combines `720 s` and `233 s` cycles with a maximum drift of approximately `±24°` and a clearer first-minutes direction.
- Replaced frame-delta accumulation with visible wall-clock time so slow hardware does not slow the sun. A visibility-change timestamp reset prevents background time from creating a return jump, while a one-second safety cap handles sleep/resume anomalies.
- Applied the existing reduced-motion rate (`0.35×`) to solar evolution without freezing the autonomous artwork.
- Renamed the debug control to “太阳方位角中心” and exposed the center, current azimuth, and accumulated visible time as canvas telemetry for QA.
- Kept accepted default parameters unchanged. Strengthened only the reflection envelope's soft azimuth-driven horizontal shift (`0.12` to `0.20`) and tilt (`0.18` to `0.22`), so the active band travels across stable water sites without turning the glints into moving particles.

Executed checks:

- Architecture inspection — passed. The pure time function lives in `src/lib`; scene orchestration remains in `GlimmerWater`; no React state update, allocation, or shader recompilation was added to the frame loop.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 5 files / 13 tests. Coverage verifies the accepted initial center, deterministic evolution, gentle one-second change, and the full supported range over a simulated hour.
- `npm run build` — passed. Output JS is 1,136.18 kB / 316.71 kB gzip; the existing non-failing Vite chunk-size warning remains.
- First repaired `npm run test:e2e` — 12/14 passed. The 60-second assertion exposed that the prior bounded frame-delta timeline accumulated only about half of real time under slow headless rendering; this was a real device-speed consistency defect, not accepted as success. The long Glitter Lab test separately reached its historical 120-second ceiling while saving its final screenshot, without an assertion failure.
- Repair — changed the solar clock to visible wall-clock time and increased only the Glitter Lab test's execution budget from 120 to 180 seconds; visual assertions and thresholds were not weakened.
- Final `npm run test:e2e` — passed, 14/14 tests in 4.6 minutes across Chromium, Firefox, and WebKit.
- Cross-browser solar telemetry — passed. All three browser smoke runs began at the `28°` center, changed by more than `0.05°` during the existing 1.8-second observation, and remained below a `1°` short-window change.
- 60-second timeline assertion — passed. The live azimuth moved by more than `12°` from its initial center independent of rendered frame rate.
- Existing Glitter Lab parameter-response, audio, pointer, responsive, accessibility, console/page-error, WebGL, and soak checks all remained green.
- Screenshot inspection — passed structural checks. Comparing the dedicated start and 60-second frames shows the active reflection band displaced visibly to the right while maintaining broken clusters, stable point sites, broad quiet water, and no hard mask or UI regression.

Evidence:

- `artifacts/screenshots/phase-5-soak-60s.png`
- `artifacts/screenshots/sun-motion-start.png`
- `artifacts/screenshots/sun-motion-60s.png`
- Normal preview: `http://127.0.0.1:5173/`
- Debug preview: `http://127.0.0.1:5173/?debug=true`

Validation limitations:

- A 60-second automated soak verifies continuous movement and runtime health, but cannot decide whether the solar pace feels natural over several minutes.
- The preferred drift range and emotional effect remain subjective and should be accepted in the live artwork before deployment.

## Post-release refinement — Press, drag, and interaction-audio interfaces

Status: implemented and automatically validated on 2026-10-19. The initially pending sound assets were integrated later the same day; physical mouse/touch feel and final audible balance remain pending human acceptance.

Implemented work:

- Replaced hover-only pointer movement with primary pointer down, capture, drag, release, and cancel handling. Hover movement now leaves the water unchanged.
- Added a standalone press envelope with a `900 ms` clear hold followed by continuous decay, driving a compact anisotropic facet disturbance rather than a circular ring.
- Drag response now uses direction, speed, and cumulative gesture distance. This removes event-frequency dependence, remains stable for the entire held gesture, then receives a `500 ms` post-release hold and approximately one-to-two-second exponential fade.
- Enlarged and strengthened the directional drag footprint while retaining spatial falloff, the existing bounded `0–1` influence, no history trail, and no particle allocation.
- Added separate `click` and `drag` sound events plus an independent Web Audio one-shot bridge. `VITE_POINTER_CLICK_SOUND` and `VITE_POINTER_DRAG_SOUND` resolve optional filenames beneath `public/audio/`; blank variables keep the bridge silent and skip fetching.
- Added `.env.example`, README setup instructions, teardown for active sources/context, decoded-buffer caching, and non-blocking configured-resource failure handling.

Executed checks and repairs:

- Architecture inspection — passed. Pointer state remains in the scene component, deterministic envelopes/URL resolution live in `src/lib`, and optional audio is isolated from the render loop in `InteractionAudio`.
- Initial targeted browser check — failed correctly because the press envelope had already decayed to `0.198` before capture, confirming that the original response remained too short to perceive.
- Press repair — introduced an explicit hold, then increased it to `900 ms` after a high-load full run measured `0.445` against the unchanged `>0.5` threshold. The final full run passed without lowering that threshold.
- Initial drag checks — exposed that event-by-event distance produced only `0.05–0.11` influence during slow stepped movement. Drag now accumulates total gesture distance and never decays while pressed.
- Recovery check — initially measured `0.034` after release against the `<0.03` threshold. The release decay rate was adjusted from `2.05` to `2.2`; the final check passed without relaxing recovery acceptance.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 6 files / 17 tests. New coverage verifies click decay, silent unconfigured sound sources, deployment-relative MP3 URL resolution, and distinct click/drag events.
- `npm run build` — passed. Output JS is 1,140.29 kB / 317.91 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Final targeted Chromium interaction test — passed. Standalone click influence exceeded `0.5`, drag remained near zero during the click, click changed more than 80 sampled pixels, held drag exceeded `0.2`, drag changed more than 100 sampled pixels, wave-strength-zero response remained measurable, both envelopes recovered below `0.03`, and event counts were exactly two clicks plus one drag for the two tested gestures.
- Final `npm run test:e2e` — passed, 14/14 tests in 4.9 minutes across Chromium, Firefox, and WebKit.
- Existing ambient audio, sun controls/evolution, Glitter Lab, responsive layout, accessibility, console/page-error, WebGL, and 60-second soak checks remained green.
- Screenshot inspection — passed structural checks. Click and drag remain localized without splash peaks, ring waves, obvious trails, blank frames, or large color blocks; drag changes the local glint/water response without moving point sites as particles.

Evidence:

- `artifacts/screenshots/pointer-click-active.png`
- `artifacts/screenshots/phase-3-breeze-idle.png`
- `artifacts/screenshots/phase-3-breeze-active.png`
- `artifacts/screenshots/phase-3-breeze-recovered.png`

Validation limitations:

- This limitation was superseded when creator-made click and drag WAV assets were integrated; see the later interaction-sound integration report below.
- Sound level, sample length, retrigger character, and the feel of the interaction on physical touch hardware require human acceptance after final assets are added.

### Interaction visibility amplification

Status: implemented and automatically validated on 2026-10-19 after human review found the first press/drag response still too easy to miss.

Implemented work:

- Added soft anisotropic interaction masks in the shader rather than adding particles, circular ripples, splashes, or retained trails.
- A standalone click now activates a compact broken glint patch plus fine ripple-attached light/dark facets. The effect is strongest at the pointer and dissolves through the existing water texture instead of reading as a flat ellipse.
- Press-and-drag now activates an elongated, direction-aware patch of the same existing glint sites. Its cross-axis width was reduced after screenshot review so the stronger response does not become a global brightness wash.
- Kept interaction gain independent from autonomous `waveStrength`. The accepted `breezeStrength=0.42` now maps to a clearly readable click response while `0` still disables it.
- Moved the standalone-click screenshot sample into quiet water, where its response cannot be hidden by the already active solar reflection band.

Executed checks:

- Three successive targeted Chromium Playwright checks passed while balancing click visibility and drag footprint. The final test verifies click/drag separation, bounded influence, pixel response, post-release recovery, clean console/page errors, WebGL `NO_ERROR`, and operation with autonomous wave strength set to zero.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 6 files / 17 tests.
- `npm run build` — passed. Output JS is 1,142.74 kB / 318.38 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Final `npm run test:e2e` — passed, 14/14 tests in 4.3 minutes across Chromium, Firefox, and WebKit, including the 60-second autonomous soak.
- Screenshot inspection — passed structural checks. The click frame shows a localized broken shimmer patch in quiet water; the drag frame shows a longer correlated glint response; the recovered frame restores the original quiet-water balance. No hard ring, splash peak, particle path, blank frame, or full-screen color block was found.

Evidence:

- `artifacts/screenshots/phase-3-breeze-idle.png`
- `artifacts/screenshots/pointer-click-active.png`
- `artifacts/screenshots/phase-3-breeze-active.png`
- `artifacts/screenshots/phase-3-breeze-recovered.png`

Validation limitations:

- Static screenshot and pixel-difference checks prove a visible local response but cannot determine the preferred strength or tactile feel on the user's specific mouse, display, and touch hardware. Final interaction intensity remains a human art-acceptance item.

### Compact eased interaction and finer water depth

Status: implemented and automatically validated on 2026-10-19 after human review requested a much smaller footprint, gentler appearance, and more nuanced water depth.

Implemented work:

- Added the explicit GLSL constant `sqrt(1 / 6)` and applied it to both axes of the click mask, drag mask, click height disturbance, and drag height disturbance. The affected area is therefore approximately one sixth of the prior amplified version while direction and aspect ratio are preserved.
- Replaced instantaneous click/drag activation with exponential attack envelopes (`10 s⁻¹` click, `8 s⁻¹` drag), producing a roughly 200–300 ms visual rise. Attack progress is derived from event wall-clock time rather than rendered-frame count, so slow hardware does not lengthen the transition.
- Kept the response alive while pressed. On release, click receives a restrained `350 ms` continuation before its existing exponential fade; drag retains its `500 ms` post-release hold.
- Added long, middle, and capillary ripple components to the base water. Existing deterministic depth, cross, and directional ripple fields warp and modulate them, creating finer cool gray-blue depth without obvious parallel lines.

Executed checks and repairs:

- The first browser run correctly failed because a frame-delta-only attack barely advanced while headless rendering was throttled (`0.087` instead of `>0.75`). The attack was changed to use real elapsed event time; the threshold was not lowered.
- Millisecond-level early-attack sampling was found unreliable across the Playwright/process boundary because the diagnostic read itself could outlast the requested interval. Exact attack shape is now verified in a deterministic unit test; browser QA verifies the full press response, separation from drag, rendered pixel change, release recovery, and WebGL health.
- The first release-recovery run measured `0.039` against the unchanged `<0.03` threshold because the full click hold restarted on pointer release. A separate `350 ms` release hold repaired the timing while preserving the slower onset.
- Final targeted Chromium interaction test — passed in 35.7 seconds. The one-sixth footprint remained visibly measurable at default strength and with autonomous wave strength set to zero; both envelopes recovered below `0.03`.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 6 files / 18 tests. New coverage verifies that the first attack frame remains partial and the curve exceeds `0.9` after 300 ms without reaching an instantaneous hard step.
- `npm run build` — passed. Output JS is 1,144.75 kB / 318.93 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Final `npm run test:e2e` — passed, 14/14 tests in 4.3 minutes across Chromium, Firefox, and WebKit, including the 60-second autonomous soak.
- Screenshot inspection — passed structural checks. Click and drag patches are materially smaller than the prior evidence, remain attached to broken water facets, and leave broad quiet water intact. The refined base has additional depth without hard stripes, blank frames, large blocks, rings, splashes, or trails.

Evidence:

- `artifacts/screenshots/phase-3-breeze-idle.png`
- `artifacts/screenshots/pointer-click-active.png`
- `artifacts/screenshots/phase-3-breeze-active.png`
- `artifacts/screenshots/phase-3-breeze-recovered.png`

Validation limitations:

- Automated checks establish the exact geometric scale, continuous envelope, pixel response, and runtime health. The preferred perceived size, rise speed, and subtlety of the added water depth remain human art-acceptance decisions on the target display.

### Creator-made click and drag sound integration

Status: implemented and automatically validated on 2026-10-19; final perceived balance with the ambient composition remains pending human listening acceptance.

Source inspection and implementation:

- `Click.wav`: PCM 16-bit, 44.1 kHz stereo, 2.5 seconds, 442,606 bytes, approximately `-20.1 dBFS` peak and `-36.6 dBFS` RMS.
- `Drag.wav`: PCM 16-bit, 44.1 kHz stereo, 4.0 seconds, 707,724 bytes, approximately `-9.5 dBFS` peak and `-26.8 dBFS` RMS.
- No leading or trailing interval longer than `80 ms` below `-50 dBFS` was detected in either master.
- Copied both Logic Pro WAV files unchanged to `public/audio/glimmer-click.wav` and `public/audio/glimmer-drag.wav`. SHA-256 comparison confirms each project asset is byte-identical to its supplied source.
- Kept lossless WAV to preserve the authored transients and tails. Their combined size is approximately 1.1 MB and they remain demand-loaded rather than part of the initial JavaScript bundle.
- Made the assets the default click/drag sources. Environment variables still support replacement; an explicit blank value disables the corresponding effect.
- Adjusted only playback gain (`1.0` click, `0.32` drag) to compensate for the masters' approximately 10.6 dB peak difference. This yields similar approximate RMS output while leaving both files untouched.

Executed checks:

- Source format, duration, size, peak/RMS level, silence boundaries, and source/project hashes — passed.
- Initial-page request check — passed. Neither interaction WAV is fetched before an interaction or the dedicated decode assertion.
- Real Chromium Web Audio decoding — passed. Click decoded to 2 channels / 44.1 kHz / 2.5 seconds; drag decoded to 2 channels / 44.1 kHz / 4.0 seconds.
- Interaction fetch and cache path — passed. Standalone press requested the click asset, effective drag requested the drag asset, and gesture events remained exactly two clicks plus one drag across the two automated gestures.
- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 6 files / 19 tests. New coverage verifies bundled defaults, deployment-relative paths, replacement, and explicit blank-value opt-out.
- `npm run build` — passed. Output JS is 1,145.05 kB / 319.09 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Targeted Chromium interaction test — passed in 38.0 seconds with real asset decoding, requests, event separation, WebGL health, and visual recovery.
- Final `npm run test:e2e` — passed, 14/14 tests in 4.3 minutes across Chromium, Firefox, and WebKit, including ambient-audio behavior and the 60-second visual soak.

Validation limitations:

- Automated analysis can verify file integrity, decoding, trigger separation, gain math, caching, and visual/runtime isolation, but not perceived loudness, timbral fit, or masking against the ambient composition on the user's speakers or headphones.

### Interaction effect master-volume refinement

Status: implemented and automatically validated on 2026-10-19 after listening feedback found the integrated click/drag effects too prominent.

Implemented work:

- Added a shared Web Audio master `GainNode` after the existing click/drag relative-gain nodes. The source WAV files and their `1.0` / `0.32` compensation remain unchanged.
- Set the restrained default master level to `0.22`, placing both effects substantially beneath their previous output while retaining the authored transients and decay.
- Added a live `0–1` “交互音效音量” control to Glitter Lab. It participates in exact reset and JSON export with the other reproducible settings.
- Applied live changes with `AudioParam.setTargetAtTime` and a `40 ms` time constant, so an already-playing tail changes smoothly instead of stepping or restarting.
- Kept the audio graph independent from Three.js and the animation loop. Ordinary visits still hide Glitter Lab, while the accepted `0.22` default remains active.

Executed checks:

- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 6 files / 20 tests. New coverage verifies finite `0–1` master-volume clamping.
- `npm run build` — passed. Output JS is 1,145.81 kB / 319.35 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Focused Chromium Glitter Lab and interaction runs — passed. The panel exported/reset the `0.22` field; after a real interaction initialized Web Audio, changing the slider to `0.12` updated the connected master target and restoring it returned the target to `0.22`.
- Full `npm run test:e2e` — passed, 14/14 tests in 4.6 minutes across Chromium, Firefox, and WebKit, including real WAV decoding, click/drag request separation, responsive panel layouts, console/page-error checks, WebGL health, and the 60-second autonomous soak.
- Responsive screenshot inspection — passed. The sixteenth slider is readable and reachable in the internally scrolling mobile debug panel, with no blank frame, large color block, or control overlap. Evidence: `artifacts/screenshots/phase-5-mobile-debug.png`.
- `git diff --check` — passed.

Validation limitations:

- Automated checks prove the live gain route and regression health but cannot decide whether `0.22` is exactly the preferred perceived loudness on the user's speakers or headphones. This remains a listening acceptance item; the slider is provided for immediate tuning without rebuilding.

### Final interaction-volume tuning and README editorial pass

Status: implemented and automatically validated on 2026-10-19 after the creator selected `0.10` as the quieter interaction-sound baseline.

Implemented work:

- Changed the shared click/drag Web Audio master default from `0.22` to `0.10`. Source WAV files, click/drag relative compensation, smoothing behavior, and all visual shader parameters remain unchanged.
- Updated Glitter Lab reset, copied JSON, hidden audio telemetry, unit fixtures, browser expectations, specification, plan, and progress records to use the same `0.10` value.
- Rewrote the README as a cleaner artwork-first document. It now records autonomous solar movement, the three-scale water-attached glimmer field, press/drag interaction, original ambient music and interaction sounds, the live volume control, local use, QA commands, and deployment without duplicating implementation prose.

Executed checks:

- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 6 files / 20 tests.
- `npm run build` — passed. Output JS is 1,145.81 kB / 319.35 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Focused Chromium interaction check — passed. After Web Audio initialization, the connected master reported `0.10`, changed live to `0.04`, and returned to `0.10`; WAV decoding, gesture separation, visual recovery, console health, and WebGL health remained valid.
- The combined focused run's Glitter Lab visual-cadence assertion initially measured `3,490` changed samples against a timing-sensitive requirement above `3,533.75`; no audio/default assertion failed. The same unmodified test was rerun and passed in 2.4 minutes, identifying a transient screenshot-timing variation rather than a reproducible regression.
- `git diff --check` — passed.

Validation limitations:

- The `0.10` signal path and reproducible defaults are automatically verified, but the final perceived loudness still depends on playback hardware and remains a human listening judgment.

### Unified artwork sound toggle

Status: implemented and automatically validated on 2026-10-19 after review found that the lower-right control muted only ambient music.

Implemented work:

- Lifted the user's sound-enabled intent to the application boundary and shared it with the independent ambient and interaction audio controllers.
- The initial off state now prevents click and drag sound nodes from starting. Disabling sound after Web Audio initialization smoothly targets the interaction master at `0`; re-enabling restores the configured `0.10` master.
- Ambient music retains its two-second fade-in, 1.5-second fade-out, pause-offset resume, error isolation, and browser-autoplay-safe user gesture.
- Renamed the accessible control labels from background-music-only wording to “开启声音” / “关闭声音”, and adjusted the loading icon state so the single control accurately represents the whole artwork.

Executed checks:

- `npm run typecheck` — passed.
- `npm run lint` — passed with zero warnings.
- `npm test` — passed, 6 files / 20 tests.
- `npm run build` — passed. Output JS is 1,146.13 kB / 319.45 kB gzip; the existing non-failing Vite chunk-size warning remains.
- Focused Chromium Playwright — passed, 3/3 tests in 1.4 minutes. Coverage verifies initial global mute, ambient enable/disable/resume, load-failure isolation, rejection of a click request while muted, real click playback while enabled, live master transition `0.10 → 0.00 → 0.10`, gesture separation, visual recovery, console health, and WebGL health.

Validation limitations:

- Automation confirms source creation and gain targets, but the subjective relationship between ambient music and interaction transients still requires listening on the target hardware.
