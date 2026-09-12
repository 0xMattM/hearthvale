# Full Game Build Plan — CityLands Phase 2 (CL8+)

**Status:** Done sequel (CL8–CL12 complete; next = CityLands_3)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plan:** [FullGameBuildPlan_CityLands.md](FullGameBuildPlan_CityLands.md) (CL1–CL7 done)  
**Next plan:** [FullGameBuildPlan_CityLands_3.md](FullGameBuildPlan_CityLands_3.md) (CL13+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Depth over new pillars. Prefer city + player-land economy, explore mats feeding crafts, warrior stays optional. Do not invent combat balance or abstract daily caps.

---

# Phase CL8 — City profession depth

| ID | Work | Acceptance |
| --- | --- | --- |
| CL8.1 | **Seed next tutorial NPC batch.** Add ≥3 more economy tutors in the city (from `Professions.md` / `TUTORIAL_NPCS` stubs not yet seeded). | Walk-up panels work; claims persist; warrior still absent from ladder |
| CL8.2 | **Scarce stations for seeded tutors.** Ensure each newly seeded profession has at least one scarce shared station or gather node on the city template (no homestead refill). | Players can practice that profession in city without owning land |
| CL8.3 | **City event / notice board stub.** Walk-up board with static tips (travel circuit, scarce stations, warrior optional) — no live-ops backend. | Panel opens on interact only; closed by default |

---

# Phase CL9 — Player land production depth

| ID | Work | Acceptance |
| --- | --- | --- |
| CL9.1 | **More buildable station types** aligned to economy professions already in catalog (e.g. kitchen/forge already; add next missing craft station if Content Lock allows). | Build board lists new type; unlimited per type on player land; city place still blocked |
| CL9.2 | **Land→City produce loop tip.** After first land craft, onboarding or board tip nudges selling/listing in City (no forced quest). | Tip/copy exists; does not reopen always-on HUD columns |

---

# Phase CL10 — Exploration mat economy

| ID | Work | Acceptance |
| --- | --- | --- |
| CL10.1 | **Explore section labels / wayfinding.** Lightweight in-world or prompt distinction between woodland / mines / hunt areas (no new map). | Player can tell zones apart; hunt still explore-only |
| CL10.2 | **Hunt/gather → city vendor value check.** Confirm explore mats sell better at explore or city per existing regional books; document in README tip. | Tests assert regional price difference; copy matches |

---

# Phase CL11 — Warrior optional (no balance)

| ID | Work | Acceptance |
| --- | --- | --- |
| CL11.1 | **Arena plaque copy + exit clarity.** Strengthen optional/no-ladder messaging; portal/N exit obvious. | No combat gear ladder; enter/exit free |
| CL11.2 | **Spectator-safe empty ring.** Ensure no homestead warrior training buildings can be placed on player land. | Build/catalog guards; test failure case |

---

# Phase CL12 — Verification / hub defaults

| ID | Work | Acceptance |
| --- | --- | --- |
| CL12.1 | **First-session City hub tip.** New players see a one-shot tip that City is the shared hub (default land may still be empty player_land). | Tip dismissible; minimal HUD preserved |
| CL12.2 | **Regression: four-map smoke stays green.** Extend CL7.2 smoke if CL8–CL11 change templates. | `citylands-smoke-cl7` (or successor) green |

---

# Priority order

```
CL8.1 → CL8.2 → CL8.3 → CL9.1 → CL9.2 → CL10.1 → CL10.2 → CL11.1 → CL11.2 → CL12.1 → CL12.2
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands.md` | Phase 1 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT lands / dungeons / wars deferred — not in this slim sequel |
