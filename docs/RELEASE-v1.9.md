# Hail Mary 1.9 — impact detail

Impacts now have a brief contact flash and local light, detached spacecraft assemblies, metal fragments, short luminous streaks, low ballistic dust, and a persistent surface mark. Solar wings, antenna, engine and other pieces use the selected spacecraft geometry. Debris stops tumbling when its authored trajectory reaches the ground. All effect motion follows playback progress rather than independent random clocks.

A manual hard impact stays in the surface view for a 3.5-second aftermath. Pause and resume freeze the effect; View flight result skips it. The final result is still calculated by replaying the recorded controls. Reduced motion and the non-WebGL fallback go directly through the existing result path. This is illustrative breakup and ejecta, not a validated structural or explosion simulation.

Validation: 68 unit tests, science/descent browser tests, outcome and cinematic regressions, and a focused surface-impact browser test covering freeze, debris aftermath, phone layout, accessibility, result and reload.
