# MVP Content Lock

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Product & Engineering  
**Last Updated:** August 1, 2026

---

# Purpose

Freeze the exact content and systems implemented in code for the MVP vertical slice.

This document is the bridge between the Project Bible and `packages/shared` + `apps/server`.

If code disagrees with this file, **fix the code**. If this file disagrees with Vision / Core Pillars / MVP Definition, **fix this file** after design review.

---

# Scope Reminder

From [MVPDefinition.md](MVPDefinition.md):

- Farmer + Blacksmith only  
- One production chain  
- Soft currency only (no wallet)  
- Starter Land only  
- Two sinks: crafting costs + tool durability  
- Energy gates production (see Energy.md)  
- Stations required for processing/crafting (see Crafting.md)

---

# Soft Currency

| Field | Value |
| --- | --- |
| ID | `coins` |
| Display name | Coins |
| Storage | `players.soft_currency` (not an inventory stack) |
| Sources (MVP) | Tutorial vendor buyback of excess wheat/flour/ore (low rate); never primary sink for player wealth |
| Sinks (MVP) | Buy wheat seeds; **expand land slots 6–7**; **mill/forge T2 upgrades** (60 coins + mats) |

Premium / chain currencies: **out of MVP**.

---

# Energy

| Field | Value |
| --- | --- |
| Max (start) | 100 |
| Regen | +1 every 30s while below max |
| Plant crop | 5 |
| Harvest crop | 5 |
| Craft / smelt / mill / bake | 10 |
| Gather ore | 8 |
| Consume bread | restores 25 energy and 25 HP (does not consume energy) |
| Consume cloth bandage | restores 20 energy and 20 HP (CL29.2; does not consume energy) |
| Build / expand slot | 15 |

No energy for: trade UI, inventory view, visiting land, reading recipes.

---

# Health

| Field | Value |
| --- | --- |
| Max (start) | 100 |
| Regen | +1 every 30s while below max (paused during an open live fight) |
| Downed | HP set to 1 (energy penalty + zone cooldown unchanged) |
| Eat edible | restores HP equal to that food's energy restore |

Food is the fast recover path after a fight; passive regen is the backup. Eating never changes damage or defense.

---

# Starter Land

| Field | Value |
| --- | --- |
| Kind | `player_land` (legacy alias `starter`) |
| Build slots | 8 (capacity hint) |
| Production bonuses | none on T1; mill/forge **T2** → −2 craft energy +1 stackable output |
| Tradable | no |

### CityLands free player land (CL3.1)

First land is **small and empty of production**. Bootstrap / load / visit **do not** re-seed mill/forge/kitchen/vendor/trails.

| Slot | Building | Role |
| --- | --- | --- |
| 20 | `build_board` | Non-production marker — walk-up opens **pickup** panel (homestead editor override; was place-station CL3.2) |

Legacy packed layout (`STARTER_BUILDINGS`) remains as an **explicit test seed only** (`ensureStarterYardBuildings`), not applied on load.

### Player-land station builds (CL3.2 → homestead editor override 2026-08-15)

**Override:** Stations are **crafted as inventory kits** at the workshop (wait/collect; materials below; energy = craft energy; **no coins**). Placement on own land is free (Inventory → Place → grid editor with hover ghost). **Build Board is pickup-only** (lift → kit back; no cost/cooldown; tier preserved on the kit). Unlimited per type on player land; city scarcity unchanged. Decor kits craftable too (see below).

