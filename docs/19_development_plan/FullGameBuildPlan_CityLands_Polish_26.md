# Full Game Build Plan — CityLands Polish 26 (PL126+)

**Document Version:** 1.0.0  
**Status:** Done — PL126–PL130 complete; live queue → [FullGameBuildPlan_CityLands_Polish_27.md](FullGameBuildPlan_CityLands_Polish_27.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_25.md](FullGameBuildPlan_CityLands_Polish_25.md) (PL121–PL125 **done**) · [FullGameBuildPlan_CityLands_Polish_24.md](FullGameBuildPlan_CityLands_Polish_24.md) (PL116–PL120 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after crop·process·avatar·day·expand·trade·energy·eat·plaza·mute (PL121–PL125). Soft-refuse and map-bed campaigns are largely complete — shift to **self / health meter leftovers**, **production ready ambient**, **quest / inventory glanceables**, **map landmark leftovers**, and **settings chrome** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL126.1–PL130.2 **done** — queue emptied → Polish 27.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** invent caravan fares or refill single-land homestead as the default world.

---

# Phase order

```
PL126 Self / health meter leftovers
 → PL127 Production ready ambient
 → PL128 Quest / inventory glanceables
 → PL129 Map landmark leftovers
 → PL130 Settings chrome leftovers
```

---

# Phase PL126 — Self / health meter leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL126.1 | **Health-low soft world vignette.** Quiet cool/danger edge vignette while health is below the low threshold (complements TopBar PL67.1 / energy vignette PL124.1). | Threshold SoT unchanged; clears when recovered; mute ok; not a HUD column |
| PL126.2 | **Coins-gain soft reinforce.** Brief world or ephemeral reinforce when soft currency rises from vendor/market/quest (complements Sold/Bought cues) so coin inflow stays glanceable. | Prices / sinks unchanged; mute ok |

---

# Phase PL127 — Production ready ambient

| ID | Work | Acceptance |
| --- | --- | --- |
| PL127.1 | **Animal-pen ready soft pad pulse.** Soft pad/emissive pulse when pen is collect-ready (complements Ready label PL30.2 / ready edge PL69.2) so pens read at a glance like dock shimmer PL118.2. | Cooldown / rates unchanged; mute ok |
| PL127.2 | **Crop plant success soft reinforce.** Brief world or ephemeral reinforce on successful seed plant (complements gather/plant SFX) so empty→growing reads clearly. | Grow timers / seed rules unchanged; mute ok |

---

# Phase PL128 — Quest / inventory glanceables

| ID | Work | Acceptance |
| --- | --- | --- |
| PL128.1 | **Quest-ready soft row accent.** Quiet ready-row tint when a quest is claimable in Quest panel (complements claim cue PL29.3) so ready quests stay glanceable. | Quest catalog / claim rules unchanged; min HUD |
| PL128.2 | **Inventory pickup soft slot flash.** Brief slot/border flash when a stack qty rises or a new stack appears after gather/craft/buy (complements success SFX) so bag inflow stays readable. | Inventory capacity rules unchanged; mute ok |

---

# Phase PL129 — Map landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL129.1 | **Tutor-lane soft landmark strip.** Quiet cooler emissive or haze on the existing tutor-lane strip so tutorials read apart from warm scarce yard (complements plaza landmark PL125.1). | Tutor claim rules / layouts unchanged; no station invent |
| PL129.2 | **Arena plaque soft walk-up pulse.** Soft plaque emissive sine while arena board is interact-highlighted (complements PL41.2 haze / PL11.1 plaque) so optional warrior path stays glanceable. | Arena stub / no balance invent; mute ok |

---

# Phase PL130 — Settings chrome leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL130.1 | **Day-night toggle soft confirm.** Brief settings-row flash when enabling day/night cycle (complements mute-enable PL125.2) so cosmetic lighting toggle stays glanceable. | Cycle still cosmetic; settings only |
| PL130.2 | **Tips-toggle soft confirm.** Brief settings-row flash when enabling onboarding tips so tip preference stays glanceable beside mute/day toggles. | Tip ids / localStorage unchanged; settings only |

---

# Priority order for the agent

```
PL126.1 → PL126.2
 → PL127.1 → PL127.2
 → PL128.1 → PL128.2
 → PL129.1 → PL129.2
 → PL130.1 → PL130.2
```

Lowest pending ID first. When this queue empties, author **Polish 27** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** Queue emptied after PL130.2 → [FullGameBuildPlan_CityLands_Polish_27.md](FullGameBuildPlan_CityLands_Polish_27.md) (PL131–PL135).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_25.md` | PL121–PL125 (done) |
| `FullGameBuildPlan_CityLands_Polish_27.md` | PL131–PL135 (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
