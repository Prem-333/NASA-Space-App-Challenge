# Hail Mary — submission draft

**Challenge:** Space Mission Design Game  
**Team:** Hail Mary  
**Project title:** Hail Mary — Mission Control  
**Tagline:** Configure a lunar spacecraft. Check its margins. Command the flight.

**Playable demo:** https://hail-mary-mission-control.mclaren720sfeelthesp.chatgpt.site

**Source repository:** https://github.com/Prem-333/NASA-Space-App-Challenge

**Captioned walkthrough:** https://hail-mary-mission-control.mclaren720sfeelthesp.chatgpt.site/demo.mp4

## Team

Premnath V R, Bharathraj Nagarajan, Kanish S, Rithikha B, Dharshini T, and Mirthika S share equal team credit. See TEAM.md for the evenly distributed responsibility plan requested by the team; individual work claims should be confirmed before submission.

## Short summary

Hail Mary turns space mission engineering into a playable sequence of decisions. Players choose a lunar mission, assemble a spacecraft, balance fuel, mass, power, science and cost, then command the flight through unexpected problems. NASA's rocket equation, lunar facts and imagery ground the experience. Every outcome is explained, so success and failure both become opportunities to learn.

## The problem

Space mission design combines many competing demands. A more capable instrument adds mass, uses electrical power, and produces data that must reach Earth. A larger fuel load improves reach but also increases launch mass and cost. These relationships can be difficult to understand through isolated equations or diagrams.

## Our solution

We built a complete browser game around three robotic lunar missions: a flyby, a polar orbiter, and a lander. Players select systems and instruments, adjust propellant, and receive immediate engineering feedback. Six preflight checks connect choices to velocity capability, launch capacity, cost, daylight power, eclipse endurance and the scientific objective.

Flight school progresses through one, two, then three simultaneous science objectives. Players match objectives to wavelength bands, instruments, and collection systems. Compatibility and minimum data capacity are enforced before launch. Every selected objective must meet its usable-data requirement for mission success; a high total score alone is insufficient. Debriefs show synthetic science-product previews and sourced comparisons with NASA instruments.

After launch, the player commands up to five phases. Trajectory correction, a solar-array fault, lunar arrival and a disrupted ground contact create trade-offs between fuel, schedule, electrical capacity and scientific return. A transparent flight director explains the actual margins. Ignoring navigation or disabling arrival guidance produces an explicit mission loss, shown as escape or a surface impact. These command branches are authored scenarios. The optional manual final descent separately integrates local lunar gravity, thrust, fuel consumption, and horizontal/vertical motion, producing safe landings, impacts, or corridor exits from the player’s controls. A completed mission receives a success or failure screen with retry and design refinement. The final report traces fuel consumption, compares science with the objective, and connects outcomes to individual decisions.

## How NASA data and resources are used

- NASA Glenn's ideal rocket equation powers the builder and sequential propellant calculations.
- NASA's Moon Fact Sheet supplies physical facts and the Earth–Moon distance shown in the experience.
- A NASA lunar-orbit architecture diagram informs the departure reference; the polar-capture allowance is an authored game assumption, not a validated polar trajectory.
- NASA SVS's LRO-derived lunar texture and Blue Marble Earth mosaic appear in the 3D mission views.
- NASA LROC, M³, and Mini-RF instrument references inform science compatibility and real-mission comparisons.
- Every source and simulation assumption is disclosed in the Manual.

Hardware performance values, prices, events, science scores and several operational allowances are authored game parameters. We make this boundary visible instead of presenting game parameters as NASA measurements.

## What makes it useful

The player can change a decision and immediately see the consequence. Adding an instrument can improve planned science while failing the power or propulsion check. During flight, saving fuel may cost science, while a larger array may make reduced operations viable. The same scenario is reproducible, making it useful for classroom comparison, team discussion and iterative design.

The project works without an account, API key, or paid AI service. It has responsive layouts, keyboard-accessible controls, device-local saves, shareable designs, imports/exports and downloadable flight reports.

## Technology

HTML, CSS and modular JavaScript; a pure calculation/state-transition engine; locally bundled Three.js for the interactive spacecraft bay and Earth–Moon flight scene; a decorative WebGL lunar globe; original 3D geometry and SVG charts; localStorage for device-local progress. Node's built-in HTTP server supports local demonstrations. Playwright and axe-core support functional and accessibility testing. The 3D view includes camera controls, animated maneuvers, synchronized fuel telemetry, pause/speed/skip controls, reduced-motion support and a fallback without WebGL.

## Validation

64 unit tests cover physical relationships, constraints, both difficulty modes, state replay, spacecraft assemblies, risk forecasts, and animation telemetry. All 57 reachable starter branches are traversed. Browser suites cover the three missions, impact and escape, missed science objectives, retry, saving, share links, imports/exports, and 320–1440 px layouts. The release audit also tests corrupted records, unavailable storage, refresh-to-resume, and protection against replacing an unfinished flight from the archive. Accessibility checks use axe-core; this is automated coverage, not a claim of complete accessibility certification. See QA.md for results and limits.

## Honest limitations

This is a simplified educational model, not an operational flight planner. It does not integrate real trajectories, calculate launch windows, model terrain hazards, or perform live NASA data retrieval. Battery energy is checked at preflight rather than simulated over time. The flight director uses explicit rules, not generative AI.

## Possible next steps

Teacher-authored mission scenarios, multilingual learning material, more varied orbital destinations, time-resolved battery modeling, a properly validated orbit propagator, and guided comparisons between two spacecraft designs.

## Before you submit

- The demo, source and captioned video links are provided above. Open them signed out before submitting.
- Confirm the assigned team responsibility split reflects the members’ actual work.
- If the event requires a third-party video host, upload the supplied MP4 and use that host’s link.
- Review the current official challenge statement, event rubric, submission fields and deadlines. The full challenge page returned HTTP 502 during this build, so exact current requirements were not independently verified.
- Keep the NASA citations and third-party notices.
- Review and disclose AI-assisted development according to the event's actual requirements.

This document has not been submitted or posted anywhere.