| Station | Kit item | Craft materials | Builder XP gate (craft) |
| --- | --- | --- | --- |
| `crop_plot` | `crop_plot_kit` | 2× Wood | 0 |
| `tree_stump` | `tree_stump_kit` | 1× Wood | 0 |
| `ore_node` | `ore_node_kit` | 1× Iron Ore | 0 |
| `workshop` | `workshop_kit` | 4× Wood + 2× Plank | 0 |
| `mill` | `mill_kit` | 3× Wood + 1× Iron Bar | 8 |
| `forge` | `forge_kit` | 2× Iron Bar + 2× Wood | 8 |
| `kitchen` | `kitchen_kit` | 3× Wood + 1× Iron Ore | 0 |
| `loom` | `loom_kit` | 3× Wood + 2× Plank | 8 |
| `fishing_dock` | `fishing_dock_kit` | 3× Wood + 1× Plank | 8 |
| `animal_pen` | `animal_pen_kit` | 4× Wood + 2× Plank | 8 |
| `alchemy_bench` | `alchemy_bench_kit` | 3× Wood + 1× Iron Ore | 8 |

Former coin + on-place energy costs removed. Catalog SKU cap raised to include kits.

**Decor kits (2026-08-15):** `planter_kit` (2× wood) / `banner_kit` (1× wood + 1× plank) craft at workshop; place/pickup like stations. Legacy decor-pad coin place (`planter` 12c / `banner` 18c) remains for seeded pads.

### Legacy pre-placed buildings (reference / tests only)

| Slot | Building | Role |
| --- | --- | --- |
| 0–3 | `crop_plot` ×4 | Plant / grow / harvest wheat |
| 4 | `mill` | Process wheat → flour |
| 5 | `forge` | Smelt ore + craft tools |
| 6–7 | empty until purchased | Expand with coins + materials (P0.3) |
| 8 | `vendor_stall` | Tutorial vendor (walk up · E) |
| 9 | `ore_node` | Chip iron ore with Iron Hammer (90s cooldown) |
| 10 | `kitchen` | Bake bread / cook meat (Cook XP) |
| ~~11~~ | ~~`game_trail`~~ | **Removed (CL4.2)** — hunt lives on Exploration only |
| 13 | `tree_stump` | Chop wood |
| 14 | `workshop` | Carpenter planks |
| 15 | `portal` | Travel |
| 16–17 | `decor_pad` | Housing cosmetics |
| 18 | `claim_node` | Guild claim beacon |

### Exploration map (CL4.1 / CL10.1)

Multi-section wilds template (`EXPLORE_BUILDINGS` / legacy `FOREST_*`). Not on player land.
Wayfinding: `EXPLORE_SECTIONS` + in-world labels / explore-only prompt prefixes (no minimap).

| Section | Buildings | Role |
| --- | --- | --- |
| Entry | `portal`, `vendor_stall` | Travel + regional vendor prices |
| Woodland (west) | `tree_stump` ×4 | Chop wood |
| Mines (east) | `ore_node` ×4 | Chip ore with Iron Hammer |
| Hunt (north) | `game_trail` ×2, `edge_thicket` ×2 | Animal / Monster Hunter loop (CL4.2) |

Hunt actions refuse city / player_land / warrior (`huntExploreOnly`).

### City hub (CL2 / CL8 / CL13–CL15)

Shared hub template (`CITY_BUILDINGS`). Scarce stations + tutors + market; not a private yard.

| Slot | Building | Role |
| --- | --- | --- |
| 0 | `portal` | Free travel |
| 1–10 | Scarce plots / trees / ore / workshop / forge / mill / kitchen | Practice without owning land |
| 11–13, 16–18 | `tutorial_npc` ×6 | Farmer…Cook walk-up tutors |
| 14 | `vendor_stall` | City buy book |
| 15 | `market_board` | Player list/buy |
| 19 | `notice_board` | Walk-up static tips (travel / scarce stations / warrior optional / land→city / fisher dock + alchemist bench / fish→kitchen / hunt meat→kitchen / animal breeder pen feed) — **no live-ops** (CL8.3 / CL9.2 / CL14.2 / CL16.2 / CL19.3 / CL20 / CL25.3 / CL27 / CL28 / CL33.3) |
| 20 | `tutorial_npc` | Weaver walk-up tutor (CL13.1) |
| 21 | `loom` | Scarce shared Weaver practice station (CL13.2) — exactly one; city place blocked |
| 22 | `tutorial_npc` | Fisher walk-up tutor (CL14.1 / CL19.3) — catch fish at fishing dock |
| 23 | `tutorial_npc` | Alchemist walk-up tutor (CL14.1 / CL28.3) — Alchemy Bench practice; hold herbal tonic |
| 24 | `tutorial_npc` | Animal Hunter walk-up tutor (CL15.1) — Explore `game_trail` → leather |
| 25 | `tutorial_npc` | Monster Hunter walk-up tutor (CL15.1) — Explore `edge_thicket` → boar tusk |
| 26 | `tutorial_npc` | Builder walk-up tutor (CL15.2) — place station on Your Land via build board |
| 27 | `fishing_dock` | Scarce shared Fisher practice station (CL19.2) — exactly one; city place blocked |
| 28 | `tutorial_npc` | Animal Breeder walk-up tutor (CL27.3) — feed wheat at land pens |
| 29 | `alchemy_bench` | Scarce shared Alchemist practice station (CL28.2–CL28.3) — exactly one; city place blocked |

