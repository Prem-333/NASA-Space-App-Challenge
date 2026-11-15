# Hail Mary 1.8 — 3D surface approach

Manual descent now uses the same detailed spacecraft assemblies as the hangar and flight scenes. Chase and Approach cameras offer close tracking and a wider view of the landing zone. Regolith, crater relief, rocks, sunlight shadows, landing beacons, and low surface dust replace the flat illustration. Thrust, tilt, altitude, horizontal position, and fuel remain connected to the existing deterministic descent simulation.

The landing corridor remains flat. Terrain is procedural illustration, not a surveyed NASA landing site. Three-dimensional rendering does not add a third physics axis. Reduced motion removes camera smoothing; pause freezes visual time. Devices without WebGL retain the 2D flight display and controls.

Validation: 68 unit tests; science/descent browser suite covering hard impact, safe touchdown, save/resume and four accessibility states; cinematic regression; new descent visual suite covering both cameras, exact frozen frames, 320–1440 px layouts, close approach and WebGL fallback.
