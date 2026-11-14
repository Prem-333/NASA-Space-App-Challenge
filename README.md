# Hail Mary — Mission Control

**Build a spacecraft. Make the hard calls. Bring the science home.**

A complete browser game for Team Hail Mary's **Space Mission Design Game** project. Choose a lunar objective, assemble a spacecraft, pass six engineering checks, command a five-stage mission, and learn from a reproducible flight report.

## Play locally

Requires Node.js 20 or newer. No API keys, account, runtime packages, or network connection are needed to play from the local server.

```powershell
cd 'D:\Astra (Public)\Nasa Space App\hail-mary'
npm start
```

Open **http://localhost:4173**. Keep the terminal running. Do not double-click `index.html`: browsers restrict ES-module imports over `file://`.

On Windows, `Start Hail Mary.cmd` starts the server and opens the game. If the default port is occupied, set `PORT` to another number before starting. The built-in server binds only to localhost; deploy `dist` for team access.

## What's playable

- **First Light**: a camera-equipped lunar flyby.
- **Hidden Water**: a polar lunar orbiter with a composition-survey objective.
- **Quiet Frontier**: a robotic lunar lander with a more demanding propulsion and science budget.
- Two difficulty modes: Explorer and Commander.
- Six configurable systems: propulsion, solar arrays, communications, batteries, science instruments, and launch service.
- Adjustable propellant, mass and budget accounting, rocket-equation delta-v, steady-state power, eclipse endurance, and science/downlink checks.
- Five flight commands with choices that trade propellant, schedule, power and scientific return.
- A rule-based flight director that explains the player's actual engineering margins.
- An illustrated lunar globe using a bundled NASA SVS / LRO texture.
- Persistent local progress, resumable flights, and the most recent 12 completed flights.
- Design sharing by URL, JSON import/export, and downloadable Markdown flight reports.
- Keyboard access, responsive desktop/tablet/mobile layouts, reduced-motion support, and optional interface sound.
- A Field manual explaining the calculations, sources, scoring and limitations.

The runtime is entirely static and self-contained. Fonts and imagery are bundled. There is no analytics, external runtime request, backend, real-time NASA feed, or paid AI service. The current page remains usable without internet; offline reopening requires the local server. This is not a service-worker-installed offline app.

## A good first flight

1. Choose **Hidden Water** and **Explorer**.
2. Open **Spacecraft lab**. The starter has all six checks passing.
3. Try lowering fuel to 500 kg and observe the failed delta-v check. Restore the starter.
4. Enter the flight console.
5. Choose **Commit departure burn → Correct the trajectory → Recover the solar array → Insert into polar orbit → Wait for the next contact**.
6. Review the debrief: approximately **82.8 science**, **$61.5M**, **419 m/s reserve**, **88/100**.
7. Refine the spacecraft or choose the lander. In the lander, accepting the wider approach, reduced operations, and priority-only downlink misses the science objective. Recovering the array and waiting for contact succeeds.

## Development and validation

```powershell
npm ci
npm run check
npm test
```

For browser tests, start the local server in another terminal, then:

```powershell
npm run test:e2e
```

The test suite uses the installed Google Chrome (`channel: 'chrome'`) and Playwright. It saves screenshots, download samples, and accessibility results in `artifacts/`. Automated accessibility testing is a useful check, not a claim of complete accessibility certification.

Unit tests cover the rocket equation and its inverse, mass conservation, all starter missions in both modes, blocking checks, communication bottlenecks, deterministic outcomes, replay validation, bad inputs, and all 36 branches of the starter flight scenarios.

Browser tests cover complete missions, objective success and failure, save/resume, design sharing, downloads, imports, archive preservation, local storage corruption, malformed share links, layouts at 390/768/1440 pixels, and operation with external requests blocked. Axe checks representative briefing, builder, flight, debrief, manual, and mobile screens.

## Structure

```text
dist/                 Deploy this directory to a static host
  index.html          App shell
  app.js              Views, interactions and browser persistence
  engine.js           Pure mission calculation and state transitions
  data.js             Mission briefs, hardware parameters, source records
  globe.js            Decorative WebGL globe, with CSS fallback
  style.css           Responsive design and accessibility styles
  assets/             NASA texture, original emblem and bundled fonts
tests/                Simulation and browser regression tests
scripts/serve.mjs     Dependency-free local HTTP server
docs/                 Submission draft, demo script, science and QA notes
.openai/hosting.json  Sites deployment identity
```

## Deployment

The game needs static hosting only. Publish the contents of `dist` as the site's root; `index.html` is the entry point. It works on GitHub Pages, Netlify, Cloudflare Pages, or another static host with no framework build step. Relative asset paths support subdirectory hosting. Preserve the NASA attribution and font license files in redistributed source.

The Sites deployment is private by default. A private link is not sufficient for public judging; access must be intentionally changed or the portable `dist` directory deployed to a public static host before submission.

## Scientific scope and attribution

See [SCIENCE.md](docs/SCIENCE.md) and the in-game Field manual. NASA provides the physical relationship, lunar facts, approximate transfer/capture reference, and lunar texture. **Hardware names, hardware performance values, costs, science points, event choices, and many operational assumptions are authored game parameters.**

This is an educational model, not operational mission-planning software. Hail Mary is an independent project and is not endorsed by NASA. The official full challenge page was unavailable (HTTP 502) during development; the available challenge summary informed the implementation. Review the final event-specific requirements before submission.

## Submission materials

- [Submission draft](docs/SUBMISSION.md)
- [Two-minute demo script](docs/DEMO-SCRIPT.md)
- [Science and model notes](docs/SCIENCE.md)
- [QA record](docs/QA.md)
- [Third-party notices](docs/THIRD-PARTY-NOTICES.md)

The submission draft is for your review and use. Nothing has been submitted to NASA Space Apps on your behalf.
