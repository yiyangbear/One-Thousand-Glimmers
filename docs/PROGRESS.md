# Progress

## Current milestone

Phase 5 release preparation and the original ambient-music integration are complete. Post-release refinement now includes autonomous solar movement plus compact, eased, water-attached press/drag interaction with two creator-made WAV effects and a restrained live master-volume control; automated checks pass, while final interaction mix and long-viewing naturalness remain pending human acceptance.

## Completed

- Captured art direction, requirements, implementation stages, QA process, and durable agent constraints.
- Initialized Git plus the Vite/React/TypeScript/Three.js toolchain.
- Added ESLint, Vitest, Playwright configuration, and deterministic sampling helpers.
- Passed the Phase 0 document, type, lint, unit-test, security-audit, and production-build checks.
- Built a full-screen Three.js/GLSL river with continuous multi-scale water evolution.
- Added deterministic, spatially stable glimmer sites, a broken directional reflection band, independent temporal envelopes, rare brighter facets, and reduced-motion pacing.
- Added Playwright coverage for full-screen layout, console/page errors, WebGL error state, and two normal-state screenshots.
- Saved Phase 1 evidence under `artifacts/screenshots/` and opened a local preview at `http://127.0.0.1:5173/`.
- Added the `?debug=true` Glitter Lab with nine live shader controls, collapse/expand behavior, exact default reset, and JSON clipboard export.
- Clearly marked pointer breeze strength as unavailable until Phase 3, without rendering a nonfunctional input.
- Preserved the prior artwork as the control defaults and kept ordinary visits free of development UI.
- Added Playwright verification for final-frame pixel response, hidden normal mode, clipboard output, reset, collapse/expand, console health, and WebGL health.
- Rebuilt the reflection field as three stable scales: thousands of fine point candidates, a medium rhythm layer, and rare bright focal glints.
- Replaced simple sine-opacity blinking with scale-specific compound temporal envelopes while keeping positions fixed.
- Restricted soft halo energy to the rare bright layer and changed the default glow to a restrained `0.32`.
- Deepened the base water and added slow low-frequency depth, cross-scale mottling, micro variation, and subtly warped multi-directional waves.
- Added fine-point ratio and water-depth contrast to Glitter Lab; saved default, recommended, and detail evidence screenshots.
- Adopted the supplied parameter set as the new default without raising density beyond `0.72`.
- Replaced the remaining full-screen fine-point floor with a tapered, off-center reflection band whose outskirts are almost empty.
- Coupled glint eligibility to directional ripples, approximate slope/specular matching, and a deterministic broken patch field.
- Added spatially smooth neighborhood pulses so adjacent glints share part of their timing while retaining individual phases.
- Added live reflection-band width and local-correlation controls to Glitter Lab, bringing the implemented total to eleven.
- Strengthened subtle gray-blue/cyan-gray directional water structure and saved three new visual-evidence screenshots.
- Applied the latest supplied tuning as defaults, including reduced density `0.61`, larger point scale `1.65`, lower wave strength `0.36`, and flicker speed `3`.
- Expanded Glitter Lab's flicker-speed range from `3` to `6` and raised both point-level and neighborhood-pulse temporal frequencies.
- Added a browser time-difference assertion proving that speed `6` changes materially more highlight pixels than speed `0.1` over the same interval.
- Adopted the latest supplied tuning as defaults: density `0.87`, speed `6`, bloom `0.66`, wave strength `0.38`, and reflection-band width `0.82`.
- Expanded the experimental speed ceiling from `6` to `10` and refined the shader envelope with a restrained high-frequency component plus a secondary harmonic in the regional pulse.
- Narrowed the smooth transition windows so brightness gradients complete sooner while retaining continuous eased edges and multi-rate detail.
- Revalidated dynamic cadence, reset/export behavior, screenshots, console health, and WebGL state in Playwright on 2026-10-16.
- Adopted the latest supplied visual baseline: density `1.23`, size `1.65`, speed `7.5`, highlight gain `2.65`, bloom `0.66`, wave strength `0.42`, fine-point ratio `1.16`, water contrast `1.6`, band width `0.82`, and local correlation `0.7`.
- Completed Phase 2 with live sun elevation, azimuth, and intensity controls, bringing Glitter Lab to fourteen implemented sliders.
- Derived the band center, tilt, near/far extent, width, target surface slope, facet activity, highlight warmth, and radiance from the sun model.
- Kept ordinary visits UI-free and made the taller debug panel viewport-scrollable.
- Added Playwright assertions for azimuth centroid movement, elevation footprint change, and intensity-driven bright-pixel response.
- Saved default, left/right azimuth, high-sun, and detail evidence screenshots.
- Completed Phase 3 with bounded pointer position, motion direction, and influence state feeding the existing water-height shader.
- Added a directionally stretched local ripple with spatial falloff, a 260 ms sparse-event hold, and exponential idle decay; no radial-wave history or particle trail is stored.
- Replaced the pending pointer-breeze label with a live `0–1` Glitter Lab control, defaulting to `0.42` and bringing the panel to fifteen implemented sliders.
- Added Playwright coverage for rapid movement, influence cap, final-frame pixel response, idle recovery, console health, and WebGL state.
- Repaired the first browser candidate after automation revealed that velocity-only impulses were too weak under sparse pointer events; bounded distance fallback now preserves subtle real interaction without relaxing the test.
- Reopened Phase 3 after human review found the default breeze effectively imperceptible despite the maximum-strength browser test passing.
- Split autonomous-water and pointer-breeze slope calculations so `waveStrength` no longer attenuates the independently controlled breeze a second time.
- Expanded the directional disturbance footprint without adding rings or a retained trail, increased the event hold from 180 ms to 260 ms, and tuned exponential decay to fall below `0.03` in roughly two seconds.
- Added a pure, tested pointer-envelope helper and changed Playwright coverage to verify visible response using the accepted default `0.42` wave and breeze values rather than temporary maximum values.
- Completed Phase 4 without changing the accepted Glitter Lab defaults, reflection-band geometry, or three-level point population.
- Refined the rare bright layer into a sharper peak plus restrained near/far halo; fine and medium points still receive no halo energy.
- Replaced per-channel highlight compression with luminance-preserving tone mapping so rare silver/warm highlights retain their hue as they brighten.
- Added an idle-pointer shader fast path and moved the desired sun slope out of repeated glimmer-cell work.
- Added a deterministic adaptive-quality controller with a `1–1.75` DPR range, two sustained slow windows before reduction, and five sustained fast windows before recovery.
- Exposed current DPR, quality tier, and sampled FPS as canvas data attributes for browser QA; added three controller unit tests and Playwright telemetry checks.
- Saved Phase 4 default, later, and glow-detail screenshots and verified continued autonomous evolution.
- Completed Phase 5 with Chromium full regression plus Firefox and WebKit WebGL/responsive smoke coverage.
- Added verified 390×844 portrait and 844×390 landscape layouts, internal debug-panel scrolling, reachable actions, and Phase 5 evidence screenshots.
- Added keyboard focus styling and tests, semantic-label checks, and browser-visible `0.35×` reduced-motion pacing.
- Passed a 60-second autonomous Chromium soak with clean console/page errors, WebGL state, and adaptive-quality telemetry.
- Added repository-relative Vite builds, a GitHub Pages Actions workflow, a project README, and a durable Chinese deployment/rollback guide.
- Verified the production HTML, JS, and CSS respond under `/One-Thousand-Glimmers/` in a local production preview.
- Added an independent native-audio controller with explicit opt-in playback, a 2-second fade-in, 1.5-second fade-out, loop mode, pause-position resume, rapid-toggle cancellation, unmount cleanup, and non-blocking error handling.
- Added a restrained lower-right sound toggle that remains available with Glitter Lab hidden, plus a minimal Credits disclosure and creator-music attribution in the README.
- Added Playwright coverage for default silence, loop configuration, fade completion, pause-position preservation, resume, load-failure isolation, cross-browser control visibility, and continued WebGL health.
- Prepared the 128-second, 24-bit/44.1 kHz stereo Logic Pro WAV as a 125-second, 256 kbps MP3 using a 3-second equal-power loop crossfade. The source master remains untouched.
- Verified the real 4.0 MB MP3 downloads and decodes in Chromium/Web Audio as 44.1 kHz stereo, and completed a 14-test cross-browser regression.
- Repaired silent playback in the in-app browser by replacing its stalled `HTMLAudioElement` path with a user-gesture-created Web Audio engine. `AudioContext`, decoded-buffer looping, `GainNode` fades, pause-offset resume, cancellation, and teardown remain independent of the WebGL loop.
- Verified the repair live in the in-app browser: the context advances to `running`, decodes the 125-second stereo buffer, suspends after fade-out, and resumes from the recorded offset.
- Added deterministic solar-azimuth evolution around the Glitter Lab center value. After live review showed that the first `±14°` trajectory moved numerically but was masked by normal flicker, expanded the drift to about `±24°`, strengthened the soft reflection-envelope response, and biased the long-cycle blend toward a clear first-minutes direction. Visible-session time advances continuously, hidden tabs do not create a return jump, and reduced-motion mode slows the solar movement with the rest of the artwork.
- Rebuilt pointer interaction around primary press semantics. A standalone click now produces a held local facet disturbance; press-and-drag uses speed plus cumulative distance, stays active while held, and decays only after release. Hover-only movement no longer alters the water.
- Added separate click and drag file interfaces through an independent Web Audio one-shot bridge. Environment values can replace the bundled assets, and explicit blank values remain silent without a resource request.
- Amplified interaction after human review: clicks now wake a compact, broken patch of existing glints and ripple-attached light/dark facets, while drag produces a longer direction-aware shimmer field with a deliberately narrower cross-axis footprint. No new particles, rings, splashes, or history trail were introduced.
- Revalidated the amplified interaction with TypeScript, lint, 17 unit tests, production build, a targeted default-strength/wave-strength-zero browser check, and the complete 14-test Chromium/Firefox/WebKit suite including the 60-second soak.
- Refined the accepted interaction after a second human review: both axes now use an exact `sqrt(1 / 6)` scale, reducing click and drag footprint area to approximately one sixth without lowering core brightness. Click and drag now use short exponential attacks computed from real elapsed time, followed by a `350 ms` click-release hold and the existing continuous decay.
- Added three subdued water-detail scales at long, middle, and capillary frequencies. Existing depth and cross fields warp their phase and amplitude, adding fine depth without drawing explicit wave lines or altering the reflection-band organization.
- Passed 18 unit tests, production build, targeted Chromium interaction QA, the complete 14-test Chromium/Firefox/WebKit suite, and the 60-second soak after the refinement.
- Integrated the creator-supplied `Click.wav` and `Drag.wav` masters unchanged as `public/audio/glimmer-click.wav` and `public/audio/glimmer-drag.wav`; source and project SHA-256 hashes match exactly.
- Made the two WAV assets the deployment defaults while retaining environment overrides and explicit blank-value opt-out. They remain demand-loaded, separately cached, and independent from both ambient playback and the WebGL render loop.
- Compensated only in playback gain for the masters' approximately 10.6 dB peak-level difference (`1.0` click, `0.32` drag), bringing their RMS output close together without modifying either source file.
- Verified both assets decode as 44.1 kHz stereo in real Chromium Web Audio with durations of 2.5 and 4.0 seconds. TypeScript, lint, 19 unit tests, production build, targeted interaction audio QA, 14/14 cross-browser tests, and the 60-second soak pass.
- Lowered the shared click/drag effect master first to `0.22`, then to the accepted quieter value `0.10`, preserving the authored files and their relative click/drag compensation. Added a `0–1` Glitter Lab slider whose changes are smoothed directly on the connected Web Audio master gain and included in reset/copy JSON.
- Promoted the lower-right button from an ambient-music-only toggle to the artwork-wide sound switch. Its initial off state now rejects interaction sound requests; turning it off after playback smoothly mutes the click/drag master, and turning it on restores the configured `0.10` level.

