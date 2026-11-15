# Hail Mary 1.5 — hackathon audit

Fixed active-flight replacement when retrying an archived design; retries now request an in-game choice before discarding unfinished progress. Refresh restores the current screen, sound preference and committed flight state. Malformed archive entries no longer disrupt valid saves. The save indicator reflects actual write success.

Fixed missing methods in the WebGL fallback, incorrect arrival-reserve advice, misleading success grades on missed objectives, and debrief advice that described power decisions not taken. Propellant failures now recommend relevant design changes. Added a visible science target with synchronized maneuver readouts. Corrected solar telemetry so the announced array fault is visible before the recovery decision and power restoration is reflected during playback. The Windows launcher now opens the browser only after the server is listening.

Updated the NASA architecture citation and made the distinction between source references and the authored polar route explicit. Reworked the two-minute demo, reviewer quickstart and submission draft around the current game.

Validation covers unit calculations, all 57 starter branches, complete missions, crashes, escape, retry, keyboard input, save corruption, blocked storage, WebGL fallback, and five viewport widths. See QA.md for recorded results and limits.
