# Planning

**Last Updated:** September 11, 2026 (BUIDL CTC Attestcoin live; hardening RF*)

---

## Purpose

Orients contributors to architecture, goals, style, and constraints.

---

## Product goal

Persistent online sandbox with a **player-driven economy**. Creditcoin + Attestcoin are live for BUIDL CTC (REALM / land NFTs / item market). Chain is **ownership only — never combat power**.

> Build a living world that players enjoy inhabiting for years.

**Product direction override:** world layout is City / Player lands / Exploration / Warrior as separate maps — see `docs/19_development_plan/PlayerVision_CityLands.md`. Live work is **hardening / refactor** (`FullGameBuildPlan_CityLands_Hardening.md`, RF\* in `TASKS.md`). Polish 41 (`FullGameBuildPlan_CityLands_Polish_41.md`, PL202–PL205) is **frozen**. CL99–CL102 fidelity recycle is frozen. That vision overrides single-land MVP layout assumptions below. Captured there: canonical professions (`docs/06_character_systems/Professions.md`), **free travel** between the four maps, **absolute-minimum HUD** (panels on interaction), warrior = optional parallel combat path (not on the profession ladder), limited city production = scarce shared workstations (not daily/qty caps; player land = unlimited station builds — OQ-PV-005 closed).

---

## Implementation stack (locked)

| Layer | Choice |
| --- | --- |
| Client | Next.js + React Three Fiber + Drei + Tailwind-ready CSS |
| Server | Node.js + Hono monolith |
| DB | SQLite + Drizzle (supported). Postgres opt-in disabled until RF3.3 (`GAME_DB_DRIVER=postgres` hard-fails). |
| Auth | Local accounts; optional Creditcoin wallet (MetaMask). Chain never required to play. |
| Realtime | HTTP + WebSocket gateway (`/ws`) for presence/chat |

Decisions: Open Questions TQ-001 (monolith), TQ-002 (server auth), TQ-003 (client stack).

### Shared catalog module map (RF6)

| Module | Responsibility |
| --- | --- |
| `packages/shared/src/catalog.ts` | Stable barrel — re-exports items/recipes/buildings/cues + `SOFT_CURRENCY` |
| `catalog-items.ts` | `ItemId`, `ITEMS`, `TOOL_HUNT_DAMAGE` |
| `catalog-recipes.ts` | `ENERGY`, `CROPS`, `RECIPES`, profession/station recipe types |
| `catalog-buildings.ts` | Barrel → land, gather nodes, player stations, layouts, warrior/service, map identity |
| `catalog-land.ts` | `BuildingType`, land kinds + helpers |
| `catalog-gather-nodes.ts` | Tool repair, ore/stump/dock/pen/hunt node constants |
| `catalog-player-stations.ts` | Player-land place costs, housing, process/gather ready labels |
| `catalog-layouts.ts` | Explore / city templates + section helpers |
| `tutorial-npcs.ts` | Profession tutors + onboarding chain |
| `tutorial-civic-npcs.ts` | Civic Market Broker + Deed Clerk (optional chain) |
| `catalog-warrior-service.ts` | City service kits + warrior layout |
| `catalog-map-identity.ts` | `LAND_DESTINATIONS`, `MAP_IDENTITY`, portal/avatar tints |
| `catalog-cues.ts` | Barrel → `catalog-cues-01`…`30` (visual cue configs) |
| `visual-cue-math.ts` | Generic sine/flash envelopes (RF5) |

Public imports stay on `@game/shared` (no API break). Content Lock numbers live in these modules — do not invent demo values.

---

## MVP scope

See `docs/19_development_plan/MVPDefinition.md` and the frozen numbers in `docs/19_development_plan/MVPContentLock.md`.

Code must follow the Content Lock (energy, buildings/stations, coins, 3‑minute wheat, durability). Do not ship demo shortcuts that contradict it.

---

## Documentation architecture

- `docs/01_` … `docs/20_`
- Index: `PROJECTBIBLE.md`
- Economy SoT: `docs/07_economy/Economy.md`
- Combat SoT: `docs/05_gameplay_systems/Combat.md`

---

## Design constraints

- Player-driven economy; NPCs do not dominate markets  
- No class locks  
- Starter land full access; NFT land later = production only  
- Every session creates progress  
- Simplicity before complexity  

---

## Related

| File | Role |
| --- | --- |
| `PROJECTBIBLE.md` | Design index |
| `TASKS.md` | Live task queue (Hardening RF\* autonomous; Polish 41 frozen; VA\* idle) |
| `docs/19_development_plan/PlayerVision_CityLands.md` | Player vision override (4-map redesign) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Hardening.md` | **Live** hardening/refactor (RF*; next RF7.1) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_5.md` | Visual assets VA5.* (done) + post-survey **VA* idle** (no VA6) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_VisualAssets_4.md` | VA4.1–VA4.4 floors / HighlightRing (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_41.md` | Polish 41 **frozen** (PL202–PL205) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_40.md` | PL196–PL200 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_38.md` | PL186–PL190 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_37.md` | PL181–PL185 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_36.md` | PL176–PL180 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_34.md` | PL166–PL170 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_31.md` | PL151–PL155 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_29.md` | PL141–PL145 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_28.md` | PL136–PL140 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_24.md` | PL116–PL120 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_23.md` | PL111–PL115 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_20.md` | PL96–PL100 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_19.md` | PL91–PL95 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_18.md` | PL86–PL90 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_17.md` | PL81–PL85 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_16.md` | PL77–PL80 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_15.md` | PL73–PL76 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_14.md` | PL68–PL72 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_13.md` | PL63–PL67 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_12.md` | PL58–PL62 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_11.md` | PL53–PL57 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_10.md` | PL48–PL52 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_8.md` | PL38–PL42 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_7.md` | PL33–PL37 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_6.md` | PL28–PL32 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_5.md` | PL23–PL27 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_4.md` | PL18–PL22 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_3.md` | PL12–PL17 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish_2.md` | PL7–PL11 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_Polish.md` | PL1–PL6 polish (done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_24.md` | Frozen fidelity recycle (CL99–CL102) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_22.md` | Phase 22 done (CL91–CL94) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_21.md` | Phase 21 done (CL87–CL90) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_20.md` | Phase 20 done (CL83–CL86) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_19.md` | Phase 19 done (CL79–CL82) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_16.md` | Phase 16 done (CL67–CL70) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_15.md` | Phase 15 (CL63–CL66 done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_13.md` | Phase 13 (CL55–CL58 done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_12.md` | Phase 12 (CL51–CL54 done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_11.md` | Phase 11 (CL47–CL50 done) |
| `docs/19_development_plan/FullGameBuildPlan_CityLands_8.md` | Phase 8 (CL35–CL38 done) |
| `docs/19_development_plan/FullGameBuildPlan.md` | Legacy F8–F17 plan (Continuations → CityLands) |
| `docs/19_development_plan/AgentAutonomousLoop.md` | 15m agent loop rules |
| `README.md` | Run instructions |
