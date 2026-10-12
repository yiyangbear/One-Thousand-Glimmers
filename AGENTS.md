# One Thousand Glimmers — Agent Guide

## North star

Build a quiet, full-screen generative artwork drawn from sunlight glimmering on a river. The work must remain compelling without input. Favor restrained naturalism, temporal continuity, and local flicker over spectacle.

## Long-term constraints

- The water is low-saturation deep blue-gray / cyan-gray, never a pure-black void.
- Highlights are mostly silver and warm white, with only sparse muted gold.
- Highlights vary in scale and cluster density. They appear and fade near stable spatial locations rather than travelling as particles.
- Preserve the three-layer point hierarchy: dense tiny near-round cores, fewer medium glints, and very rare bright focal points. Avoid ellipse fields, crosses, and grid-boundary artifacts.
- Glow belongs primarily to the rare bright layer; never wrap every point in a pale enlarged copy.
- Water motion comes from a continuous, multi-scale procedural field. Deterministic seeds are required for repeatable QA.
- Avoid neon, sci-fi particles, snow, meteors, regular star shapes, conspicuous wave stripes, heavy bloom, synchronized flashing, and obvious loops.
- Pointer input is a subtle breeze with bounded strength plus spatial and temporal decay. No splashes, jelly deformation, ring waves, or particle trails.
- Sun elevation, azimuth, and intensity must visibly reshape the reflection distribution. The control panel must be hideable.
- Do not add narrative copy, sound, buildings, or window frames unless the project scope is explicitly changed.

## Architecture

- Vite + React + TypeScript.
- One full-screen WebGL scene using Three.js and GLSL.
- Keep shader source in `src/shaders`, scene orchestration in `src/components`, and pure deterministic helpers in `src/lib`.
- Prefer a single plane/full-screen shader over particle object churn.
- Keep UI minimal and separate from render-loop state.
- Keep Glitter Lab hidden unless the URL contains `?debug=true`; its defaults must preserve the accepted artwork. Never expose inactive controls as working sliders.

## Phase workflow

For every phase:

1. Review architecture and the phase acceptance criteria in `docs/IMPLEMENTATION_PLAN.md`.
2. Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
3. Start the site and perform browser automation checks.
4. Inspect console/page errors and look for WebGL failures.
5. Save applicable screenshots under `artifacts/screenshots/`.
6. Check blank frames, large color blocks, layout regressions, and violations of `docs/ART_DIRECTION.md`.
7. Record commands, results, limitations, and pending human art review in `docs/QA_REPORT.md`.
8. Update `docs/PROGRESS.md`.
9. Commit the phase independently only after its acceptance criteria pass. Preserve important visual milestones as commits.

Never report a failed or unexecuted check as passing. Subjective visual quality remains a human art-acceptance item.
