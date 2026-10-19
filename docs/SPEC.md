# Product and Visual Specification

## Experience

- The page immediately renders a full-viewport river surface.
- Autonomous animation continues indefinitely without pointer input.
- Resize and device-pixel-ratio changes preserve full-screen coverage.
- The first milestone contains no complex UI, sound, architecture, window frame, or narrative text.

## Original ambient music

- The artwork is silent on load. A minimal lower-right control starts the creator's original ambient score only after an explicit user gesture.
- Playback loops, fades in over approximately 2 seconds, fades out over approximately 1.5 seconds, and resumes from the paused position.
- Audio ownership is independent of the WebGL render loop. Load or playback failure must not interrupt the visual artwork.
- A restrained Credits disclosure identifies the music as composed and produced by the creator of One Thousand Glimmers.

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
- Implemented live parameters are density, size, flicker speed, sun elevation, sun azimuth, sun intensity, highlight-response gain, fine-point ratio, clustering, bright-layer halo intensity, wave strength, pointer-breeze strength, interaction-sound volume, water-depth contrast, main reflection-band width, and local flicker correlation.
- The current visual defaults use the latest supplied tuning (`density 1.23`, `size 1.65`, `flickerSpeed 7.5`, `highlightIntensity 2.65`, `clustering 0`, `bloomIntensity 0.66`, `waveStrength 0.42`, `finePointRatio 1.16`, `waterContrast 1.6`, reflection-band width `0.82`, and local correlation `0.7`). Phase 2 adds an art-directed default sun at elevation `24°`, azimuth `28°`, and intensity `1`.
- Flicker speed ranges from `0.1` to `10`. Both point-level envelopes and smooth neighborhood pulses respond to it; values above the default `7.5` are an exploratory development range.
- The temporal envelope combines broad, secondary, slow-drift, and low-amplitude high-frequency components. Faster settings must preserve continuous easing and unsynchronized local detail rather than becoming binary opacity toggles.
- Reset restores those exact defaults. Copy exports the current parameters as formatted JSON.
- Pointer breeze strength is shown as unavailable until Phase 3 and must not be represented by an inactive or misleading slider.
- Visual control changes update the active `ShaderMaterial` uniforms without a reload or material recompilation; interaction volume updates the independent Web Audio master gain without touching the render loop.

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
- The azimuth control defines the center of an autonomous drift rather than a frozen value. While the page remains visibly active, azimuth evolves deterministically within approximately `±24°` using two long, mismatched cycles; the reflection envelope uses a strengthened but still soft horizontal/tilt response so the change is legible over several minutes. Motion uses visible wall-clock time rather than frame count, hidden-tab time is not accumulated, and reduced-motion preference slows this drift to `0.35×`.

## Phase 3 pointer-breeze requirements

- Press-and-drag movement maps to normalized water coordinates and a bounded directional impulse; sparse browser events use cumulative distance as a fallback to velocity.
- The disturbance uses a soft anisotropic spatial falloff aligned to pointer or water direction and low-amplitude facet components, never a radial ring function.
- Input influence is capped at `1`. A click holds for `900 ms`; drag remains stable while pressed and receives a `500 ms` post-release hold, then both decay continuously over roughly 1–2 seconds.
- The default breeze-strength multiplier is `0.42`, adjustable from `0–1` in Glitter Lab.
- Pointer interaction is press-gated: a standalone primary press produces a localized directional facet disturbance, while holding and moving produces a broader drag breeze based on both speed and accumulated gesture distance. Hover-only movement has no effect.
- Click and drag interaction masks scale both axes by `sqrt(1 / 6)`, reducing their affected area to approximately one sixth of the previously accepted amplified version while preserving direction and aspect ratio.
- Interaction strength uses a time-based eased attack rather than an instantaneous step. Click reaches its visual peak over roughly 200–300 ms; drag follows a similarly restrained rise and remains independent of render frame rate.
- Press and drag have separate envelopes. A press holds briefly before fading; drag remains active while held, then uses a short post-release hold and approximately one-to-two-second exponential decay.
- Press and drag emit separate sound requests. The bundled creator-made `glimmer-click.wav` and `glimmer-drag.wav` files are the defaults; `VITE_POINTER_CLICK_SOUND` and `VITE_POINTER_DRAG_SOUND` can replace them with filenames beneath `public/audio/`, while explicit blank values disable the corresponding sound.
- Click and drag retain their relative level compensation, then pass through a shared Web Audio master gain. Its quiet default is `0.10`; Glitter Lab adjusts it live from `0–1` with a short smoothing ramp so active tails do not jump in level.
- Interaction effects remain demand-loaded and independent from the shader loop. Opening the page requests and plays neither effect; click and effective drag gestures load their own decoded buffers on first use and reuse them afterward.
- The lower-right sound control is the artwork-wide mute. Its default-off state suppresses ambient music and rejects click/drag playback requests; enabling it activates both, and disabling it smoothly drives the interaction master to zero while the ambient track follows its existing fade-out.
- The disturbance enters the existing height field and also modulates the same broken glint sites and ripple-facet texture, so the readable response emerges from the water rather than a visual overlay.
- The water base combines broad depth variation with three low-contrast directional ripple scales, including a subdued capillary layer. Depth and cross fields warp and modulate these layers so they do not read as repeated wave lines.

## Later-phase requirements

- Phase 4: restrained glow, rhythm tuning, performance scaling, final visual polish.
- Phase 5: expanded tests, cross-browser/responsive verification, accessibility/deployment readiness.

## Phase 5 release requirements

- Normal visits remain a full-screen artwork with no release UI or narrative overlay.
- Glitter Lab remains keyboard-operable, viewport-contained, and internally scrollable on narrow portrait and short landscape screens.
- Reduced-motion preference lowers autonomous time progression to `0.35×` while preserving quiet ongoing change.
- Automated release checks include a 60-second Chromium soak plus lightweight Firefox/WebKit WebGL and responsive smoke tests when those runtimes are available.
- GitHub Pages builds use the repository base path and deploy the generated `dist` artifact through GitHub Actions.

## Quality targets

- No uncaught page errors or WebGL errors in the supported QA browser.
- TypeScript, lint, unit tests, and production build pass.
- Screenshot evidence exists for each applicable acceptance state.
- Target smooth interaction on modern desktop hardware; quality should degrade by resolution scaling rather than changing the artistic logic.
