# Full Game Build Plan

**Document Version:** 1.0.1  
**Status:** Archive for F8–F17 — live queue is CityLands  
**Owner:** Engineering  
**Last Updated:** August 1, 2026  

**Live redesign plan:** [FullGameBuildPlan_CityLands.md](FullGameBuildPlan_CityLands.md)  
**Canonical live checklist:** [TASKS.md](../../TASKS.md) (CityLands CL\* queue)  
**Agent loop rules:** [AgentAutonomousLoop.md](AgentAutonomousLoop.md)  
**Design SoT:** Project Bible under `docs/` · economy numbers still respect Content Lock unless this plan explicitly amends them · world layout SoT: [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  

---

# Purpose

Ordered, agent-sized work to take the playable vertical slice (P0–P7 done) to the **full game** described by Vision / Roadmap / FutureIdeas — without requiring a human at the keyboard each step.

Each tick implements **exactly one** pending item (smallest topmost incomplete ID), then marks it done in `TASKS.md`.

---

# Already shipped (do not redo)

```
P0–P7: auth, starter land, farm/craft/cook, energy, vendor, trade+escrow+tools,
market, visit, ore, hunt trail, proximity, chat, minimal guilds, tests, Windows DX
```

---

# Working rules (all phases)

1. Prefer **additive** schema migrations; avoid wiping `game.db` unless TASKS notes a wipe.  
2. Keep **walk-to-interact** MMO client — no dashboard-only gameplay.  
3. NFT / wallet never grants **combat power** (Bible rule).  
4. One item per tick; add ≥1 happy + 1 fail/edge test when touching logic.  
5. Update `TASKS.md` status immediately; append discoveries.  
6. Leave `npm run dev` / ports healthy; do not start duplicate `tsx watch` on :8787.  
7. **Do not stop to ask for approval.** If blocked on a real design fork, pick the option aligned with Vision/CorePillars, note it under Discovered, continue.  
8. Do not invent demo crop timers or decorative-only cubes.  

---

# Phase F8 — Realtime presence & multiplayer feel

| ID | Work | Acceptance |
| --- | --- | --- |
| F8.1 | Presence heartbeat API (report x,z every few s) | Server stores last pos per player; `/api/presence` nearby list |
| F8.2 | Show other players on your land + while visiting | Avatars (low-poly) at reported positions; poll or WS |
| F8.3 | WebSocket gateway (Hono/ws or separate) | Subscribe land channel; push presence + chat |
| F8.4 | Move world chat onto WS (HTTP fallback kept) | Messages appear without full refresh |
| F8.5 | Trade invite ping when nearby | Soft notification when offer arrives |

---

# Phase F9 — Combat depth (economy-fed, not treadmill)

| ID | Work | Acceptance |
| --- | --- | --- |
| F9.1 | Player combat stats: Health / Damage / Defense | Stored on player; shown in HUD |
| F9.2 | Game trail becomes real encounter | Short fight loop vs animal; leather/meat on win |
| F9.3 | Second creature + public edge zone | New mat used by a craft recipe |
| F9.4 | Tool/weapon soft combat role | Hammer or simple spear affects hunt damage |
| F9.5 | Death / downed: lose nothing valuable | Energy/time penalty only (Bible: no gear wipe) |

---

# Phase F10 — Professions & production chains

| ID | Work | Acceptance |
| --- | --- | --- |
| F10.1 | Hunter profession XP from hunts | Separate from farmer; HUD |
| F10.2 | Carpenter (or Woodcutter) + wood items | ≤15 new SKUs careful; station on land |
| F10.3 | Longer food chain (stew / ration) | Cook sinks more mats; energy tiers |
| F10.4 | Building upgrades (mill/forge T2) | Coin+mat sink; small throughput bonus |
| F10.5 | Recipe book UI at stations | Shows gates, inputs, XP requirements clearly |

---

# Phase F11 — World & travel

| ID | Work | Acceptance |
| --- | --- | --- |
| F11.1 | Second biome stub (map select / portal) | Distinct land template; shared account |
| F11.2 | Caravan / travel timer between regions | Soft currency or mat cost; not instant |
| F11.3 | Regional vendor price variance | Telemetry exposes regional prices |
| F11.4 | Marketplace listing TTL + fees | Listings expire; small coin sink |
| F11.5 | Player housing decor slots (cosmetic) | No combat power |

---

# Phase F12 — Guilds & territory

| ID | Work | Acceptance |
| --- | --- | --- |
| F12.1 | Guild ranks + invite codes | Owner/officer/member |
| F12.2 | Guild bank (shared stackables) | Server-authoritative deposits/withdraw |
| F12.3 | Claim node (neutral resource point) | Guild can claim; produces mats on timer |
| F12.4 | Contested claim soft war | Schedule window; score from deliveries not PvP wipe |
| F12.5 | Guild chat channel | Separate from world chat |

---

# Phase F13 — Progression, quests, UX

| ID | Work | Acceptance |
| --- | --- | --- |
| F13.1 | Character level from characterXp | Soft unlocks (slot cosmetics / tips) |
| F13.2 | Quest system: 5 starter quests | Track + claim; teach loop |
| F13.3 | Achievements stubs | Counters + UI list |
| F13.4 | Mail / offline trade delivery | Accept when online |
| F13.5 | Settings + keybind help screen | In-game |

---

# Phase F14 — Art & audio pipeline

| ID | Work | Acceptance |
| --- | --- | --- |
| F14.1 | GLTF loader path + one hero building | Mill or forge replaced; kits remain fallback |
| F14.2 | Avatar GLTF or improved kit | Distinct silhouette |
| F14.3 | Crop / ore / trail visual polish | Readable states |
| F14.4 | BGM + SFX hooks (mute toggle) | At least plant/craft/hunt cues |
| F14.5 | Lighting / day-night cosmetic cycle | No gameplay power |

---

# Phase F15 — Blockchain (ownership only)

| ID | Work | Acceptance |
| --- | --- | --- |
| F15.1 | Wallet connect stub (optional) | Core play works without wallet |
| F15.2 | Off-chain “deed” record for premium land | Server table; no combat bonus |
| F15.3 | Mint/list stub UI (testnet or mock) | Clear “cosmetic/production upside only” |
| F15.4 | On-chain marketplace read-only view | Prices mirrored; not required to play |
| F15.5 | Security review: never gate energy/combat on chain | Doc + code assert |

---

# Phase F16 — Platform & scale

| ID | Work | Acceptance |
| --- | --- | --- |
| F16.1 | Postgres adapter behind Drizzle | Env switch; SQLite still default |
| F16.2 | Docker compose (api+web+db) | README one-command |
| F16.3 | Auth hardening (rate limit, bcrypt cost) | Basic abuse resistance |
| F16.4 | Structured logging + richer telemetry | Session length, market prices, supply |
| F16.5 | CI: test + lint on PR | GitHub Action |

---

# Phase F17 — Early Access gate

| ID | Work | Acceptance |
| --- | --- | --- |
| F17.1 | Playtest checklist automation | Script hits health + smoke actions |
| F17.2 | Balance pass doc from telemetry | Written notes in docs/20_appendices |
| F17.3 | Content freeze tag | Git tag + Changelog |
| F17.4 | Open signup / wipe policy documented | README |
| F17.5 | Roadmap residual → backlog only | FutureIdeas updated |

---

# Priority order for the agent

```
F8 → F9 → F10 → F11 → F12 → F13 → F14 → F15 → F16 → F17
→ then plan rollover (F18+, F19+, …) per AgentAutonomousLoop.md
```

Within a phase: lowest incomplete ID first.

---

# Continuations (rollover plans)

**Active continuation (2026-08-02):** [FullGameBuildPlan_CityLands_24.md](FullGameBuildPlan_CityLands_24.md) — Explore→land craft / land sinks·energy eat / visit·trade·market / min HUD·free travel (CL99–CL102). Phase 23 [FullGameBuildPlan_CityLands_23.md](FullGameBuildPlan_CityLands_23.md) (CL95–CL98) complete.

When the **CityLands** queue has **zero pending** tasks, the autonomous loop must create the next appendix and refill `TASKS.md` — it must **not** go idle.

| Appendix | Status |
| --- | --- |
| [FullGameBuildPlan_CityLands_24.md](FullGameBuildPlan_CityLands_24.md) | **Active** — live agent queue (CL99+) |
| [FullGameBuildPlan_CityLands_23.md](FullGameBuildPlan_CityLands_23.md) | Phase 23 done (CL95–CL98) |
| [FullGameBuildPlan_CityLands_22.md](FullGameBuildPlan_CityLands_22.md) | Phase 22 done (CL91–CL94) |
| [FullGameBuildPlan_CityLands_21.md](FullGameBuildPlan_CityLands_21.md) | Phase 21 done (CL87–CL90) |
| [FullGameBuildPlan_CityLands_20.md](FullGameBuildPlan_CityLands_20.md) | Phase 20 done (CL83–CL86) |
| [FullGameBuildPlan_CityLands_19.md](FullGameBuildPlan_CityLands_19.md) | Phase 19 done (CL79–CL82) |
| [FullGameBuildPlan_CityLands_18.md](FullGameBuildPlan_CityLands_18.md) | Phase 18 done (CL75–CL78) |
| [FullGameBuildPlan_CityLands_17.md](FullGameBuildPlan_CityLands_17.md) | Phase 17 done (CL71–CL74) |
| [FullGameBuildPlan_CityLands_16.md](FullGameBuildPlan_CityLands_16.md) | Phase 16 done (CL67–CL70) |
| [FullGameBuildPlan_CityLands_15.md](FullGameBuildPlan_CityLands_15.md) | Phase 15 done (CL63–CL66) |
| [FullGameBuildPlan_CityLands_14.md](FullGameBuildPlan_CityLands_14.md) | Done — CL59–CL62 |
| [FullGameBuildPlan_CityLands_13.md](FullGameBuildPlan_CityLands_13.md) | Done — CL55–CL58 |
| [FullGameBuildPlan_CityLands_12.md](FullGameBuildPlan_CityLands_12.md) | Done — CL51–CL54 |
| [FullGameBuildPlan_CityLands_11.md](FullGameBuildPlan_CityLands_11.md) | Done — CL47–CL50 |
| [FullGameBuildPlan_CityLands_10.md](FullGameBuildPlan_CityLands_10.md) | Done — CL43–CL46 |
| [FullGameBuildPlan_CityLands_9.md](FullGameBuildPlan_CityLands_9.md) | Done — CL39–CL42 |
| [FullGameBuildPlan_CityLands_8.md](FullGameBuildPlan_CityLands_8.md) | Done — CL35–CL38 |
| [FullGameBuildPlan_CityLands_7.md](FullGameBuildPlan_CityLands_7.md) | Done — CL31–CL34 |
| [FullGameBuildPlan_CityLands_6.md](FullGameBuildPlan_CityLands_6.md) | Done — CL27–CL30 |
| [FullGameBuildPlan_CityLands_5.md](FullGameBuildPlan_CityLands_5.md) | Done — CL23–CL26 |
| [FullGameBuildPlan_CityLands_4.md](FullGameBuildPlan_CityLands_4.md) | Done — CL18–CL22 |
| [FullGameBuildPlan_CityLands_3.md](FullGameBuildPlan_CityLands_3.md) | Done — CL13–CL17 |
| [FullGameBuildPlan_CityLands_2.md](FullGameBuildPlan_CityLands_2.md) | Done — CL8–CL12 |
| [FullGameBuildPlan_CityLands.md](FullGameBuildPlan_CityLands.md) | Done — CL1–CL7 |

Suggested post-CityLands themes (pick from Bible / FutureIdeas when rolling):

- Remaining profession tutorial NPCs + station coverage  
- NFT lands as separate maps (production only)  
- Deeper regional economies / taxes  
- Dungeons & world bosses feeding craft mats  
- Guild territory wars (no NFT combat power)  
- Warrior arena depth (still optional path)  
- Live-ops events, seasons, cosmetics store (soft currency)  
- Deferred F16–F17 platform items (Docker, CI, wipe policy)  
- Mobile / performance / accessibility  

---

# Definition of “Early Access complete” (F17)

All F8–F17 items `done` in `TASKS.md`, tests green, playable without wallet. After that, rollover plans continue the Vision indefinitely until a human stops the loop.
