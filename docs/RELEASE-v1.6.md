# Hail Mary 1.6 — challenge-gap closure

- Added selectable science objectives, wavelengths, and collection systems with launch-blocking compatibility and usable-data checks.
- Added three progressive assignments with persistent unlocks and one, two, then three simultaneous objectives.
- Added per-objective outcomes, clearly synthetic product previews, and NASA instrument comparisons with links and explicit differences.
- Added optional player-controlled lunar descent with gravity, thrust, fuel, lateral drift, landing limits, pause/resume, and validated control-history replay.
- Corrected warnings and debriefs for high-scoring flights that fail a product's coverage requirement.
- Fixed transient notice contrast during animation.
- Added team credit, equal responsibility plan, source link, and captioned video walkthrough.

## Verification

64 unit tests, including compatibility, all levels, failed data coverage, safe/unsafe descent, fuel exhaustion, bounds and replay validation. Existing 57 command branches remain covered. Five browser suites cover workflows, motion, outcomes, resilience and the new science/campaign/descent features. Automated accessibility audits cover 18 representative states. The product remains an educational approximation rather than a full mission planner.
