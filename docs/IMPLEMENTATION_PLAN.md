# Implementation Plan

## Phase 0 — Foundation and shared context

Deliverables:

- Initialize Git and a Vite/React/TypeScript project.
- Add project scripts, linting, deterministic unit-test support, and directory structure.
- Create the six long-term project documents.

Acceptance:

- Required documents exist and agree on scope.
- Dependencies install reproducibly.
- Baseline typecheck, lint, tests, and production build pass.
- Phase 0 is recorded in its own commit.

## Phase 1 — Minimum visual prototype

Deliverables:

- Full-screen WebGL river.
- Multi-scale procedural water height field and normal-derived shading.
- Deterministic clustered reflection sites with local continuous flicker.
- Minimal loading/error surface only; no control panel.

Acceptance:

- Autonomous image is visible in a local browser.
- Glimmers largely brighten and fade in place, with uneven density and scale.
- No obvious global flashing, particle drift, pure-black background, or dominant wave lines.
- Typecheck, lint, unit tests, production build, browser console check, and screenshot smoke analysis pass.
- Normal-state screenshots are saved; subjective art quality is explicitly left for human review.
- Phase 1 is recorded in its own commit, then development pauses.

## Phase 2 — Sun model and controls

Deliverables:

- Introduce sun elevation, azimuth, and intensity uniforms.
- Derive reflection-band position, tilt, width, length, slope target, activity, warmth, and radiance from the sun controls.
- Extend the existing `?debug=true` Glitter Lab with restrained sun controls while keeping normal visits free of UI.
- Add automated pixel-level parameter-response checks and state screenshots.

Acceptance:

- Azimuth produces a clear horizontal reflection-band displacement rather than changing particle count alone.
- Elevation changes the band footprint and target surface slope.
- Intensity changes both visible-facet activity and highlight radiance.
- Typecheck, lint, unit tests, production build, browser console/WebGL checks, and parameter-state screenshots pass.
- Phase 2 is recorded in its own commit, then development pauses for human acceptance.

## Interim milestone — Glitter Lab

This user-requested development tool is implemented after Phase 1 and does not begin Phase 2.

- Add a `?debug=true`-gated, collapsible live parameter panel.
- Preserve the Phase 1 image at default values.
- Wire only implemented controls to active WebGL uniforms; label pointer breeze as pending.
- Verify actual final-frame pixel changes, JSON copy/reset behavior, hidden normal mode, console health, and WebGL health with Playwright.
- Pause again for human acceptance; do not continue into Phase 2.

## Interim milestone — Visual refactor

This user-requested revision follows Glitter Lab and remains outside Phase 2.

- Replace single-scale elongated glints with three near-circular, stable spatial layers.
- Increase the fine-point population while preserving clustered reflection geometry and negative space.
- Use compound, scale-specific temporal envelopes and reserve halo energy for rare bright events.
- Deepen and layer the river color/texture without drawing wave lines.
- Add fine-point ratio and water-depth contrast controls to Glitter Lab.
- Save default, recommended, and detail screenshots; rerun the full QA workflow and pause for art acceptance.

## Interim milestone — Sun-glitter spatial organization

This user-requested revision follows the point-shape refactor and remains outside Phase 2.

- Replace the remaining full-screen fine-point floor with a soft, tapered reflection region and near-empty outskirts.
- Derive broken patches and point eligibility from directional ripples, surface slope, and deterministic low-frequency fields.
- Blend individual flicker with smooth neighborhood pulses so nearby sites become active together.
- Add reflection-band width and local-correlation controls without relying on a global density increase as the spatial model.
- Save default, recommended, and detail screenshots; rerun the full QA workflow and pause for art acceptance.

## Phase 3 — Pointer breeze

Deliverables:

- Track pointer position plus speed/distance-derived bounded motion impulses without per-frame allocation.
- Feed a local, directionally stretched disturbance into the continuous water height field.
- Add spatial Gaussian-like falloff, a short event hold, and exponential temporal decay.
- Replace Glitter Lab's pending label with a live breeze-strength control.

Acceptance:

- Fast pointer motion produces a measurable local final-frame response at the accepted default `waveStrength` and `breezeStrength` values while internal influence remains `≤1`.
- Pointer response is not multiplied by `waveStrength`; lowering autonomous wave strength must not silently disable the breeze.
- Influence decays below `0.03` after the automated idle interval.
- No circular rings, splash peaks, jelly deformation, hard trails, or global brightness shift appear in screenshots.
- Typecheck, lint, unit tests, production build, browser console/WebGL checks, pixel response, and idle-recovery checks pass.
- Phase 3 is recorded in its own commit, then development pauses for human acceptance.

## Phase 4 — Polish and performance

Deliverables:

- Refine only the rare bright layer into a crisp peak plus restrained near/far glow; keep fine and medium points free of universal bloom.
- Preserve highlight hue with luminance-based tone mapping rather than independent channel compression.
- Remove avoidable idle-pointer and repeated sun-slope shader work without changing the procedural model.
- Add a bounded, hysteresis-based adaptive DPR controller that reacts to sustained frame pressure rather than single slow frames.

Acceptance:

- Default composition, accepted parameter values, tapered reflection band, and quiet-water negative space remain intact.
- Glow remains confined to rare bright events with no broad white haze or enlarged copy around most points.
- DPR stays within `1–1.75`, requires sustained slow/fast sample windows to change, and exposes browser-readable QA telemetry.
- Typecheck, lint, unit tests, production build, browser console/WebGL checks, screenshots, and structural visual inspection pass.
- Phase 4 is recorded in its own commit, then development pauses for human acceptance.

## Phase 5 — Release readiness

Deliverables:

- Add Chromium full regression plus lightweight Firefox/WebKit WebGL smoke coverage.
- Verify narrow portrait and short landscape layouts, safe panel scrolling, and full-viewport canvas coverage.
- Verify keyboard-operable Glitter Lab, visible focus, semantic labels, reduced-motion pacing, and renderer fallback semantics.
- Run a 60-second browser soak for autonomous evolution, console/page errors, WebGL health, and quality telemetry.
- Prepare a repository-relative Vite build, GitHub Pages Actions workflow, README, and durable Chinese deployment guide.

Acceptance:

- Typecheck, lint, unit tests, production build, responsive/accessibility checks, Chromium regression, and 60-second soak pass.
- Firefox and WebKit checks pass when their Playwright runtimes are available; missing runtimes are recorded as a limitation rather than reported as passing.
- The production artifact resolves assets beneath `/One-Thousand-Glimmers/` for project Pages deployment.
- Release documents describe local use, known limitations, GitHub push, Pages setup, deployment verification, and rollback.
- Phase 5 is recorded in its own commit. Final subjective art acceptance remains explicitly human-owned.

## Post-release refinement — Autonomous sun azimuth

Deliverables:

- Treat the Glitter Lab azimuth as an art-directed center and derive a slow autonomous azimuth from visible-session time.
- Use deterministic, long, mismatched cycles so the motion remains continuous without an obvious short loop.
- Advance from visible wall-clock time rather than frame count, pause accumulation while the page is hidden, and slow the evolution under `prefers-reduced-motion`.
- Expose current/center azimuth telemetry on the canvas and add unit plus cross-browser checks.

Acceptance:

- The default starts at the accepted `28°` center, changes by less than `1°` during the initial automated observation window, and reaches more than `12°` of displacement after one simulated minute.
- Automatic movement stays inside the supported `-70–70°` shader range and does not replace manual center control.
- Typecheck, lint, unit tests, production build, all existing Playwright checks, browser console/WebGL checks, and the 60-second soak pass.
- Long-viewing pace and naturalness remain a human art-acceptance item.

## Post-release refinement — Press and drag water interaction

Deliverables:

- Replace hover-driven breeze activation with primary pointer press, capture, drag, release, and cancel semantics.
- Add a visible standalone press response plus a directionally stretched drag response driven by speed and cumulative gesture distance.
- Couple the readable response to broken existing glint sites and water-ripple facets so stronger feedback still appears to emerge from the river rather than from an overlay.
- Keep the accepted interaction readable after reducing its footprint area to one sixth, and ease both click and drag strength in over a short time-based attack rather than switching them on in one frame.
- Refine water depth with multiple low-contrast directional scales whose phase and amplitude are broken by the existing procedural depth fields; avoid visible stripe patterns.
- Keep drag strength stable while pressed, then hold briefly and decay without rings, splashes, or retained trails.
- Emit separate click/drag sound events and play the bundled creator-made WAV effects through an independent Web Audio one-shot player, with environment-variable replacement or opt-out support.
- Route both effects through a smoothed master gain, default it to a barely audible `0.10`, and expose that gain as a live `0–1` Glitter Lab control without coupling it to the shader loop.
- Share the lower-right sound-toggle intent with the interaction-audio bridge so one visible control mutes or enables every audible layer.

Acceptance:

- A standalone click changes the rendered pixels at the accepted default breeze strength while drag influence stays near zero.
- A press-and-drag gesture produces bounded drag influence and a measurable frame response even when autonomous `waveStrength` is zero.
- Both envelopes recover below `0.03`, and exactly one click plus at most one drag sound request is emitted per gesture.
- With sound variables unset, no interaction audio resource is requested and the artwork remains silent.
- Changing interaction-sound volume after Web Audio initialization updates the connected master gain immediately without restarting or reloading either sound.
- With the lower-right control off, click/drag events start no audio source; disabling it after initialization smoothly targets interaction gain zero, and enabling it restores the configured master level.
- Typecheck, lint, unit tests, production build, browser console/WebGL checks, screenshots, and full cross-browser regression pass.