**Soft station contention (CL52.3 / CL57 / CL60 / CL63 / CL65.2):** On city **gather or plant** (tree stump / ore rock / fishing_dock + crop_plot), if another player’s fresh presence is already within interact range of that scarce station, the action refuses with wait copy (`stationBusy`). No daily/qty caps. **Craft override (2026-08-15):** City process crafts use start→wait→collect jobs and allow simultaneous crafters at the same mill/forge/kitchen/workshop/loom/alchemy_bench (peer presence does not block craft). Player-land and Explore craft are exclusive per building while a job is in progress or ready uncollected (`stationBusy`); peer presence alone still does not block land craft.

### Warrior arena stub (CL5.1)

Optional parallel combat-path map (`WARRIOR_BUILDINGS`). Not on the profession ladder; no homestead training.

| Section | Buildings | Role |
| --- | --- | --- |
| Entry | `portal` | Free travel in/out |
| Ring | `arena_board` ×3 | Walk-up stub plaque — no combat balance |

New players are not forced here; travel is optional. No production / hunt / place-station on this map.

### Slot expansion (P0.3)

| Slot | Building | Coins | Materials | Energy |
| --- | --- | --- | --- | --- |
| 6 | `crop_plot` at (1, −2) | 25 | 1× Iron Bar | 15 |
| 7 | `crop_plot` at (1, 1) | 40 | 2× Iron Bar | 15 |

Must expand **in order** (6 before 7). Buildings.md: construction consumes energy and materials.

---

# Professions (MVP)

| ID | XP from |
| --- | --- |
| `farmer` | plant, harvest, mill, hunt |
| `blacksmith` | smelt, forge crafts, gather ore |
| `cook` | bake bread, cook meat |
| `weaver` | weave cloth at loom (CL13.3) |

Character XP: +same action XP into `character_xp` (separate pool).

No class lock. Both professions available to every account.

---

# Specialization Pressure (P0.2)

Goal: one account can do everything, but **specialists are more efficient**, so trading tools ↔ crops is rational.

### Recipe XP gates

| Recipe | Minimum XP |
| --- | --- |
| `mill_flour` | Farmer 0 |
| `smelt_iron_bar` | Blacksmith 0 |
| `forge_iron_hoe` | Blacksmith **20** |
| `forge_iron_hammer` | Blacksmith **20** |
| `forge_iron_hoe_fine` | Blacksmith **50** |

### Energy focus

When spending energy on profession **P** (other = the opposite profession):

| Condition | Energy cost |
| --- | --- |
| `xp(P) + 15 < xp(other)` (dabbling) | `ceil(base × 1.5)` |
| `xp(P) >= 25` and `xp(P) >= 2 × xp(other)` (specialist) | `max(1, base − 2)` |
| Otherwise | `base` |

### Harvest focus

If Farmer XP ≥ 25 and Farmer XP ≥ 2 × Blacksmith XP: harvest yields **+1 wheat**.

