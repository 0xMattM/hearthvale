# Full Game Build Plan — CityLands Polish 34 (PL166+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_35.md](FullGameBuildPlan_CityLands_Polish_35.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_33.md](FullGameBuildPlan_CityLands_Polish_33.md) (PL161–PL165 **done**) · [FullGameBuildPlan_CityLands_Polish_32.md](FullGameBuildPlan_CityLands_Polish_32.md) (PL156–PL160 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after gather·fish · upgrade·expand · expand-pad·claim-empty · travel·day-night-enable · deed-desk·scarce Free settle (PL161–PL165). Soft-refuse / settings / major landmark campaigns are largely complete — shift to **scarce-busy / deed-claim rim leftovers**, **deed-mint / wallet-link rim leftovers**, **wallet-disconnect / portal Free landmark leftovers**, and **city scarce dock·loom / alchemy·pen landmark leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops, **NFT never = combat power**.

**Progress (2026-08-02):** PL166.1–PL170.2 done — queue emptied → Polish 35.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** invent caravan fares or refill single-land homestead as the default world.
- Do **not** invent deeper soft-war scoring or PvP wipe rules.
- Do **not** invent a new BuildingType for deed (wallet path stays B / DeedPanel).

---

# Phase order

```
PL166 Scarce-busy / deed-claim rim leftovers
 → PL167 Deed-mint / wallet-link rim leftovers
 → PL168 Wallet-disconnect / portal Free landmark leftovers
 → PL169 City fishing-dock / loom landmark leftovers
 → PL170 City alchemy-bench / animal-pen landmark leftovers
```

---

# Phase PL166 — Scarce-busy / deed-claim rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL166.1 | **Scarce-busy soft world reinforce leftover.** Brief soft rim when city scarce station edges free→busy (complements busy peer pulse PL115.1 + Free settle rim PL165.2; contention unchanged). | Contention unchanged; mute ok |
| PL166.2 | **Deed-claim soft world reinforce leftover.** Brief soft rim after cosmetic deed claim ok (complements Deed claimed ephemeral PL33.3 + desk landmark PL165.1; no combat power). | Wallet path unchanged; mute ok; fail silent |

---

# Phase PL167 — Deed-mint / wallet-link rim leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL167.1 | **Deed-mint soft world reinforce leftover.** Brief soft rim after mock mint ok (complements Deed minted ephemeral PL33.3 + desk landmark; stub only; no combat power). | Stub path unchanged; mute ok; fail silent |
| PL167.2 | **Wallet-link soft world reinforce leftover.** Brief soft rim after wallet link ok (complements Wallet linked ephemeral PL33.3; core loops stay wallet-free). | Core loops wallet-free; mute ok; fail silent |

---

# Phase PL168 — Wallet-disconnect / portal Free landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL168.1 | **Wallet-disconnect soft world reinforce leftover.** Brief soft rim after wallet disconnect ok (complements Wallet disconnected ephemeral PL33.3; core loops stay wallet-free). | Core loops wallet-free; mute ok |
| PL168.2 | **Portal Free soft landmark cue leftover.** Quiet cool Free cyan haze/emissive on existing portal while Free (complements Free portal pulse PL144.1 + travel rim PL164.1; fares free). | Fares free; mute ok |

---

# Phase PL169 — City fishing-dock / loom landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL169.1 | **City fishing-dock soft landmark cue leftover.** Quiet cool water haze/emissive on existing city scarce fishing_dock while on City (complements dock tip + Free/Busy pads; catch rates unchanged). | Catch rates unchanged; mute ok |
| PL169.2 | **City loom soft landmark cue leftover.** Quiet warm thread haze/emissive on existing city scarce loom while on City (complements weave craft cues + Free/Busy pads; recipes unchanged). | Recipes unchanged; mute ok |

---

# Phase PL170 — City alchemy-bench / animal-pen landmark leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL170.1 | **City alchemy-bench soft landmark cue leftover.** Quiet cool tonic haze/emissive on existing city scarce alchemy_bench while on City (complements brew cues + Free/Busy pads; recipes unchanged). | Recipes unchanged; mute ok |
| PL170.2 | **City animal-pen soft landmark cue leftover.** Quiet warm pen haze/emissive on existing city scarce animal_pen while on City (complements feed/collect cues + Free/Busy pads; yields unchanged). | Yields unchanged; mute ok |

---

# Priority order for the agent

```
PL166.1 → PL166.2
 → PL167.1 → PL167.2
 → PL168.1 → PL168.2
 → PL169.1 → PL169.2
 → PL170.1 → PL170.2
```

Lowest pending ID first. When this queue empties, author **Polish 35** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_33.md` | PL161–PL165 (done) |
| `FullGameBuildPlan_CityLands_Polish_35.md` | PL171+ (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
