# Full Game Build Plan — CityLands Phase 9 (CL39+)

**Status:** Done sequel (CL39–CL42 complete; next = CityLands_10)  
**Created:** 2026-08-01  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior plans:** [FullGameBuildPlan_CityLands_8.md](FullGameBuildPlan_CityLands_8.md) (CL35–CL38), [_7](FullGameBuildPlan_CityLands_7.md), [_6](FullGameBuildPlan_CityLands_6.md), [_5](FullGameBuildPlan_CityLands_5.md), [_4](FullGameBuildPlan_CityLands_4.md), [_3](FullGameBuildPlan_CityLands_3.md), [_2](FullGameBuildPlan_CityLands_2.md), [base](FullGameBuildPlan_CityLands.md)  
**Next plan:** [FullGameBuildPlan_CityLands_10.md](FullGameBuildPlan_CityLands_10.md) (CL43+)  
**Live checklist:** [TASKS.md](../../TASKS.md) CityLands queue  

> Close remaining light economy outlets after food chain / craft sinks / Explore premium: carpenter crate sink outlet, land farmer mill loop, Explore gather→sell e2e, cook travel ration, scarce-city tip, optional warrior copy polish. Prefer city + land + explore. Warrior stays optional (no balance). NFT lands / dungeons / guild wars stay in FutureIdeas.

---

# Phase CL39 — Crate sink + land farmer loop

| ID | Work | Acceptance |
| --- | --- | --- |
| CL39.1 | **Wood crate vendor or market sink.** `wood_crate` lists on market and/or low NPC sell (Content Lock rate). | Sell or list OK; ≥1 failure |
| CL39.2 | **Land plant → harvest → mill flour smoke.** Player land: crop_plot wheat → mill → farmer XP (city mill already covered). | Happy land mill; ≥1 failure |
| CL39.3 | **Carpenter crate tip fidelity.** Notice or tutor basics name `assemble_wood_crate` / plank sink (id stable if extending existing tip). | Tip/tutor mention; tests |

---

# Phase CL40 — Explore e2e + cook ration + city tip

| ID | Work | Acceptance |
| --- | --- | --- |
| CL40.1 | **Explore gather → premium sell e2e.** Chop Explore stump → `vendorSell` wood at Explore rate (> City). | Live gather+sell; city contrast |
| CL40.2 | **Travel ration craft assert.** Kitchen `pack_travel_ration` → cook XP; eat restores energy (no combat). | Happy craft/eat; fail without mats |
| CL40.3 | **City scarce stations tip fidelity.** Notice tip still documents shared scarce stations vs unlimited land (id stable). | Tip body asserts; min HUD |

---

# Phase CL41 — Breeder / builder / decor polish

| ID | Work | Acceptance |
| --- | --- | --- |
| CL41.1 | **Breeder quest blurb names clean beat.** Tutor quest blurb or tools line already has wood — extend blurb if still feed-only; objective may stay `feed_animal_pen`. | Copy mentions feed + clean |
| CL41.2 | **Gate fishing_dock on builder XP.** Fifth costly station `minBuilderXp` (keep crop_plot / workshop / kitchen bootstrap). | Under-gated refuse; enough XP allows |
| CL41.3 | **Housing decor place smoke.** Place `decor_pad` (or planter) on land — coin/cosmetic only; never combat. | Place OK; city refuse or land-only per catalog |

---

# Phase CL42 — Warrior copy + verify

| ID | Work | Acceptance |
| --- | --- | --- |
| CL42.1 | **Warrior arena tip / plaque fidelity.** Optional path copy still clear; no balance numbers; no homestead training. | Tip/plaque asserts; warrior optional |
| CL42.2 | **Four-map free travel smoke.** City ↔ land ↔ explore ↔ warrior still immediate (no caravan). | Happy circuit; already-here refuse |
| CL42.3 | **Regression smoke after CL39–CL42.** Extend `citylands-smoke-cl8` (or companion) for crate sink, land mill, explore e2e sell, dock gate, decor. | Happy + ≥1 failure/edge green |

---

# Priority order

```
CL39.1 → CL39.2 → CL39.3 → CL40.1 → CL40.2 → CL40.3 → CL41.1 → CL41.2 → CL41.3 → CL42.1 → CL42.2 → CL42.3
```

---

# Related

| File | Role |
| --- | --- |
| `PlayerVision_CityLands.md` | Product defaults |
| `FullGameBuildPlan_CityLands_8.md` | Phase 8 (done) |
| `AgentAutonomousLoop.md` | Tick rules |
| `FutureIdeasBacklog.md` | NFT / dungeons / wars deferred |
| `docs/06_character_systems/Professions.md` | Canonical profession list |