---

# Items

| ID | Name | Notes |
| --- | --- | --- |
| `wheat_seed` | Wheat Seed | Plant on crop_plot |
| `wheat` | Wheat | Harvest output |
| `flour` | Flour | Milled; vendor sink / future cook |
| `iron_ore` | Iron Ore | Starter grant; smelt input |
| `iron_bar` | Iron Bar | Doc term “Iron Bars” |
| `wooden_hoe` | Wooden Hoe | Starter tool; durability 25 |
| `iron_hoe` | Iron Hoe | T1 craft; durability 60 |
| `iron_hoe_fine` | Fine Iron Hoe | T2 craft; durability 100 |
| `iron_hammer` | Iron Hammer | Craft; durability 50 |
| `bread` | Bread | Energy +25 / HP +25; vendor sell 3c (CL47.3; below flour) |
| `leather` | Leather | Hunt drop; forge wrap / vendor / loom |
| `cloth` | Cloth | Loom weave (2× leather) — Weaver station sink (CL9.1) |
| `fish` | Fish | Fishing dock catch (CL19.1); vendor/market sink (CL23.2) |
| `cooked_fish` | Cooked Fish | Kitchen grill (`cook_fish`); Energy +40 / HP +40 (CL23.3); vendor sell 4c (CL51.1; above fish, under stew) |
| `herbal_tonic` | Herbal Tonic | Alchemy bench brew (`brew_herbal_tonic`); Energy +45 / HP +45; no damage/defense buffs (CL28.2); vendor sell 4c (CL33.1) |
| `cloth_bandage` | Cloth Bandage | Loom sew (`weave_cloth_bandage`); Energy +20 / HP +20; cloth sink (CL29.2); no damage/defense; vendor sell 2c (CL33.1) |
| `wood_crate` | Wood Crate | Workshop assemble (`assemble_wood_crate`); plank sink; housing-adjacent; no combat (CL36.1); vendor sell 3c + market list (CL39.1) |
| `raw_meat` | Raw Meat | Hunt drop; kitchen cook |
| `cooked_meat` | Cooked Meat | Energy +40 / HP +40 |

Soft currency is **not** an item.

---

# Crop

| Crop | Seed | Grow time | Harvest | Energy plant/harvest |
| --- | --- | --- | --- | --- |
| wheat | `wheat_seed` | **3 minutes** | 2× `wheat` | 5 / 5 |

Grow time is a real session beat (not a demo timer). While waiting, player mills, smelts, crafts, eats bread, or plans trades.

Hoe equipped: optional; if wooden/iron hoe equipped, planting costs −1 energy (min 1) and consumes 1 durability.

---

# Recipes

| ID | Station | Profession | Inputs | Output | Energy |
| --- | --- | --- | --- | --- | --- |
| `mill_flour` | mill | farmer | 2 wheat | 1 flour | 10 |
| `smelt_iron_bar` | forge | blacksmith | 2 iron_ore | 1 iron_bar | 10 |
| `forge_iron_hoe` | forge | blacksmith | 2 iron_bar | 1 iron_hoe | 10 |
| `forge_iron_hoe_fine` | forge | blacksmith | 3 iron_bar + 1 iron_hoe | 1 iron_hoe_fine | 10 |
| `forge_iron_hammer` | forge | blacksmith | 2 iron_bar | 1 iron_hammer | 10 |
| `bake_bread` | kitchen | cook | 2 flour | 1 bread | 10 |
| `cook_fish` | kitchen | cook | 1 fish | 1 cooked_fish | 10 |
| `brew_herbal_tonic` | alchemy_bench | alchemist | 2 wheat + 1 leather | 1 herbal_tonic | 10 |
| `weave_cloth` | loom | weaver | 2 leather | 1 cloth | 10 |
| `weave_cloth_bandage` | loom | weaver | 1 cloth | 1 cloth_bandage | 10 |
| `saw_planks` | workshop | carpenter | 2 wood | 1 plank | 10 |
| `craft_wooden_hoe` | workshop | carpenter | 2 wood + 1 plank | 1 wooden_hoe | 10 |
| `assemble_wood_crate` | workshop | carpenter | 2 plank | 1 wood_crate | 10 |
| `forge_iron_hammer` | forge | blacksmith | 2 iron_bar | 1 iron_hammer | 10 |

