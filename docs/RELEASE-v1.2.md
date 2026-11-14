# Hail Mary 1.2 — Spacecraft inspection

Rebuilt the conceptual spacecraft with a framed bus, quilted insulation, radiator panels, thruster pods, a contoured engine nozzle with plumbing, segmented solar arrays, an antenna reflector with feed supports, separate battery hardware, and instrument housings. Hardware changes follow the selected configuration.

Exploded view now moves each solar wing independently, separates the service assemblies, labels selectable components, stops automatic rotation, and widens the camera view. Reset returns to the assembled state. Geometry remains illustrative rather than a flight-qualified CAD model.

Replaced generic slogans throughout the mission desk, configuration, flight view, debrief and reference screens with direct operational wording. Refined lighting, inspection framing, and component tags.

Validation: 50 unit tests; complete flight regression and interaction suites; automated accessibility checks; desktop and mobile visual inspection.

## Command warnings and failed attempts

Command cards now warn when a decision reduces science or makes the target unreachable. Forecasts evaluate the existing command tree, without changing outcomes or adding random failures. An active warning persists when the target can no longer be reached. Debriefs show the exact science shortfall or propellant failure and suggest what to change. Archives distinguish missed objectives from mission failures.
