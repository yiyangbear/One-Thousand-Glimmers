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

## Glitter Lab development milestone

- Ordinary visits keep the artwork free of UI. `?debug=true` reveals a restrained, collapsible panel in the upper-right corner.
- Implemented live parameters are density, size, flicker speed, sun elevation, sun azimuth, sun intensity, highlight-response gain, fine-point ratio, clustering, bright-layer halo intensity, wave strength, pointer-breeze strength, water-depth contrast, main reflection-band width, and local flicker correlation.
- The current visual defaults use the latest supplied tuning (`density 1.23`, `size 1.65`, `flickerSpeed 7.5`, `highlightIntensity 2.65`, `clustering 0`, `bloomIntensity 0.66`, `waveStrength 0.42`, `finePointRatio 1.16`, `waterContrast 1.6`, reflection-band width `0.82`, and local correlation `0.7`). Phase 2 adds an art-directed default sun at elevation `24°`, azimuth `28°`, and intensity `1`.
- Flicker speed ranges from `0.1` to `10`. Both point-level envelopes and smooth neighborhood pulses respond to it; values above the default `7.5` are an exploratory development range.
- The temporal envelope combines broad, secondary, slow-drift, and low-amplitude high-frequency components. Faster settings must preserve continuous easing and unsynchronized local detail rather than becoming binary opacity toggles.
- Reset restores those exact defaults. Copy exports the current parameters as formatted JSON.
- Pointer breeze strength is shown as unavailable until Phase 3 and must not be represented by an inactive or misleading slider.
- Control changes update the active `ShaderMaterial` uniforms without a reload or material recompilation.

## Visual-refactor requirements

- Replace the repeated elongated-facet field with three deterministic, spatially stable point layers: dense fine points, a lower-count medium layer, and rare bright focal points.
- Fine and medium layers use near-circular cores with small controlled irregularity; no grid boundaries, crosses, star sprites, or obvious ellipses may appear.
- Each scale has a distinct compound temporal envelope. Time changes intensity only; sampling positions remain fixed.
- Halo energy comes only from the rare bright layer and is gated by its strongest moments.
- Water uses a deeper cool blue-gray/cyan-gray palette plus low-, middle-, and fine-scale tonal variation. Surface normals remain subtly perceptible without explicit wave lines.

## Sun-glitter spatial-organization requirements

- A tapered soft reflection envelope concentrates nearly all glints into an off-center active band; outside it, only a near-zero residual candidate rate remains.
- A deterministic broken-field mask creates gaps, strings, and local patches inside the band without a hard silhouette.
- Candidate activation depends on the same directional ripple field and approximate surface slope that shade the water.
- Smooth low-frequency neighborhood pulses correlate nearby glints while retaining point-level phases and scale-specific timing.
- Density is `1.23` by default; the reflection envelope and surface attachment still prevent this from becoming a uniform full-screen field.

## Phase 2 sun-model requirements

- Sun elevation ranges from `5–75°`, azimuth from `-70–70°`, and intensity from `0.2–2`.
- Azimuth shifts and tilts the reflection band and rotates the slope target used for specular eligibility.
- Elevation changes the near/far fade positions, band width, target slope magnitude, density response, and restrained warm-light bias.
- Intensity changes both the activity threshold of candidate facets and final highlight radiance; it is distinct from the artistic highlight-response gain.
- All three controls update the active shader uniforms immediately without recompilation.

## Phase 3 pointer-breeze requirements

- Pointer movement maps to normalized water coordinates and a bounded directional impulse; sparse browser events use distance as a fallback to velocity.
- The disturbance uses an elliptical spatial falloff aligned to pointer direction and two low-amplitude wave components, never a radial ring function.
- Input influence is capped at `1`, held for 180 ms, then decays exponentially. Pointer leave stops sampling but does not snap the current response to zero.
- The default breeze-strength multiplier is `0.42`, adjustable from `0–1` in Glitter Lab.
- The disturbance enters the existing height field, so water slopes and attached highlights respond together.

## Later-phase requirements

- Phase 4: restrained glow, rhythm tuning, performance scaling, final visual polish.
- Phase 5: expanded tests, cross-browser/responsive verification, accessibility/deployment readiness.

## Quality targets

- No uncaught page errors or WebGL errors in the supported QA browser.
- TypeScript, lint, unit tests, and production build pass.
- Screenshot evidence exists for each applicable acceptance state.
- Target smooth interaction on modern desktop hardware; quality should degrade by resolution scaling rather than changing the artistic logic.
