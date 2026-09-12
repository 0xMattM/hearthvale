# Full Game Build Plan — CityLands Hardening & Refactor (RF*)

**Document Version:** 1.0.1  
**Status:** Active — live queue; next RF1.2  
**Created:** 2026-08-03  
**Activated:** 2026-08-03 (Gate 0 fast-track — Polish 41 PL202–PL205 frozen)  
**Origin:** Project review 2026-08-03 (`canvases/project-review.canvas.tsx`)  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Live checklist:** [TASKS.md](../../TASKS.md) — section **Hardening queue (RF*)**  
**Frozen polish:** [FullGameBuildPlan_CityLands_Polish_41.md](FullGameBuildPlan_CityLands_Polish_41.md) (PL202–PL205)

---

# Goal

Ship the review package: **production hardening**, **sync/perf**, and **maintainability refactors** so the game stays playable while the codebase stops growing as one god-file + cue-copy farm.

> Build a living world players can inhabit — on code that a contributor can still change safely.

**Progress (2026-08-03):** G0–RF7.4 + RF9.1 **done** — **RF7.5** in progress (GameApp ~6560 lines; target ~2500).

**Activation:** Polish 41 leftovers **frozen**; AgentAutonomousLoop sentinel = Hardening RF\*.

---

# Non-goals

- Do **not** invent NFT mint, dungeons, caravans, guild wars, or warrior balance.  
- Do **not** resume CL99–CL102 fidelity recycle or F16.2–F17.5 content platform.  
- Do **not** grow always-on HUD columns or permanent toast stacks.  
- Do **not** change Content Lock economy numbers unless fixing a real bug.  
- Do **not** require a full rewrite in one PR — each RF* item is agent-sized.

---

# Phase order

```
Gate 0  Finish or freeze Polish 41
 → RF1  Auth / session / rate limits          (P0)
 → RF2  Economy transactions                   (P0)
 → RF3  Postgres honesty or async path         (P0)
 → RF4  WS-first sync + hub index + CORS       (P1 / perf)
 → RF5  Generic cue util + migrate families    (P1)
 → RF6  Split catalog.ts                       (P1)
 → RF7  Decompose GameApp.tsx                  (P1)
 → RF8  Split BuildingMesh + InstancedMesh     (P1 / perf)
 → RF9  Zod (or equivalent) API / WS schemas   (P1)
 → RF10 Coverage + HUD component tests         (P1)
 → RF11 Docs reconciliation + playtest sheet   (P2)
```

Lowest pending ID first within the active queue. Prefer **behavior-preserving** refactors with green tests over cosmetic polish while RF* is live.

---

# Gate 0 — Polish 41 closure

| ID | Work | Acceptance |
| --- | --- | --- |
| G0.1 | **Finish PL202–PL205** per Polish_41 **or** mark Polish 41 frozen with one-line Continuations note. | PL202–205 all `done` **or** explicit freeze row in TASKS — **done** (frozen 2026-08-03) |
| G0.2 | **Activate RF*** — TASKS live queue pointer + AgentAutonomousLoop “each tick” reads Hardening RF*; sentinel meaning = RF*. | Loop picks RF1.1 next — **done** |

---

# Phase RF1 — Auth / session / rate limits (P0)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF1.1 | **Session TTL.** Store `expiresAt` (or sliding window) on sessions; reject expired tokens in `userIdFromToken`. Default TTL ≥ 7d configurable via env. | Expired token → 401; tests: happy + expired — **done** (`createdAt` + `GAME_SESSION_TTL_MS`) |
| RF1.2 | **Logout / revoke.** `POST /api/auth/logout` deletes current session; client clears token on logout. | Revoked token fails; test + client path |
| RF1.3 | **Login rate limit.** Per-IP (and optionally per-username) bucket on `/auth/login` + `/auth/register`. | Burst blocked; legitimate login still works |
| RF1.4 | **Password floor.** Raise min length (e.g. 8); bump bcrypt cost if still at 8 without breaking existing hashes (cost on new hashes only). | New weak passwords rejected; old accounts still login |
| RF1.5 | **Chat / WS flood guard.** Per-user cooldown on chat + presence spam (token bucket). | Flood truncated; normal chat ok |

