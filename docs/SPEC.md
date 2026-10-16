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
- Implemented live parameters are density, size, flicker speed, highlight intensity, fine-point ratio, clustering, bright-layer halo intensity, wave strength, water-depth contrast, main reflection-band width, and local flicker correlation.
- The current defaults use the latest supplied tuning (`density 0.87`, `size 1.65`, `flickerSpeed 6`, `highlightIntensity 2.53`, `clustering 0`, `bloomIntensity 0.66`, `waveStrength 0.38`, `finePointRatio 0.96`, `waterContrast 1.6`, reflection-band width `0.82`, and local correlation `0.7`).
- Flicker speed ranges from `0.1` to `10`. Both point-level envelopes and smooth neighborhood pulses respond to it; values above the default `6` are an exploratory development range.
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
- Density is `0.87` by default; the reflection envelope and surface attachment still prevent this from becoming a uniform full-screen field.

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
