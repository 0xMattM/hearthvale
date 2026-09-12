# Agent Autonomous Loop

**Status:** Active  
**Interval:** 15 minutes  
**Sentinel:** `AGENT_LOOP_TICK_full_game`  
**Meaning of sentinel (2026-08-03):** wake still prints `AGENT_LOOP_TICK_full_game`, but each tick means **Hardening RF\*** work — not Polish PL\* leftovers, not legacy F16.2–F17.5, and **not** CL fidelity recycle (CL99–CL102 frozen). Polish 41 (PL202–PL205) is **frozen**. Do not rename the sentinel unless the wake shell is restarted.

---

# Goal

Advance **production hardening and maintainability** against [FullGameBuildPlan_CityLands_Hardening.md](FullGameBuildPlan_CityLands_Hardening.md): auth, transactions, Postgres honesty, WS-first sync, catalog/GameApp splits, validation, coverage. Preserve PlayerVision gameplay; do not invent NFT combat power, dungeons, or caravans.

---

# Live queue the loop must read

| What | Where |
| --- | --- |
| **Active queue** | `TASKS.md` section **`### Hardening queue (RF*)`** (live) |
| Acceptance criteria | [FullGameBuildPlan_CityLands_Hardening.md](FullGameBuildPlan_CityLands_Hardening.md) |
| Product defaults | [PlayerVision_CityLands.md](PlayerVision_CityLands.md) |
| Frozen (ignore pending) | Polish 41 PL202–PL205 leftovers; CityLands CL99–CL102; F16.2–F17.5 |
| Archive | `TASKS.md` Polish PL\* history; Full game queue F8+ |

---

# Each tick — do this exactly

1. Read `TASKS.md` → section **Hardening queue (RF\*)** (any `pending` RF\* / remaining G0 rows).  
   - **Do not** pick frozen PL202–PL205.  
   - **Do not** pick F16.2–F17.5 or CL99–CL102.  
   - **Do not** pick RF3.3 unless a human explicitly asks.  
2. If there is at least one `pending` RF\* item (skip `deferred`):  
   a. Read acceptance from `FullGameBuildPlan_CityLands_Hardening.md`.  
   b. Pick the **first pending** item (lowest ID — e.g. RF1.1 before RF1.2).  
   c. Implement **only that item** (PR-sized). Prefer behavior-preserving + tests.  
   d. Add/adjust tests (≥1 happy, ≥1 fail or edge when logic changes).  
   e. Mark the item `done` in `TASKS.md`; Completed row; discoveries.  
   f. Amend README / PLANNING when env or supported drivers change.  
   g. Run tests (full or targeted).  
   h. Keep servers runnable; one watcher on :8787.  
   i. **Do not ask the user questions.** Log choices under Discovered.  

3. If **no pending RF\*** items remain (except deferred RF3.3):  
   a. Optionally resume frozen Polish leftovers **or** author Hardening 2 / playtest follow-ups — log under Discovered.  
   b. Prefer not to invent atmosphere-only Polish 42 unless product asks.  
   c. Never resume CL fidelity recycle.  

4. Never idle on an empty queue. Never stop the loop because the previous plan finished.

---

# Hard constraints

- No demo 10s crops.  
- No dashboard-only craft/buy.  
- NFT never = combat power.  
- No force-push, no git config changes, **no commits unless explicitly requested** (default: **do not commit**).  
- Never delete this file or the root FullGameBuildPlan.  
- **Do not resume frozen F16.2–F17.5.**  
- **Do not resume CL fidelity recycle (CL99+).**  
- **Do not resume frozen PL202–PL205** unless a human unfreezes them.  
- Do **not** invent past `PlayerVision_CityLands.md`.

---

# Wake process note

The PowerShell wake loop prints `AGENT_LOOP_TICK_full_game` every 15m. As long as that sentinel still fires and this file + `TASKS.md` Hardening section are current, **do not kill/restart** the wake shell just to retarget content — agents must follow this doc on each tick.

---

# Stop conditions

Only when a human stops the loop / kills the loop PID.
