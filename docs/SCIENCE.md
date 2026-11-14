# Science and simulation model

## Provenance

| Input | Value or relationship | Source |
|---|---|---|
| Lunar mean radius | 1,737.4 km | [NASA Moon Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html) |
| Lunar surface gravity | 1.62 m/s² | Same fact sheet; reference only, not used in descent integration |
| Mean Earth–Moon distance | 384,400 km | Same fact sheet; used in schematic labeling |
| Ideal rocket equation | Δv = Isp × g₀ × ln(m₀ / m₁) | [NASA Glenn Research Center](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/ideal-rocket-equation/) |
| Standard gravity conversion | g₀ = 9.80665 m/s² | Standard acceleration used to convert seconds of specific impulse into exhaust velocity; not lunar gravity |
| Translunar injection | Approximately 3,200 m/s | [NASA NRHO architecture diagram, PDF page 6](https://www.nasa.gov/wp-content/uploads/2023/10/nrho-artemis-orbit.pdf) |
| Global-access low lunar orbit capture | Approximately 1,350 m/s | Same NASA architecture diagram; modeled here as polar arrival |
| Lunar color map | LRO-derived 2K equirectangular texture | [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), visualization by Ernie Wright |

The NASA architecture values are approximate mission-design references, not universal constants. The illustrated globe maps the NASA texture onto a decorative sphere, without terrain displacement. NASA's CGI texture is optimized for visual appearance; original instrument products are required for scientific terrain work.

## Authored parameters

All hardware specifications, launch capacity classes, component prices, fuel price, scientific point values, data rates, and scenario penalties are game design choices. They are visible in `dist/data.js`. “Atlas-class” is a fictional launch capacity label in this project, not a performance claim about a real launch vehicle.

- Spacecraft bus: 320 kg, $8M, 180 W.
- Robotic landing package: 420 kg and $9M, included only in Quiet Frontier.
- Propellant: 500–10,000 kg in 100 kg increments, priced at $1,500/kg.
- Cruise allowance: 100 m/s. Landing allowance: 1,850 m/s.
- Explorer preflight reserve: 200 m/s; Commander: 400 m/s.
- Commander budget: 95% of the mission's listed Explorer budget.
- Solar output: 80% of nominal; battery usable energy: 80% of nameplate capacity.
- Modeled eclipse durations: 0.35, 0.75, and 1 hour for flyby, orbiter, and lander respectively. These are design exercises, not ephemeris-derived shadow durations.
- Mission schedules: 4, 10, and 8 days before scenario delays. These are authored operational schedules, not integrated trajectories.

## Mass and propulsion

```text
dry mass = bus + selected systems + instruments + optional lander package
wet mass = dry mass + loaded propellant
available Δv = Isp × 9.80665 × ln(wet mass / dry mass)
fuel consumed by a burn = current mass × [1 − exp(−burn Δv / (Isp × 9.80665))]
```

Each burn starts with the actual remaining spacecraft mass. A burn demanding more propellant than remains ends the mission and does not create negative fuel. No staging, tank-mass scaling, thrust duration, gravity loss, cryogenic boil-off, thermal simulation, or launch ascent is modeled. A purchased launch service has already delivered the full spacecraft to low Earth orbit.

Route totals before reserve: flyby 3,300 m/s; polar orbiter 4,650 m/s; lander 6,500 m/s. Choosing the shorter correction uses 40 instead of 100 m/s, with a science penalty. The array recovery adds 80 m/s.

## Power and science

Preflight checks daylight generation against full electrical load. It checks battery usable Wh against full load W multiplied by authored eclipse hours. It is an energy-budget calculation, not continuous charge/discharge integration.

Planned science is the mission's base value plus instrument values weighted for that mission, multiplied by `min(1, communication capacity / instrument data demand)`. A required instrument and minimum science threshold are both enforced.

The power fault scenario offers recovery, reduced operations, or waiting. With reduced operations, science is multiplied by `min(1, reduced solar generation / full electrical load)`. Communication and navigation decisions apply additional explicit multipliers. No outcome is produced by a language model or randomized hidden rule.

Science targets are 35, 70, and 90 points for the three missions. Scores are dimensionless educational measures, not predictions of real scientific output.

## Mission score

```text
science component = clamp(science returned / objective target × 45, 0, 65)
budget component = clamp((1 − cost / available budget) × 50 + 10, 0, 20)
reserve component = clamp(remaining Δv / 300 × 15, 0, 15)
final score = round(sum of the three components)
```

A failed burn yields zero. A flight can finish and earn a score while missing its minimum science objective; the debrief explicitly distinguishes those outcomes.

## Reproducibility and data boundaries

The flight engine is a pure state transition over a configuration and a sequence of commands. Identical input and commands give identical results. Saved flights are reconstructed by replaying their commands; saved telemetry and score fields are not trusted. Designs are validated and normalized on import.

The app uses no live NASA API. It bundles reference values, source links, and imagery. The spacecraft, fuel chart, flight path, and project emblem are original SVG/CSS work. No NASA insignia is used as a team logo.

## Interactive visualization and playback (v1.1)

The spacecraft is now an original procedural 3D model; the fuel chart and emblem remain SVG/CSS. The selected solar array, antenna, engine, instruments and battery affect the visible model. Mesh dimensions illustrate configuration changes but are not engineering drawings or measurements.

Earth uses the NASA/Goddard SVS Blue Marble mosaic, https://svs.gsfc.nasa.gov/2915/, credited to NASA/Goddard Space Flight Center Scientific Visualization Studio, Reto Stockli (NASA/GSFC), and NASA's Earth Observatory.

The Earth–Moon path is an authored 3D curve. Planet sizes, distance, motion, orbital tracks and arrival animations are schematic and deliberately compressed. They do not represent a numerical orbit solution. Engine plumes are visual effects.

During a burn, displayed propellant is calculated from the same rocket equation at the fraction of delta-v visually completed. This is not a claim about real engine thrust or burn duration. Presentation time is compressed into seconds; changing playback speed, pausing, or skipping does not change physical outcomes, elapsed mission schedule, or scores.

A command is committed and saved exactly once when selected. The animation then presents that outcome. Reloading or leaving the view resumes from the committed state rather than losing or reapplying a maneuver. Reduced-motion preferences remove mandatory animation waits. A WebGL fallback retains the decision interface and telemetry without the 3D canvas.

## Scripted failure scenarios (1.3)

Ignoring navigation is an authored lost-encounter scenario. Disabling arrival guidance causes escape for the orbiter and impact for a surface-intercept trajectory. These are deterministic gameplay branches, not numerically integrated flight dynamics or real spacecraft failure probabilities. The impact flash and debris are illustrative vacuum-impact effects. Normal arrival and science-result rules remain unchanged. Older saved command sequences retain their outcomes.