---

# Phase RF2 — Economy transactions (P0)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF2.1 | **`withTransaction` helper** for SQLite (`db.transaction`). Document Postgres follow-up (RF3). | Helper unit-tested; used by ≥1 call site |
| RF2.2 | **Market mutations** (`buy` / `list` / `cancel`) atomic. | Partial failure leaves no orphan escrow; tests |
| RF2.3 | **Trade accept** (and create-offer if multi-step) atomic. | No double-spend on concurrent accept (serialize); tests |
| RF2.4 | **Mail claim / send** atomic where multi-row. | Claim idempotent / no dupe items; tests |
| RF2.5 | **Concurrency smoke** — two overlapping market buys against one listing (SQLite). | Exactly one winner; loser clean error |

---

# Phase RF3 — Postgres path honesty (P0)

**Decision (locked in this plan):** ship **honesty first**, full async rewrite later.

| ID | Work | Acceptance |
| --- | --- | --- |
| RF3.1 | **Hard-fail Postgres.** If `GAME_DB_DRIVER=postgres`, exit/startup error with clear message until async layer exists. | Cannot boot half-broken PG |
| RF3.2 | **Docs.** README + PLANNING: SQLite is the supported driver; Postgres = future / unsupported. | No false “opt-in works” claim |
| RF3.3 | **(Optional later) Async AppDb.** Branch sync SQLite vs async PG repositories; migrate call sites incrementally. | Smoke test boots PG + one `/api/me`; **not required to close RF*** |

---

# Phase RF4 — WS-first sync + hub + CORS (P1)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF4.1 | **Presence WS-primary.** Remove or feature-flag off the 3s HTTP `apiReportPresence` heartbeat when WS auth+presence is connected; keep HTTP fallback if WS down. | One presence path in happy path; peers still update |
| RF4.2 | **State refresh.** Reduce blind 4s `/api/me` poll **or** trigger refresh on WS “dirty” events after mutations; visit poll may stay. | Fewer redundant full-state fetches; UI still consistent |
| RF4.3 | **Hub index.** `Map<landId, Set<client>>` (+ user index for pushes); stop full-set scan for land broadcast. | Unit test: broadcast only land peers |
| RF4.4 | **CORS from env.** `GAME_CORS_ORIGIN` (default localhost:3000). | Deployable without code edit |

---

# Phase RF5 — Generic cue utility (P1)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF5.1 | **Shared pulse/flash/contrast util** in `packages/shared` (config: period, color, width, opacity curve). | Pure tests for envelope/opacity |
| RF5.2 | **Migrate one gather family** (stump / ore / crop cues) to util; thin wrappers keep old export names. | Existing cue tests green |
| RF5.3 | **Migrate process-station family** (mill/forge/kitchen/workshop/loom/alchemy). | Tests green; no visual SoT number invent |
| RF5.4 | **success-cue.ts** — replace duplicated flash helpers with util where 1:1. | File shrinks; tests green |
| RF5.5 | **Cull dead re-exports** only after wrappers proven. | No broken imports |

---

# Phase RF6 — Split `catalog.ts` (P1)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF6.1 | Extract **items** (+ types) module; `catalog.ts` re-exports. | Imports still work; catalog tests green |
| RF6.2 | Extract **recipes** / craft tables. | Same |
| RF6.3 | Extract **buildings** / stations / layouts constants. | Same |
| RF6.4 | Extract **visual cue** configs (post-RF5) or leave thin shims. | Each new file ≪ 500 lines where practical |
| RF6.5 | **Barrel** `packages/shared/src/index.ts` stable; document module map in PLANNING or README snippet. | No public API break |

---

# Phase RF7 — Decompose `GameApp.tsx` (P1)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF7.1 | Extract **auth / token / refresh** hook(s). | GameApp thinner; behavior same |
| RF7.2 | Extract **travel / visit / map** state + handlers. | Same |
| RF7.3 | Extract **economy panels** wiring (market/trade/mail/vendor). | Same |
| RF7.4 | Extract **audio / ephemeral cue** orchestration. | Same |
| RF7.5 | Target: GameApp **&lt; ~2.5k lines** (stretch &lt; 1.5k). | Line count check in Discovered |