Weaver XP is `weaver_xp` (schema v23 / CL13.3). City has one scarce loom; player land places unlimited looms. Second loom recipe `weave_cloth_bandage` (CL29.2) sinks cloth into a light edible bandage (+20 energy / +20 HP); grants weaver XP; no damage/defense power.

Carpenter XP remains on workshop crafts. Second light recipe `assemble_wood_crate` (CL36.1) sinks 2× plank into a housing-adjacent `wood_crate` stackable (no combat); grants carpenter XP. Catalog SKU cap 24.

Forester XP is `forester_xp` (schema v24 / CL18.1). Tree stump chop grants forester XP (not carpenter); carpenter XP remains on workshop crafts (`saw_planks`, etc.). Empty player land places unlimited `tree_stump` via Build Board (CL32.1); city trees stay scarce template-only (place refuse).

Miner XP is `miner_xp` (schema v25 / CL18.2). Ore node chip grants miner XP (not blacksmith); blacksmith XP remains on forge crafts (`smelt_iron_bar`, `forge_iron_hammer`, `forge_iron_hoe`, etc.). Empty player land places unlimited `ore_node` via Build Board (CL32.2); hammer still required; city ore stays scarce template-only (place refuse). Notice tip `land_gather_practice` (CL32.3) + Build Board copy contrast unlimited land trees/ore vs scarce city.

Builder XP is `builder_xp` (schema v26 / CL18.3). Successful `placeLandStation` on player land grants builder XP (`BUILDER_PLACE_XP` = 8); city place stays blocked. Costly stations may require builder XP to place: `forge.minBuilderXp` = `BUILDER_PLACE_XP` (8) (CL26.1); `mill.minBuilderXp` = `BUILDER_PLACE_XP` (8) (CL28.1); `loom.minBuilderXp` = `BUILDER_PLACE_XP` (8) (CL34.1); `alchemy_bench.minBuilderXp` = `BUILDER_PLACE_XP` (8) (CL36.3); `fishing_dock.minBuilderXp` = `BUILDER_PLACE_XP` (8) (CL41.2); `animal_pen.minBuilderXp` = `BUILDER_PLACE_XP` (8) (CL46.1) — one prior land place unlocks forge, mill, loom, alchemy bench, fishing dock, and animal pen; `workshop`, `kitchen`, `crop_plot`, and other cheaper stations stay ungated for bootstrap.

Fisher catch loop (CL19.1–CL19.3 / CL23.1–CL23.3 / CL41.2 / CL51.1): `fish` item + `fishing_dock` on player land (unlimited; land place gated by `minBuilderXp` = 8) and exactly one scarce city dock; `CITY_PRACTICE_STATIONS.fisher = ["fishing_dock"]`. Catch uses gather energy (8) + 60s cooldown; no rod; grants `fisher_xp` (schema v27, +5). Fisher tutor objective is `hold_fish`. Vendor sell book includes `fish` @ 2 coins and `cooked_fish` @ 4 coins (city/explore/land); market lists stackable fish / cooked_fish. Kitchen recipe `cook_fish` (1× fish → 1× `cooked_fish`, +40 energy edible) grants cook XP — not alchemy.

