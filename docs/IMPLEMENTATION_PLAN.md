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

- Introduce sun elevation, azimuth, and intensity uniforms.
- Derive the reflection band and specular response from light/view orientation.
- Add a restrained, hideable debug panel and automated parameter-state screenshots.

## Phase 3 — Pointer breeze

- Track bounded pointer velocity and feed a local disturbance field.
- Add spatial and temporal decay; verify idle recovery and absence of trails/rings.

## Phase 4 — Polish and performance

- Tune highlight distribution, temporal envelopes, subtle glow, color, and tone mapping.
- Add adaptive resolution/performance checks without weakening the visual model.

## Phase 5 — Release readiness

- Expand logic/browser coverage, responsive/accessibility review, documentation, and deployment preparation.
- Complete final human art acceptance and document remaining platform limits.

