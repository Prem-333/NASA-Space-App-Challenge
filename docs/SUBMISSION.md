# Hail Mary — submission draft

**Challenge:** Space Mission Design Game  
**Team:** Hail Mary  
**Project title:** Hail Mary — Mission Control  
**Tagline:** Build a spacecraft. Make the hard calls. Bring the science home.

## Short summary

Hail Mary turns space mission engineering into a playable sequence of decisions. Players choose a lunar mission, assemble a spacecraft, balance fuel, mass, power, science and cost, then command the flight through unexpected problems. NASA's rocket equation, lunar facts and imagery ground the experience. Every outcome is explained, so success and failure both become opportunities to learn.

## The problem

Space mission design combines many competing demands. A more capable instrument adds mass, uses electrical power, and produces data that must reach Earth. A larger fuel load improves reach but also increases launch mass and cost. These relationships can be difficult to understand through isolated equations or diagrams.

## Our solution

We built a complete browser game around three robotic lunar missions: a flyby, a polar orbiter, and a lander. Players select systems and instruments, adjust propellant, and receive immediate engineering feedback. Six preflight checks connect choices to velocity capability, launch capacity, cost, daylight power, eclipse endurance and the scientific objective.

After launch, the player commands five phases. Trajectory correction, a solar-array fault, lunar arrival and a disrupted ground contact create trade-offs between fuel, schedule, electrical capacity and scientific return. A transparent flight director explains the actual margins. The final report traces fuel consumption, compares science with the objective, and connects outcomes to individual decisions.

## How NASA data and resources are used

- NASA Glenn's ideal rocket equation powers the builder and sequential propellant calculations.
- NASA's Moon Fact Sheet supplies physical facts and the Earth–Moon distance shown in the experience.
- A NASA lunar-orbit architecture diagram informs approximate translunar and polar-capture delta-v budgets.
- NASA SVS's LRO-derived lunar texture is rendered as a globe in the mission desk.
- Every source and simulation assumption is disclosed in the Field manual.

Hardware performance values, prices, events, science scores and several operational allowances are authored game parameters. We make this boundary visible instead of presenting game parameters as NASA measurements.

## What makes it useful

The player can change a decision and immediately see the consequence. Adding an instrument can improve planned science while failing the power or propulsion check. During flight, saving fuel may cost science, while a larger array may make reduced operations viable. The same scenario is reproducible, making it useful for classroom comparison, team discussion and iterative design.

The project works without an account, API key, or paid AI service. It has responsive layouts, keyboard-accessible controls, device-local saves, shareable designs, imports/exports and downloadable flight reports.

## Technology

HTML, CSS and modular JavaScript; a pure calculation/state-transition engine; locally bundled Three.js for the interactive spacecraft bay and Earth–Moon flight scene; a decorative WebGL lunar globe; original 3D geometry and SVG charts; localStorage for device-local progress. Node's built-in HTTP server supports local demonstrations. Playwright and axe-core support functional and accessibility testing. The 3D view includes camera controls, animated maneuvers, synchronized fuel telemetry, pause/speed/skip controls, reduced-motion support and a fallback without WebGL.

## Validation

42 automated simulation and playback tests cover physical relationships, constraints, both difficulty modes, input validation, replay integrity, all 36 branches of starter scenarios, and animation timing/telemetry. Browser tests exercise all three missions, successful and missed objectives, save/resume, file import/export, share links, archive preservation, mobile/tablet layouts, and operation with external network requests blocked. Additional motion tests verify pause, speed, camera selection, reduced motion, WebGL fallback and reloads during maneuvers. See QA.md for the final recorded results and limitations.

## Honest limitations

This is a simplified educational model, not an operational flight planner. It does not integrate real trajectories, calculate launch windows, model terrain hazards, or perform live NASA data retrieval. Battery energy is checked at preflight rather than simulated over time. The flight director uses explicit rules, not generative AI.

## Possible next steps

Teacher-authored mission scenarios, multilingual learning material, more varied orbital destinations, time-resolved battery modeling, a properly validated orbit propagator, and guided comparisons between two spacecraft designs.

## Before you submit

- Add the final **publicly accessible** demo URL and source repository URL.
- Add team members and their actual contributions.
- Record the demo using DEMO-SCRIPT.md; add the resulting video link if required.
- Review the current official challenge statement, event rubric, submission fields and deadlines. The full challenge page returned HTTP 502 during this build, so exact current requirements were not independently verified.
- Keep the NASA citations and third-party notices.
- Review and disclose AI-assisted development according to the event's actual requirements.

This document has not been submitted or posted anywhere.
