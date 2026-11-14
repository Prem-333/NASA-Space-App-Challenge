# Hail Mary — two-minute demonstration

Open a clean browser session at the game URL. Start on Mission desk. Use **Hidden Water**, **Explorer**, and its starter spacecraft. Keep the window around 1440×1000 for the recording. Sound is optional and off by default.

## 0:00–0:20 — The idea

**Show:** Mission desk and the three mission cards.

“A space mission starts with a purpose, but every engineering choice affects whether that purpose can be achieved. Hail Mary lets you experience those trade-offs. We built three lunar missions, from a first flyby to a robotic landing.”

## 0:20–0:50 — Make a choice, see a consequence

**Show:** Hidden Water → Spacecraft lab. Open Science payload, briefly select the radar and explain the added demand. Restore the starter. Lower fuel to 500 kg to show the failed check, then restore the starter again.

“Our builder connects mass, power, fuel, communications and scientific return. More capability comes at a cost. NASA's rocket equation determines the available velocity budget. The game checks six constraints and explains what needs to change before launch.”

For the v1.1 visual demo, briefly drag the spacecraft and toggle **Exploded view**. Show that changing the solar array or antenna changes the 3D configuration. Turn exploded view off before launching.

## 0:50–1:20 — Take command

**Show:** Enter flight console. Commit departure burn. Correct the trajectory. Pause on Power management.

“The design becomes a flight. Propellant is consumed from the spacecraft's actual current mass. When the solar array has a problem, I can spend fuel to recover it, accept reduced operations, or wait and lose time. The flight director shows my remaining margin so this is an informed decision.”

**Choose:** Recover the solar array → Insert into polar orbit → Wait for the next contact.

In the animated version, select **Follow** during departure to show the spacecraft and engine plume. Use **2×** or **4×** playback to keep to the two-minute demo. You can pause a maneuver to explain the changing propellant and velocity budget, or use **Skip animation** to reach the next decision. These controls change presentation only; they do not alter the outcome.

## 1:20–1:40 — Explain the outcome

**Show:** Debrief, the fuel chart, and the decision log.

“We achieved the scientific objective. The debrief shows exactly where the propellant went and which decisions changed our return. I can refine this design, share it with a teammate, or compare another flight in the archive.”

Expected starter result: approximately 82.8 science points, $61.5 million cost, 419 m/s reserve, and 88/100 score. These are educational game outputs, not a prediction for a real mission.

## 1:40–2:00 — Evidence and impact

**Show:** Field manual and NASA source links.

“NASA's physical relationships, lunar facts, architecture references and LRO imagery ground the game. Our assumptions are visible, and the scenarios are reproducible. Hail Mary makes the engineering conversation accessible: build, decide, understand, and try again.”

## Optional live judge interaction

Ask the judge to choose between array recovery and reduced operations for Quiet Frontier. The difference is visible in the returned science and final objective status. For a reliable contrast, use the same lander starter and compare:

- Successful run: departure → precision correction → recovery → arrival → next contact.
- Missed objective: departure → wider approach → reduced operations → arrival → priority data.

## If the venue has poor internet

Start the local server with `npm start` or `Start Hail Mary.cmd`. All runtime assets are bundled. Keep the browser and local server open during the demonstration. Publicly shared links still require a publicly reachable deployment for other people to open them.
