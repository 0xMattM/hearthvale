# Full Game Build Plan — CityLands Polish 30 (PL146+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_31.md](FullGameBuildPlan_CityLands_Polish_31.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_29.md](FullGameBuildPlan_CityLands_Polish_29.md) (PL141–PL145 **done**) · [FullGameBuildPlan_CityLands_Polish_28.md](FullGameBuildPlan_CityLands_Polish_28.md) (PL136–PL140 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after mines·vendor · homestead ambient · trade·bank · portal·map · claim·arena (PL141–PL145). Soft-refuse / settings / major landmark campaigns are largely complete — shift to **soft-war contest atmosphere**, **arena leave / exit chrome**, **guild-bank·invite confirms**, **mail·decor confirms**, and **repair·city market leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL146.1–PL150.2 done — queue emptied → Polish 31.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns.  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).  
- Do **not** invent caravan fares or refill single-land homestead as the default world.
- Do **not** invent deeper soft-war scoring or PvP wipe rules.

---

# Phase order

```
PL146 Soft-war contest atmosphere
 → PL147 Arena leave / exit chrome
 → PL148 Guild-bank / invite confirms
 → PL149 Mail / decor confirms
 → PL150 Repair / city market leftovers
```

---

# Phase PL146 — Soft-war contest atmosphere

| ID | Work | Acceptance |
| --- | --- | --- |
| PL146.1 | **Claim soft-war contest world cue.** Quiet contest tint/pulse on existing claim_node while `contestEndsAt` is active (complements held ownership PL145.1 + Soft war ephemeral PL31.2; no wars invent). | Soft-war rules unchanged; mute ok |
| PL146.2 | **Soft-war deliver soft world reinforce.** Brief soft rim when wood deliver scores during an open contest (complements Delivered · N PL31.2; scoring unchanged). | Deliver rules unchanged; mute ok; fail silent |

---

# Phase PL147 — Arena leave / exit chrome

| ID | Work | Acceptance |
| --- | --- | --- |
| PL147.1 | **Arena leave soft world reinforce.** Brief soft rim when leaving the Warrior Arena map (complements Arena enter PL145.2 + Arrived dest; stub / no balance invent). | Warrior optional; mute ok — **done** |
| PL147.2 | **Arena exit-portal soft pulse leftover.** Quiet warmer Exit pulse on warrior portals while interact-highlighted (complements Exit soft PL37.1 + free-travel cyan PL144.1; fare-free unchanged). | Travel rules unchanged; mute ok — **done** |

---

# Phase PL148 — Guild-bank / invite confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL148.1 | **Guild-bank withdraw soft confirm leftover.** Brief quiet confirm rim after bank withdraw ok (complements Withdrawn ephemeral + deposit rim PL143.2; bank caps unchanged). | Bank caps unchanged; mute ok; fail silent — **done** |
| PL148.2 | **Invite-accept soft world reinforce.** Brief soft rim when a guild/party invite accept succeeds (complements Joined / invite cues; no invite column invent). | Invite rules unchanged; mute ok; fail silent — **done** |

---

# Phase PL149 — Mail / decor confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL149.1 | **Mail-send soft world reinforce.** Brief soft rim after mail send ok (complements Sent / mail pending glance PL133.1; escrow unchanged). | Mail rules unchanged; mute ok; fail silent — **done** |
| PL149.2 | **Decor-place soft world reinforce.** Brief soft rim after decor place ok (complements decor SFX + cue PL16.2; costs / slots unchanged). | Decor costs unchanged; mute ok; fail silent — **done** |

---

# Phase PL150 — Repair / city market leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL150.1 | **Tool-repair soft world reinforce.** Brief soft rim after tool repair ok (complements repair success cue + tool-low vignette clear; mats unchanged). | Repair costs unchanged; mute ok; fail silent — **done** |
| PL150.2 | **City market board soft landmark cue.** Quiet warm commerce haze/emissive on existing city market board so hub trade reads at glance (complements market tip + commerce pad PL117.1; prices unchanged). | Layouts / prices unchanged; no board invent — **done** |

---

# Priority order for the agent

```
PL146.1 → PL146.2
 → PL147.1 → PL147.2
 → PL148.1 → PL148.2
 → PL149.1 → PL149.2
 → PL150.1 → PL150.2
```

Lowest pending ID first. When this queue empties, author **Polish 31** (player-visible) — do **not** resume CL fidelity recycle. — **done → Polish 31**

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_29.md` | PL141–PL145 (done) |
| `FullGameBuildPlan_CityLands_Polish_31.md` | PL151+ (live) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
