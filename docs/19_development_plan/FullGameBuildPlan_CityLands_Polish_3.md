# Full Game Build Plan — CityLands Polish 3 (PL12+)

**Document Version:** 1.0.0  
**Status:** Done — PL12–PL17 complete; live queue → [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior polish:** [FullGameBuildPlan_CityLands_Polish_2.md](FullGameBuildPlan_CityLands_Polish_2.md) (PL7–PL11 **done**) · [FullGameBuildPlan_CityLands_Polish.md](FullGameBuildPlan_CityLands_Polish.md) (PL1–PL6 **done**)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Polish queue (PL*)**  
**Agent loop:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)

---

# Goal

Continue **player-visible / audible polish** after warrior atmosphere (PL11). Focus on ready-state readability, onboarding cues, quiet map identity, visit/social feedback, and soft refuse/confirm audio — still min HUD, four free maps, no economy invent.

**Not this plan:** fidelity recycle (CL99–CL102 frozen). Prefer see/hear changes over assert-only re-runs.

---

# Non-goals

- Do **not** resume F16.2–F17.5 or CL99–CL102.  
- Do **not** invent professions, warrior balance, NFT combat power, or city daily caps.  
- Do **not** grow always-on HUD columns (map chip must stay a single quiet status glyph/line).  
- Do **not** add a permanent toast stack (reuse PL6.2 ephemeral cue pattern).

---

# Phase order

```
PL12 Ready-state world feedback
 → PL13 Onboarding / first-session clarity
 → PL14 Quiet map identity
 → PL15 Visit / social feedback
 → PL16 Refuse + decor confirms
 → PL17 Mail / notice accents
```

---

# Phase PL12 — Ready-state world feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL12.1 | **Crop ready world pulse.** Plot that is harvest-ready gets a soft pad/emissive or brief pulse so ripe crops read at a glance. | No timer retune; empty/growing plots stay quiet |
| PL12.2 | **Gather node depleted cue.** Depleted tree/ore (or similar) shows a quiet world/state tint distinct from ready nodes. | Explore + land gather; no spawn-rate invent |

---

# Phase PL13 — Onboarding / first-session clarity

| ID | Work | Acceptance |
| --- | --- | --- |
| PL13.1 | **First free-travel tip.** One-shot tip (or strengthen existing) after city hub / first portal: four maps, fare-free, N opens travel. | Dismissible; min HUD; no sticky panel |
| PL13.2 | **Tutor claim brief cue.** On successful tutorial objective claim, ephemeral TopBar cue (PL6.2 style) — not a new always-on column. | Mute/fail paths clean; XP numbers unchanged |

---

# Phase PL14 — Quiet map identity

| ID | Work | Acceptance |
| --- | --- | --- |
| PL14.1 | **Current-map chip.** Quiet TopBar glyph/word for City / Land / Explore / Arena — single status, not a dashboard column. | Updates on travel; warrior still optional wording |
| PL14.2 | **Portal mesh tint by destination.** Portal silhouette/tint hints which map it leads toward (or circuit role) without new buildings. | Fare-free prompts unchanged; warrior exit still Exit-first |

---

# Phase PL15 — Visit / social feedback

| ID | Work | Acceptance |
| --- | --- | --- |
| PL15.1 | **Visit arrive confirm.** Soft SFX and/or ephemeral cue when visit lands successfully. | Own-land / refuse paths silent; mute ok |
| PL15.2 | **Nearby peer soft ping.** When a peer enters interact range, a quiet world ring or prompt detail — no always-on nearby list growth. | Zero peers stays quiet (PL2.2); no spam |

---

# Phase PL16 — Refuse + decor confirms

| ID | Work | Acceptance |
| --- | --- | --- |
| PL16.1 | **Soft refuse SFX.** Distinct quiet refuse tone on common action failures (busy/energy/already-here); not arcade spam. | Success cues unchanged; mute ok |
| PL16.2 | **Decor place success cue.** Brief confirm when housing decor places (SFX and/or ephemeral line). | Costs unchanged; fail silent or refuse path |

---

# Phase PL17 — Mail / notice accents

| ID | Work | Acceptance |
| --- | --- | --- |
| PL17.1 | **Unread mail / notice accent.** Soft world or prompt accent when mail/notice has unread content. | Opens same panels; no new HUD column |
| PL17.2 | **Mail claim success cue.** Ephemeral TopBar cue on parcel claim (PL6.2 / PL10.2 pattern). | Escrow rules unchanged; mute ok |

---

# Priority order for the agent

```
PL12.1 → PL12.2 → PL13.1 → PL13.2 → PL14.1 → PL14.2
 → PL15.1 → PL15.2 → PL16.1 → PL16.2 → PL17.1 → PL17.2
```

Lowest pending ID first. When this queue empties, author **Polish 4** (player-visible) — do **not** resume CL fidelity recycle.

**Rollover (2026-08-02):** Queue emptied after PL17.2 → [FullGameBuildPlan_CityLands_Polish_4.md](FullGameBuildPlan_CityLands_Polish_4.md) (PL18–PL22).

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 (done) |
| `FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 (done) |
| `docs/14_audio/AudioDirection.md` | Audio goals |
| `AgentAutonomousLoop.md` | Tick rules → PL\* |
| `TASKS.md` | Live Polish queue |
