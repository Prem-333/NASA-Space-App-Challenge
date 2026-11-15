# Hail Mary 1.7 — cinematic presentation

- Added the Director camera as the default. Each flight phase has its own tracking distance, view angle, height, and field of view. Position, look target, and focal length use frame-rate-independent damping. Camera pose carries across command handoffs. Dragging or arrow-key orbiting switches to Follow; Director restores the automatic framing.
- Improved spacecraft metal/foil reflections using a generated lighting environment. Added tapered, animated exhaust with gradual ignition/cutoff and small attitude-control pulses. Added restrained antenna tracking and engine gimbal detail.
- Added varied star colors/sizes, higher-resolution planetary geometry, a daylight-sensitive atmosphere, texture filtering and illustrative lunar surface shading.
- Improved manual-descent rendering with interpolated positions, camera tracking, layered relief, rocks, ground shadows, landing-zone beacons, actual velocity vectors, detailed lander drawing and low-altitude regolith particles. Relief remains scenery; the physics still uses a flat ground plane. The Earth in the sky is illustrative, not an ephemeris result.
- Added subtle Moon rotation and interface entrance/result transitions. Reduced-motion preferences disable autonomous motion. Pause freezes camera, spacecraft, exhaust and background together.
- Rendering starts at a bounded device pixel ratio and reduces it after sustained slow frames. Off-screen/hidden scenes skip rendering. Cached image textures are reused; per-scene reflection maps, geometry, shaders and observers are released.

## Verification

68 unit tests, plus a cinematic browser regression for dynamic framing, exact paused-frame equality, manual camera override, shader compilation and mobile width. Existing motion, science, outcome, workflow and resilience suites remain applicable. Illustrative effects do not change mission physics, scores or saved decisions. No universal frame-rate guarantee is claimed.
