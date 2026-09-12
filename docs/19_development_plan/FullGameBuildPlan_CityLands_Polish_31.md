# Full Game Build Plan — CityLands Polish 31 (PL151+)

**Document Version:** 1.0.0  
**Status:** Done — archived; live queue → [FullGameBuildPlan_CityLands_Polish_32.md](FullGameBuildPlan_CityLands_Polish_32.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_30.md](FullGameBuildPlan_CityLands_Polish_30.md) (PL146–PL150 **done**) · [FullGameBuildPlan_CityLands_Polish_29.md](FullGameBuildPlan_CityLands_Polish_29.md) (PL141–PL145 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after soft-war · arena leave·exit · bank·invite · mail·decor · repair·market (PL146–PL150). Soft-refuse / settings / major landmark campaigns are largely complete — shift to **city vendor landmark**, **crop harvest / equip confirms**, **mail claim / vendor buy**, **notice civic / empty homestead leftovers**, and **arena board / market buy leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL151.1–PL155.2 done — queue emptied → Polish 32.

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
PL151 City vendor / crop harvest
 → PL152 Equip / mail claim
 → PL153 Vendor buy / notice landmark
 → PL154 Empty homestead / unequip
 → PL155 Arena board / market buy leftovers
```

---

# Phase PL151 — City vendor / crop harvest

| ID | Work | Acceptance |
| --- | --- | --- |
| PL151.1 | **City vendor soft landmark cue.** Quiet warm stall haze/emissive on existing city vendor_stall so hub NPC trade reads at glance (complements Explore vendor PL141.2 + market board PL150.2 + commerce pad PL117.1; prices unchanged). | Layouts / prices unchanged; no stall invent |
| PL151.2 | **Crop-harvest soft world reinforce.** Brief soft rim after harvest ok (complements plant sprout PL127.2 + ready rim PL142.2 + Harvested ephemeral; grow timers unchanged). | Grow / yield unchanged; mute ok; fail silent |

---

# Phase PL152 — Equip / mail claim

| ID | Work | Acceptance |
| --- | --- | --- |
| PL152.1 | **Equip soft world reinforce.** Brief soft rim after tool equip ok (complements Equipped PL20.2 + repair rim PL150.1; durability rules unchanged). | Equip rules unchanged; mute ok; fail silent |
| PL152.2 | **Mail-claim soft world reinforce.** Brief soft rim after mail claim ok (complements Parcel claimed PL17.2 + send rim PL149.1; escrow unchanged). | Mail rules unchanged; mute ok; fail silent |

---

# Phase PL153 — Vendor buy / notice landmark

| ID | Work | Acceptance |
| --- | --- | --- |
| PL153.1 | **Vendor-buy soft world reinforce.** Brief soft rim after vendor buy ok (complements Bought PL43.3 + coins-gain sell rim PL126.2; prices unchanged). | Prices unchanged; mute ok; fail silent |
| PL153.2 | **Notice-board soft landmark cue.** Quiet cool civic haze/emissive on existing city notice_board so hub notices read at glance (complements unread flicker PL117.2 + tip PL36.1; tip ids unchanged). | Layouts / tips unchanged; no board invent |

---

# Phase PL154 — Empty homestead / unequip

| ID | Work | Acceptance |
| --- | --- | --- |
| PL154.1 | **Empty-homestead path soft cue leftover.** Quiet cooler path emissive on existing empty yard path/cross so empty yards read apart from lived path PL142.1 (complements empty meadow PL114.1; layouts unchanged). | Layouts / slots unchanged; mute ok — **done** |
| PL154.2 | **Unequip soft world reinforce.** Brief soft rim after tool unequip ok (complements Unequipped / equip rim PL152.1; durability rules unchanged). | Equip rules unchanged; mute ok; fail silent — **done** |

---

# Phase PL155 — Arena board / market buy leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL155.1 | **Arena board soft landmark cue leftover.** Quiet warm plaque haze/emissive on existing arena_board so Warrior stub reads at glance (complements walk-up pulse PL129.2 + tip PL53.2; stub / no balance invent). | Layouts unchanged; warrior optional; mute ok — **done** |
| PL155.2 | **Market-buy soft world reinforce.** Brief soft rim after market buy ok (complements Bought + list rim PL138.1; escrow / fees unchanged). | Escrow unchanged; mute ok; fail silent — **done** |

---

# Priority order for the agent

```
PL151.1 → PL151.2
 → PL152.1 → PL152.2
 → PL153.1 → PL153.2
 → PL154.1 → PL154.2
 → PL155.1 → PL155.2
```

Lowest pending ID first. When this queue empties, author **Polish 32** (player-visible) — do **not** resume CL fidelity recycle.

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_30.md` | PL146–PL150 (done) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