---

# Phase RF8 — `BuildingMesh` + render perf (P1)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF8.1 | Split **process stations** into dedicated mesh components. | Render parity; tests/helpers green |
| RF8.2 | Split **gather / civic / portal** groups similarly. | BuildingMesh shrinks |
| RF8.3 | **InstancedMesh pilot** for one repeated prop (crop plots **or** ore nodes). | Visible parity; note perf in Discovered |
| RF8.4 | Cap `useFrame` — share clocks / one ticker where pulses allow. | No regress; mute still ok |

---

# Phase RF9 — Request validation (P1)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF9.1 | Add **zod** (or project-standard schema lib); schemas for auth + top mutating routes (market, trade, mail, craft, build). | Bad body → 400; happy path ok |
| RF9.2 | Roll schemas to remaining `/api/*` action routes. | Consistent errors |
| RF9.3 | **WS message** schema for `auth` / `presence` / `chat`. | Malformed ignored/closed safely |

---

# Phase RF10 — Tests & coverage (P1)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF10.1 | Add `@vitest/coverage-v8` + `npm` script; document in README. | `vitest run --coverage` works |
| RF10.2 | **RTL + jsdom** — one HUD panel test (e.g. TravelPanel or TopBar chip). | ≥1 render test |
| RF10.3 | Shallow **GameApp** smoke (login shell / logged-out) if feasible without full R3F. | Does not require WebGL |
| RF10.4 | Optional CI coverage floor on `packages/shared` + `apps/server` (not 100% web). | Document threshold |

---

# Phase RF11 — Docs & playtest (P2)

| ID | Work | Acceptance |
| --- | --- | --- |
| RF11.1 | Reconcile [OpenQuestions.md](../20_appendices/OpenQuestions.md) items answered by shipped code. | Status → Resolved or note stub |
| RF11.2 | Annotate [MVPDefinition.md](MVPDefinition.md): CityLands expanded scope; checklist still historical. | No contradiction with PLANNING |
| RF11.3 | **Manual playtest sheet** (MVP success criteria 1–5) under `docs/19_development_plan/`. | Fillable checklist for humans |

---

# Priority order for the agent

```
G0.1 → G0.2
 → RF1.1 → … → RF1.5
 → RF2.1 → … → RF2.5
 → RF3.1 → RF3.2   (RF3.3 optional / skip unless requested)
 → RF4.1 → … → RF4.4
 → RF5.1 → … → RF5.5
 → RF6.1 → … → RF6.5
 → RF7.1 → … → RF7.5
 → RF8.1 → … → RF8.4
 → RF9.1 → … → RF9.3
 → RF10.1 → … → RF10.4
 → RF11.1 → … → RF11.3
```

When the queue empties: author **Hardening 2** only for leftover RF3.3 / further splits — **or** resume polish leftovers if product asks. Do **not** auto-resume CL fidelity recycle.

---

# Effort sketch (rough)

| Block | Agent ticks (15m) | Notes |
| --- | --- | --- |
| Gate 0 + RF1–RF3 | ~15–25 | P0; unblock real users |
| RF4 | ~8–12 | High UX/perf payoff |
| RF5–RF6 | ~20–35 | Mechanical; keep tests green |
| RF7–RF8 | ~25–40 | Highest merge risk; small PRs |
| RF9–RF10 | ~12–20 | Safety net |
| RF11 | ~3–5 | Docs only |

---

# Related

| File | Role |
| --- | --- |
| PlayerVision_CityLands.md | Product defaults (do not invent systems) |
| FullGameBuildPlan_CityLands_Polish_41.md | Finish or freeze before / when activating RF* |
| AgentAutonomousLoop.md | Update when RF* becomes live queue |
| TASKS.md | Hardening queue (RF*) checklist |
| FutureIdeasBacklog.md | NFT / dungeons / caravans stay deferred |
| project-review canvas | Review that spawned this plan |
