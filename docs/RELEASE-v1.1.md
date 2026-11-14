# Hail Mary v1.1 — interactive flight

This release replaces the static spacecraft illustration and route diagram with interactive 3D scenes, while retaining the tested mission engine and existing saved-flight format.

## New interactions

- Rotate and inspect a configurable 3D spacecraft; use an animated exploded view to see the systems separately.
- Select a spacecraft component directly to open its configuration category. Keyboard-accessible category controls remain available.
- Change between Orbit, Follow and Lunar cameras during flight. Drag or use arrow keys to adjust the view; `+`/`-` zoom and `Home` resets the camera.
- Watch countdowns, spacecraft movement and visible burns with fuel and delta-v changing according to the existing model.
- Pause or resume playback, set 0.5× to 4× speed, skip a sequence, and expand the view.
- Preview a command's exact propellant cost, retained science and schedule effect before selecting it.
- See animated mission results and charts.

## Reliability and accessibility

- Commands save immediately and apply exactly once, including when the page is reloaded mid-animation.
- Changing speed or skipping an animation cannot change the mission outcome.
- Reduced-motion preferences disable compulsory playback and ambient motion.
- Unsupported 3D falls back to the normal decision/telemetry interface.
- Renderers, event listeners and animation loops are disposed when views change.
- Fonts, rendering modules and NASA imagery are bundled; no external runtime service is required.

## Scientific boundary

The trajectory and scale are illustrative. The numerical fuel budget is calculated; the 3D route is not an orbit propagator. See SCIENCE.md for the complete model and sources.