Alchemist bench (CL28.2–CL28.3 / CL31.3 / CL36.3 / CL38.1): placeable `alchemy_bench` on player land (unlimited) + scarce city ×1 (slot 29); land place gated by `minBuilderXp` = `BUILDER_PLACE_XP` (8). Recipe `brew_herbal_tonic` (2× wheat + 1× leather → 1× `herbal_tonic`, +45 energy edible) at the bench — grants `alchemist_xp` (schema v30 / ProfessionId `alchemist`); distinct from kitchen `cook_stew` / `cook_fish` (cook profession stays on stew/fish). Eating `herbal_tonic` restores +45 energy and +45 HP (no damage/defense buff, no XP). No combat buffs. Practice map: `CITY_PRACTICE_STATIONS.alchemist = ["alchemy_bench"]`; tutor objective `hold_herbal_tonic`. Tutor + notice tip (`fisher_alchemist_practice`) point at the bench; cook stew remains Cook-only.

Animal / Monster Hunter tutors are seeded (CL15.1); objectives require Explore trail/thicket loot (`leather` / `boar_tusk`). Homestead hunts refuse (`huntExploreOnly`). Trail wins grant `animal_hunter_xp` and thicket wins grant `monster_hunter_xp` (schema v29 / CL31.1) — not Cook and not a shared `hunter` grant; legacy `hunter_xp` migrates into Animal Hunter. Notice tip `explore_mats_craft` (id stable) and tutor basics name Animal vs Monster Hunter XP (CL31.2); cook meat at Kitchen for Cook XP. Builder tutor (CL15.2) completes after `placeLandStation` on owned player land. Empty land tip (CL16.1): Build Board + dismissible onboarding — empty homestead is intentional. Animal Pen is placeable on player land (CL26.2; land place gated by `minBuilderXp` = 8 / CL46.1) + scarce city ×1 (slot 30 / PL170.2); walk-up wheat feed (CL27.1) spends 1× wheat, gather energy (8), 45s cooldown, grants `animal_breeder_xp` (schema v28, +5). CL34.2 adds a light second care beat: refresh bedding with 1× wood (same energy/CD/XP); gather auto-prefers wheat then wood; no livestock combat. Soft presence contention on the scarce city pen matches dock/alchemy (PL170.2). Animal Breeder tutor seeded (CL27.3) with objective `feed_animal_pen`; tutor basics name wheat feed + wood bedding (CL37.3); `CITY_PRACTICE_STATIONS.animal_breeder = ["animal_pen"]` (PL170.2); notice tip `animal_breeder_path`.

Crafting without the required station on the land **fails**.

---

# Ore Node (P5)

| Field | Value |
| --- | --- |
| Building | `ore_node` (player land unlimited via Build Board; city scarce template; Explore mines) |
| Tool | Equipped `iron_hammer` required |
| Yield | 1× `iron_ore` |
| Cooldown | 90 seconds (`readyAt`) |
| Energy | 8 (miner; no farm/smith focus tax) |
| XP | +5 miner |
| Durability | −1 hammer per chip |

---

# Fishing Dock (CL19)

| Field | Value |
| --- | --- |
| Building | `fishing_dock` (player land unlimited; city scarce ×1) |
| Tool | none (rod deferred) |
| Yield | 1× `fish` |
| Cooldown | 60 seconds (`readyAt`) |
| Energy | 8 gather |
| XP | +5 fisher (`fisher_xp` schema v27) |

---

# Animal Pen care (CL27 / CL34.2)

| Field | Value |
| --- | --- |
| Building | `animal_pen` (player land unlimited; city scarce ×1) |
| Feed | 1× `wheat` |
| Clean / bedding | 1× `wood` (CL34.2 second beat) |
| Cooldown | 45 seconds (`readyAt`, shared across feed + clean) |
| Energy | 8 gather |
| XP | +5 animal_breeder (`animal_breeder_xp` schema v28) per care |
| Combat | none — no livestock fight / loot |

---

# Starting State (Early Game)

Aligned with [EarlyGameExperience.md](../02_game_design/EarlyGameExperience.md), adapted to Farmer + Blacksmith:

| Grant | Qty |
| --- | --- |
| Coins | 40 |
| Energy | 100 / 100 |
| `wheat_seed` | 6 |
| `iron_ore` | 4 |
| `bread` | 3 |
| `wooden_hoe` | 1 (equipped) |

