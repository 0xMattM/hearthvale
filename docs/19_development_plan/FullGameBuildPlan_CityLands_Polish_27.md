# Full Game Build Plan — CityLands Polish 27 (PL131+)

**Document Version:** 1.0.0  
**Status:** Done — PL131–PL135 complete; live queue → [FullGameBuildPlan_CityLands_Polish_28.md](FullGameBuildPlan_CityLands_Polish_28.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_26.md](FullGameBuildPlan_CityLands_Polish_26.md) (PL126–PL130 **done**) · [FullGameBuildPlan_CityLands_Polish_25.md](FullGameBuildPlan_CityLands_Polish_25.md) (PL121–PL125 **done**) · earlier PL* archives via `TASKS.md`  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after health·coins·pen·plant·quest·inventory·tutor·arena·day·tips (PL126–PL130). Soft-refuse / settings-chrome / landmark campaigns are largely complete — shift to **craft·gather success world reinforces**, **fish·tool leftovers**, **mail·travel glanceables**, **build·peer atmosphere**, and **scarce Free / level-up leftovers** — still min HUD, four free maps, no economy invent, blockchain stays invisible in core farm/craft loops.

**Progress (2026-08-02):** PL131.1–PL135.2 **done** — queue emptied → Polish 28.

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
PL131 Craft / gather success reinforces
 → PL132 Fish / tool leftovers
 → PL133 Mail / travel glanceables
 → PL134 Place / peer atmosphere
 → PL135 Free sticky / progress leftovers
```

---

# Phase PL131 — Craft / gather success reinforces

| ID | Work | Acceptance |
| --- | --- | --- |
| PL131.1 | **Craft-complete soft bench flash.** Brief soft emissive/pad settle on the active process station when craft succeeds (complements Crafted + craft SFX + working emissive PL121.2). | Recipes / XP unchanged; mute ok; fail silent |
| PL131.2 | **Gather-success soft pad flash.** Brief pad/rim flash on stump / ore / pen after successful gather (complements gather SFX + Chopped/Mined/Collected PL43.1 + inventory flash PL128.2). | Yields / cooldowns unchanged; mute ok |

---

# Phase PL132 — Fish / tool leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL132.1 | **Fish-catch soft splash reinforce.** Soft water/pad splash or rim on successful dock catch (complements Caught PL43.1 + ready shimmer PL118.2; distinct from chop/mine pad flash). | Catch rates / cooldown unchanged; mute ok |
| PL132.2 | **Tool-low soft world leftover.** Quiet edge tint or equipped-tool world cue while equipped tool stays in the low-durability band (complements TopBar PL61.1 + inventory accent PL21.1; not a HUD column). | Durability / break rules unchanged; clears when repaired/replaced; mute ok |

---

# Phase PL133 — Mail / travel glanceables

| ID | Work | Acceptance |
| --- | --- | --- |
| PL133.1 | **Mail-pending closed glance.** Soft min-HUD glance (quiet TopBar/L chip or hotkey hint) while inbox has pending parcels and Mail is closed (complements panel unread PL17.1 + open accent PL34.1; no always-on mail column). | Mailbox rules unchanged; clears when inbox empty or panel open |
| PL133.2 | **TravelPanel destination map-tint.** Quiet destination-row accents matching TopBar map-chip colors for City/Land/Explore/Arena (complements chip PL14.1, arrive pulse PL40.2, Arrived whisper PL115.2). | Fare-free destinations unchanged; Here state still readable |

---

# Phase PL134 — Place / peer atmosphere

| ID | Work | Acceptance |
| --- | --- | --- |
| PL134.1 | **Build-place soft spawn flash.** Brief pad/spawn emissive when a homestead station places successfully (complements Built PL28.3 / Homestead PL25.2 + beacon hide PL3.1). | Place costs / slots unchanged; mute ok |
| PL134.2 | **Peer range-exit soft fade.** Soft halo/ring fade when a nearby peer leaves interact range (complements enter ping PL15.2 + silhouette PL40.3; no nearby-list growth). | Presence rules unchanged; zero peers stays quiet |

---

# Phase PL135 — Free sticky / progress leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| PL135.1 | **Scarce Free sticky world label.** Quiet sticky Free world label (or cooler free-pad readability) while a city scarce station is free — pairs with sticky Busy PL8.1 and settle flash PL119.1. | Contention rules unchanged; land unlimited unchanged; mute ok |
| PL135.2 | **Level-up soft world reinforce.** Brief soft world rim when character level rises (complements Level N ephemeral PL47.1 + coins-gain rim PL126.2; no XP bar invent). | XP curve / titles unchanged; mute ok |

---

# Priority order for the agent

```
PL131.1 → PL131.2
 → PL132.1 → PL132.2
 → PL133.1 → PL133.2
 → PL134.1 → PL134.2
 → PL135.1 → PL135.2
```

Lowest pending ID first. When this queue empties, author **Polish 28** (player-visible) — do **not** resume CL fidelity recycle.

---

# Continuations

- **2026-08-02:** Queue emptied after PL135.2 → live appendix [FullGameBuildPlan_CityLands_Polish_28.md](FullGameBuildPlan_CityLands_Polish_28.md) (PL136–PL140).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_26.md` | PL126–PL130 (done) |
| `AgentAutonomousLoop.md` | Loop rules / sentinel |
| `TASKS.md` | Live PL\* checklist |