## Current issues and risks

- Naturalness, restraint, and long-viewing comfort require human visual acceptance even after automated smoke checks.
- The production bundle is approximately 315 kB gzip and triggers Vite's generic 500 kB uncompressed chunk warning. This is expected for Three.js/R3F and does not fail the build.
- Glitter Lab uses a shader-local halo rather than a post-processing pass. Its current default is `0.66`; halo energy remains restricted to rare bright glints, while post-processing bloom remains a possible Phase 4 decision.
- Three glimmer layers increase fragment-shader work. Current automated browser checks pass without WebGL errors, but thermal and frame-time behavior still varies by hardware.
- The amplified click/drag response is automatically measurable and visually present in screenshots, but preferred strength and tactile feel on the user's mouse, display, and touch hardware remain pending human acceptance.
- Adaptive DPR responds to sustained pressure, but frame-rate and quality transitions still require observation across integrated/discrete GPUs and high-DPI displays.
- The source WAV's last second was about 15.5 dB RMS louder than its first second, making a direct loop risky. The prepared crossfade reduces the web asset's boundary mismatch to roughly 2 dB, but the final transition and music/art balance still require listening on the user's speakers/headphones.

## Next

1. Manually accept the standalone click and press-drag visibility on mouse and touch hardware.
2. Listen to the new `0.10` interaction master both with ambient music off and on, then fine-tune it live in Glitter Lab if necessary.
3. Continue acceptance of solar pace, music balance, and desktop/mobile interaction before committing and deploying the refinements.
