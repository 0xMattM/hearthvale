# Development Sprint Plan — MVP Vertical Slice

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Engineering  
**Last Updated:** July 30, 2026

---

# Purpose

Ordered build plan for the playable MVP. Source of truth for numbers and systems:

1. [MVPDefinition.md](MVPDefinition.md) — scope  
2. [MVPContentLock.md](MVPContentLock.md) — frozen content  
3. [TASKS.md](../../TASKS.md) — live checklist  

**Rule:** no demo shortcuts. If code disagrees with Content Lock, fix the code.

---

# Done (baseline)

```
[x] Monorepo: apps/server (Hono) + apps/web (Next/R3F) + packages/shared
[x] Auth local (no wallet)
[x] Starter land + crop plots / mill / forge buildings
[x] Farmer plant → grow (3 min) → harvest
[x] Blacksmith / mill craft at stations + energy costs
[x] Soft currency Coins + tutorial vendor
[x] Tool durability on plant + bread energy restore
[x] HUD: energy, coins, inventory, station recipes
```

---

# Remaining MVP (priority order)

## P0 — Close the economy loop

| ID | Work | Acceptance |
| --- | --- | --- |
| P0.1 | **Direct P2P trade** | **Done** — offer/accept/reject, server-authoritative |
| P0.2 | **Specialization pressure** | **Done** — XP gates, dabbling energy tax, specialist harvest/energy bonus |
| P0.3 | **Empty slot spend sink** | **Done** — expand slots 6–7 with coins + iron bars + energy |

## P1 — Onboarding & clarity

| ID | Work | Acceptance |
| --- | --- | --- |
| P1.1 | **First-session guide** | **Done** — non-blocking tips: plant → wait/stations → harvest → craft → vendor |
| P1.2 | **Growth UI** | **Done** — field countdown synced via `syncedNow` + `formatGrowRemaining` |
| P1.3 | **Error copy** | **Done** — `ACTION_ERROR` plain-language messages |

## P2 — Hardening

| ID | Work | Acceptance |
| --- | --- | --- |
| P2.1 | **Server action unit tests** | **Done** — plant/harvest/craft/vendor happy + fail in `/tests` |
| P2.2 | **Telemetry stubs** | **Done** — stdout JSON + `/telemetry` counters |
| P2.3 | **Dev DX** | **Done** — `predev` free-ports, listen retry, README wipe notes |

## P3 — Post-MVP gate (do not start until P0 done)

```
Guilds, NFT land, combat, Cook profession, GLTF art, WebSockets marketplace
```

---

# Working loop (agent)

Each cycle:

1. Read `TASKS.md` + this plan + Content Lock.  
2. Pick the **next incomplete P0 → P1 → P2** item.  
3. Implement only that item (small PR-sized).  
4. Add/adjust tests (≥1 happy, 1 edge, 1 fail when touching logic).  
5. Mark done in `TASKS.md`; note discoveries.  
6. Leave servers runnable (`npm run dev`).

Stop a cycle if blocked on a design decision → add Open Question, do not invent.

---

# Definition of MVP done

All MVPDefinition deliverables checked, playtest can:

1. Two accounts trade  
2. Full chain Field → Mill/Forge → better hoe  
3. Energy + durability + coins sinks feel real  
4. No wallet  

Then validate success criteria before expanding scope.