First loop taught by action: plant → wait/work → harvest → mill or smelt → craft better hoe.

---

# Tutorial Vendor (NPC sink only)

| Action | Rate |
| --- | --- |
| Sell wheat | 2 coins each |
| Sell flour | 5 coins each |
| Sell iron_ore | 1 coin each (City / Your Land); Explore premium **2** (CL44.1) |
| Sell fish | 2 coins each (CL23.2; city / explore / land same rate) |
| Sell herbal_tonic | 4 coins each (CL33.1; city / explore / land same rate) |
| Sell cloth_bandage | 2 coins each (CL33.1; city / explore / land same rate) |
| Sell wood_crate | 3 coins each (CL39.1; city / explore / land same rate; below 2× plank) |
| Sell bread | 3 coins each (CL47.3; city / explore / land same rate; below flour 5) |
| Sell cooked_fish | 4 coins each (CL51.1; city / explore / land same rate; above fish 2, under stew 5) |
| Buy wheat_seed | 8 coins each |

NPC never buys finished tools. NPC is not the main market. Stackable `fish`, `cooked_fish`, `herbal_tonic`, `cloth_bandage`, `wood_crate`, `bread`, and `stew` may also list on the player market board.

### City hub vendor (CL2.3)

Same sell book as homestead. Buy book adds basic tools + seeds on the shared city map:

| Action | Rate |
| --- | --- |
| Buy wheat_seed | 8 coins each |
| Buy wooden_hoe | 12 coins each |
| Buy iron_hammer | 28 coins each |

Player list/buy of produced goods uses the city **market board** (walk-up) / existing market actions — not this NPC.

---

# Client Presentation

This is an **MMO-style client**, not a management dashboard.

| Rule | Detail |
| --- | --- |
| Avatar | Player controls a visible character on the Starter Land |
| Movement | WASD (or arrows) to walk the land |
| Interaction | Walk up to Fields / Mill / Forge / Kitchen / Ore Rock / Vendor / Tutorial NPCs / Market Board / Notice Board / Build Board / Arena plaque · press **E**; hunt trails only on **Exploration** (CL4.2) |
| HUD | Absolute minimum while walking (CL6.1): identity, energy, coins, compact HP — **not** profession XP dump or full keybind strip. Panels open on walk-up / hotkey only; full binds in Settings (**H**) |
| Inventory | Toggle **I** |
| Trade | Toggle **T** (separate surface) |
| Visit | Toggle **V** |
| Market | Toggle **M** (also walk-up at city market board) |
| Craft | Opens **only** while interacting with Mill, Forge, Kitchen, Workshop, Loom, or Alchemy Bench |
| Vendor | Opens **only** at Vendor Stall |
| Tutorial NPC | Opens **only** at city tutors (CL2.2–CL27: Farmer…Builder + Animal Breeder; hunters included) — not a permanent HUD column |
| Arena plaque | Opens **only** on warrior `arena_board` (CL5.1) — stub info, no combat |
| City notice board | Opens **only** on city `notice_board` (CL8.3) — static tips; closed by default |
| Build Board | Opens **only** at player-land build board (CL3.1 / CL3.2) — place stations |
| Field | **E** plants or harvests when in range — no global plant button |
| Ore | **E** chips ore when hammer equipped and rock ready |

Primitives are assembled into **readable low-poly kits** (fields with wheat, mill tower, forge shed, vendor awning, fenced homestead). GLTF art later — the **place and interaction model are final**.

---

# Explicit Non-Goals (do not fake in code)

- 10-second crops “for testing”  
- Decorative cubes that are not buildings  
- Wallet / NFT land  
- Guild **wars**, NFT land, GLTF art, WebSockets marketplace, bosses/dungeons  
- Dual tracking of coins as inventory stacks  
- **Dashboard UI** that crafts/buys/trades without a character walking to stations  

---

# Final Statement

Implement the living economy loop as designed. Prototype shortcuts that contradict this lock are bugs.
