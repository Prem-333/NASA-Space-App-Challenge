# Captioned judge walkthrough

The supplied `dist/demo.mp4` is a screen recording of the actual game, with captions and no narration. It is also available at the public game URL followed by `/demo.mp4`.

## Storyboard

1. Introduce Hail Mary and its mission-design goal.
2. Show the three flight-school assignments and increasing science complexity.
3. Open the first assignment, inspect the spacecraft, and toggle exploded view.
4. Change the camera to an incompatible wavelength. Show launch rejection, then restore Visible.
5. Launch from low Earth orbit and show the rocket-equation departure animation.
6. Correct navigation, recover the array, complete the flyby, and return science.
7. Show success, the synthetic science-product preview, and the real LROC comparison.
8. Show the next assignment unlocked.
9. Open the free-flight lander and pilot its final descent. Cut thrust to demonstrate a calculated impact.
10. Close with the team, source link, NASA references, and model limits.

For a narrated presentation, explain that full Earth–Moon trajectories remain schematic. The manual final descent is a local 2D model; science-product illustrations are not measured NASA observations. Emphasize that every selected objective must pass, not merely the total point score.

Re-record locally with `node scripts/record-demo.mjs` after starting the server. This requires development dependencies, installed Chrome, and Playwright FFmpeg (`npx playwright install ffmpeg`). Convert the resulting WebM to MP4 with FFmpeg if needed. These are development tools, not game dependencies.
