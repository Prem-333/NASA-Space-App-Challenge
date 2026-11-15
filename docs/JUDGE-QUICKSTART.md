# Hail Mary — reviewer quickstart

**Challenge:** Space Mission Design Game  
**Team:** Hail Mary  
**What to try:** Build and command a lunar mission, then compare the engineering and science consequences of another plan.

## Three-minute walkthrough

1. In Play, select Hidden Water and Explorer; enter Hangar.
2. Rotate the spacecraft and open Exploded view. Change a component to see both hardware and resource margins respond.
3. Set propellant to 500 kg. Launch is blocked with a specific explanation. Restore mission starter, then confirm.
4. Enter Flight. Use departure → correct trajectory → recover array → insert into polar orbit → next contact. Set playback to 4× or skip animations if needed.
5. Inspect MISSION SUCCESS, science returned against its target, fuel chart, and command log.
6. Fly again, depart, then ignore the navigation update. The spacecraft escapes and the attempt ends in failure. Past results remain in Flight records.

## What is grounded in NASA resources?

The ideal rocket equation, lunar reference facts, approximate architecture references, Blue Marble Earth imagery, and LRO-derived lunar imagery. Six linked NASA references are in Manual. Full attribution and model boundaries are in SCIENCE.md and THIRD-PARTY-NOTICES.md.

## What is authored for the game?

Hardware specifications, costs, scientific scores, operational timings, scripted faults, and impact/escape scenarios. Flight paths and scales are illustrative. There is no live NASA feed or numerical orbit propagation.

## Practical details

- No API key, backend or runtime CDN is required.
- Saves and the latest 12 completed flights stay in the current browser.
- Design links share a configuration; they do not transfer another player's save or account.
- Controls work by pointer or keyboard; reduced-motion and non-WebGL fallbacks are supported.
- For local review: run `npm start` in the source folder, then open `http://localhost:4173`.

## Submission handoff

The team must provide a publicly accessible demo URL (or explicit judge access), a source link/archive, actual member contributions, and any video required by the local event. The official full challenge page returned HTTP 502 during the final audit, so verify event-specific fields and deadlines separately. No submission has been sent on the team's behalf.
