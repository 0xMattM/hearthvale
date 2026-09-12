# Full Game Build Plan — CityLands Polish (PL*)

**Document Version:** 1.0.0  
**Status:** Done — PL1–PL6 complete; next queue [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior build plans:** [FullGameBuildPlan_CityLands.md](FullGameBuildPlan_CityLands.md) (CL1–CL7) … through `_24` (CL99–CL102 **frozen recycle**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)  
**Continuation:** [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7+)
---

# Goal

Ship **player-visible product polish** against PlayerVision — city atmosphere, min HUD clarity, empty-land onboarding, explore readability, travel UX, and light action feedback.

**Not this plan:** assert-only “still green” fidelity recycle (CL91–CL102 style). Prefer changes the player can see or hear. Tests still cover happy + edge/fail when logic changes, but the work itself must improve the session fantasy.

---

# Non-goals

- Do **not** resume F16.2–F17.5.  
- Do **not** pick pending CL99–CL102 (frozen recycle).  
- Do **not** invent professions, warrior balance, NFT combat power, or abstract city daily caps.  
- Do **not** refill single-land homestead clutter as the default world.  
- Do **not** grow always-on HUD columns (panels stay contextual).

---

# Phase order

```
PL1 City atmosphere / readability
 → PL2 Min HUD + contextual panels
 → PL3 Player land empty→build onboarding
 → PL4 Explore section readability
 → PL5 Travel UX clarity
 → PL6 Core-action visual/audio feedback
```

---

# Phase PL1 — City atmosphere / readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL1.1 | **City scarce-yard + wayfinding.** Distinct ground pad under shared stations; floating “Shared · scarce stations” + “Profession tutors” labels; tutor lane strip; civic blocks get simple door/window so they don’t read as stations. Export marker data from shared/`CITY_BUILDINGS` for tests. | Player can tell scarce yard vs civic décor at a glance; labels present; ≥1 test happy + edge (tutors not in scarce list) + fail (unknown type) |
| PL1.2 | **Tutor silhouette clarity.** Distinct cloak/accent colors for all seeded profession tutors (not only farmer/forester/carpenter); keep capitalize name labels; highlight ring parity. | Each `tutorialNpcId` in city template maps to a unique-ish cloak; test covers ≥3 previously-gray tutors |
| PL1.3 | **Market / vendor / notice read as services.** Visual kits for `vendor_stall`, `market_board`, `notice_board` differ clearly from scarce craft/gather stations (awning / board / post). | Three service meshes distinct; walk-up prompts unchanged in meaning |

---

# Phase PL2 — Min HUD + contextual panels

| ID | Work | Acceptance |
| --- | --- | --- |
| PL2.1 | **Interact prompt hierarchy.** Stronger action-first copy styling (key badge + verb); less generic panel chrome; no new always-on UI. | Prompt still shows only when near target; happy + empty-null edge |
| PL2.2 | **TopBar declutter.** Keep identity / energy / coins; hide or demote day-phase + nearby until non-default; visiting banner stays. | Default walking chrome quieter; visiting still obvious |
| PL2.3 | **Single contextual panel focus.** When a walk-up panel opens, soft dim or clear stacking so only one job is readable (no multi-column dump). | One panel job visible; close restores min HUD |

---

# Phase PL3 — Player land empty→build onboarding

| ID | Work | Acceptance |
| --- | --- | --- |
| PL3.1 | **Empty-land beacon.** Build board mesh + world label (“Build here · empty land”) when land has no stations; tip copy stays dismissible / min-HUD. | Fresh empty land shows beacon; after first station beacon softens or hides |
| PL3.2 | **BuildPanel grouped by profession.** Group station buttons (gather / process / etc.) with short headers; costs unchanged. | Categories visible; place still unlimited per type |

---

# Phase PL4 — Explore section readability

| ID | Work | Acceptance |
| --- | --- | --- |
| PL4.1 | **Section label contrast.** Stronger woodland / mines / hunt labels + hint; keep `EXPLORE_SECTIONS` SoT. | Labels readable; prompts still prefix section |
| PL4.2 | **Hunt vs gather floor separation.** Clearer floor color / path contrast between hunt grounds and woodland/mines so hunters don’t miss the trail belt. | Three floors still distinct; no homestead hunt |

---

# Phase PL5 — Travel UX clarity

| ID | Work | Acceptance |
| --- | --- | --- |
| PL5.1 | **Portal prompt destination clarity.** Portal interact copy names free destinations / “Travel · free”; circuit language matches Vision. | Fare-free; no caravan timer language as product rule |
| PL5.2 | **TravelPanel “you are here”.** Stronger here-state + one-line blurb per map; keep free/instant. | Four destinations; current disabled as here |

---

# Phase PL6 — Core-action feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL6.1 | **SFX for gather / build / travel.** Extend `game-audio` presets; play on success paths; respect mute. | New ids + mute edge; no invent economy |
| PL6.2 | **Brief success cue on prompt/info.** Short info flash or prompt pulse after plant/harvest/craft/travel success (not a permanent toast stack). | Cue clears quickly; min HUD stays clean |

---

# Priority order for the agent

```
PL1.1 → PL1.2 → PL1.3 → PL2.1 → PL2.2 → PL2.3 → PL3.1 → PL3.2
 → PL4.1 → PL4.2 → PL5.1 → PL5.2 → PL6.1 → PL6.2
```

Lowest pending ID first. When the queue empties, author the next **polish** appendix (player-visible) — do **not** resume CL fidelity recycle.

**Rolled over 2026-08-02:** PL1–PL6 done → [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7+).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands.md` | Original redesign (CL1–CL7) |
| `FullGameBuildPlan_CityLands_24.md` | Frozen fidelity recycle (CL99–CL102) |
| `AgentAutonomousLoop.md` | Tick rules → PL\* |
| `TASKS.md` | Live Polish queue |
| `docs/06_character_systems/Professions.md` | Canonical professions |
