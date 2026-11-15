# Hail Mary — two-minute demo

Use Hidden Water, Explorer, and the starter design. Open the game at 1440 × 1000 or similar. Start on Play. Keep playback at 4× for the recording; changing playback speed does not change the result.

## 0:00–0:15 — Show the problem

Show Play and the three mission choices.

“Space missions have to fit a science objective inside a limited mass, power, fuel, and cost budget. Hail Mary lets you make those decisions and see what they do to a mission.”

## 0:15–0:45 — Show a connected design trade-off

Enter Hangar. Rotate the spacecraft and briefly toggle Exploded view. Lower propellant to 500 kg: the velocity check fails and launch is disabled. Restore the starter using Restore mission starter, then confirm.

“The hardware changes the model and the engineering budget. Reducing fuel saves mass and money, but here it leaves too little velocity capability to reach the objective. NASA Glenn’s ideal rocket equation drives that calculation.”

## 0:45–1:15 — Fly the successful plan

Enter flight console. Commit departure burn; set playback to 4×. Correct the trajectory → Recover the solar array → Insert into polar orbit → Wait for the next contact. Pause briefly at Power management to show the command choices and science target.

“Flight decisions affect propellant, power, schedule, and science. The target stays visible, and each command warns about its consequences. Recovering the array costs fuel but protects the science plan.”

## 1:15–1:35 — Show evidence

Show MISSION SUCCESS, the score, propellant chart, and command log. Expected Hidden Water starter result: 82.8 science / 70 target, $61.5M cost, approximately 419 m/s reserve, and 88/100.

“The result is reproducible. We can inspect the decision log, download the report, or change the design and try again.”

## 1:35–1:50 — Show a real loss

Click Fly again. Commit departure burn, then Ignore the navigation update. Let the escape animation play, or skip to the TRAJECTORY LOST result if time is short.

“The game does not award success for every path. Skipping a necessary maneuver loses the encounter. A disabled surface approach can instead produce an impact. These are explicit, scripted learning scenarios.”

## 1:50–2:00 — State the boundary and purpose

Open Manual, showing the NASA references.

“NASA equations, reference values and imagery ground the game. Component values and failure scenarios are authored game parameters, not a flight-qualified simulator. Our aim is to make the engineering trade-offs visible and understandable.”

## Recording notes

- Do a complete rehearsal once before recording. Do not edit settings during the take.
- Click commands with the pointer, or use keys 1–3 in Flight. Keyboard commands do not activate while a dialog is open.
- Pause, speed and Skip animation affect presentation only.
- Leave a short beat after transitions so labels and charts are readable.
- Avoid claiming live NASA feeds, AI-generated flight advice, or numerically integrated trajectories.
- If running offline, start `npm start` or `Start Hail Mary.cmd` before the demo. Keep the local server open.
- The existing hosted demo is access-restricted. Give judges a public deployment or authorized access before submission.
