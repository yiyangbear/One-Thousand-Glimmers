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

- Track bounded pointer velocity and feed a local disturbance field.
- Add spatial and temporal decay; verify idle recovery and absence of trails/rings.

## Phase 4 — Polish and performance

- Tune highlight distribution, temporal envelopes, subtle glow, color, and tone mapping.
- Add adaptive resolution/performance checks without weakening the visual model.

## Phase 5 — Release readiness

- Expand logic/browser coverage, responsive/accessibility review, documentation, and deployment preparation.
- Complete final human art acceptance and document remaining platform limits.
