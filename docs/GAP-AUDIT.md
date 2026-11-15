# Challenge coverage — 1.6

The official full challenge page was unavailable during the audit. The general mission-design goal was confirmed in indexed official material. The expanded feature expectations were read from the local-event description at https://hackathlone.com/challenges/space-mission-design-game. This is a traceable implementation review, not a claim of organizer approval.

| Expectation | Implementation | Evidence |
| --- | --- | --- |
| Define scientific purpose | Free-flight objective checkboxes; structured flight-school briefs | science.js, science-ui.js |
| Choose instruments, wavelengths, optical systems | Camera/lens, spectrometer/spectrograph, radar/antenna configuration | Science workbench |
| Enforce compatible choices | Bad combinations and insufficient data capacity block launch with repair guidance | Unit and browser rejection tests |
| Manage resources and spacecraft | Six hardware categories, propellant, mass, cost, power, energy, data capacity | Six launch checks and flight telemetry |
| Increasing complexity | Three sequential unlocks with 1/2/3 simultaneous objectives and rising usable-data thresholds | Campaign browser test completes all levels |
| Animated mission execution | Three.js spacecraft assembly, Earth–Moon flight, burn playback, impacts and escape | Motion/outcome browser suites |
| Meaningful decisions and possible loss | Fuel, science and recovery tradeoffs; terminal scripted losses; calculated manual descent outcomes | Command tree and descent tests |
| Scientific results | Per-objective delivery/coverage; explicitly synthetic visual products | Debrief and downloadable report |
| Real NASA mission connections | LROC, NASA M³ on ISRO Chandrayaan-1, and Mini-RF comparisons with differences and source links | Debrief and Manual |
| More direct gameplay | Optional throttle/steering descent; gravity/fuel integration; zone/speed limits; pause/reload | Piloted safe and failed landing browser cases |
| Judge access and delivery | Owner-authorized public release, GitHub source, portable archive, captioned MP4 | Native deployment/access verification |
| Team submission details | Six named members with equal credit; evenly assigned responsibility plan | TEAM.md and SUBMISSION.md |

Remaining external steps: confirm assigned responsibilities against actual work; verify event-specific submission fields and deadlines; submit the package. No event form has been sent. Full orbital propagation, live NASA data, measured science products, and terrain analysis are explicitly outside the educational model.
