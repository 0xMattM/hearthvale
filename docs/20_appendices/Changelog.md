# Changelog

**Document Version:** 1.2.0  
**Status:** Active  
**Owner:** Documentation Team  
**Last Updated:** August 2, 2026

## 2026-08-02 — Polish PL170.2 city scarce animal pen + landmark

Scarce city `animal_pen` (slot 30) seeded to match Vision profession stations; soft presence contention on feed/clean; quiet warm hay landmark (`CITY_ANIMAL_PEN_LANDMARK_CUE`) on City only. Practice map / tips / Content Lock updated; land place still unlimited; yields/CD SoT. Plan rollover → [FullGameBuildPlan_CityLands_Polish_35.md](../19_development_plan/FullGameBuildPlan_CityLands_Polish_35.md). Tests: `city-animal-pen-landmark-cue-pl1702`, `city-scarce-animal-pen-contention-pl1702`. Next: PL171.1 City crop-plot soft landmark.

## 2026-08-02 — Polish PL29.1–PL29.3 social / quest accents + claim cue

Trade / Quest panels flash brief seafoam open accents (`SOCIAL_PANEL_OPEN_ACCENT_MS`; T / Q; escrow + rewards unchanged). Quest claim: soft `quest_claim` SFX + ephemeral TopBar `Quest claimed` (distinct from tutor `Claimed`; sticky XP prose removed). Tests: `trade-panel-open-accent-pl291`, `quest-panel-open-accent-pl292`, `quest-claim-success-cue-pl293`. Next: PL30.1 Fishing dock ready world label.

## 2026-08-02 — Polish PL28.1–PL28.3 sticky → ephemeral confirms

Trade offer sent: soft `trade_offer` SFX + ephemeral TopBar `Offer · to` (`tradeOfferSentCueText` / `flashSuccessCue`); sticky escrow prose removed. Mail send/cancel: ephemeral `Parcel sent` / `Parcel cancelled` (escrow unchanged). Subsequent station place: soft `build` + ephemeral `Built` (first place stays Homestead PL25.2). Tests: `trade-offer-sent-cue-pl281`, `mail-send-cancel-brief-cues-pl282`, `station-built-cue-pl283`. Next: PL29.1 Trade panel open accent.

## 2026-08-02 — Polish PL26.1–PL26.2 expand pad afford + refuse clarity

Homestead expand pad tints quiet affordable (soft green + emissive) vs short (muted) via `EXPAND_PAD_AFFORD_CUE` / `expandPadAffordMode` / `expandPadMeshColors`. Walk-up prompt names first shortfall (`Expand field · Need …`) via `expandSlotShortfall` + `expandRefuseClarityText` when short; affordable keeps full cost line. SLOT_EXPANSIONS costs unchanged; no HUD column; PL16.1 soft refuse stays narrow. Tests: `expand-pad-afford-tint-pl261`, `expand-refuse-clarity-pl262`. Next: PL27.1 Visit leave brief cue.

## 2026-08-02 — Polish PL25.1–PL25.2 repair + first homestead cue

Inventory Repair restores worn tools to max durability via `TOOL.repairMats` (1× wood / 1× iron_bar); soft `repair` SFX + ephemeral TopBar `Repaired`. First placeable station place flashes ephemeral `Homestead` (`isFirstHomesteadStationPlace`); later places keep quiet build feedback. Tests: `repair-tool-success-cue-pl251`, `repair-tool-pl251`, `first-station-homestead-cue-pl252`. Next: PL26.1 Expand pad afford tint.

## 2026-08-02 — Polish PL23.1–PL24.3 station labels + panel accents

Process stations get name-first world Html + soft `Craft` (`processStationWorldLabelParts`); gather Tree/Ore Rock show name + soft `Ready` when ready (depleted stay timer/pad). Build / Craft / Travel panels flash brief open accents (`WORKSPACE_PANEL_OPEN_ACCENT_MS`); costs, recipes, and fare-free travel unchanged. Tests: `process-station-world-label-pl231`, `gather-ready-world-label-pl232`, `build-panel-open-accent-pl241`, `craft-panel-open-accent-pl242`, `travel-panel-open-accent-pl243`. Next: PL25.1 Repair tool success cue.

## 2026-08-02 — Polish PL7.1–PL7.2 per-map BGM beds

Soft BGM tints per CityLands map via `BGM_BEDS` + `setBgmLandKind` in `game-audio` (city / player_land / explore / warrior); mute silences. Explore bed sparser/tenser than homestead Land (saw + quiet partial; AudioDirection wilds; no combat suite). GameApp follows active land kind. Tests: `bgm-map-tint-pl71`, `bgm-explore-tint-pl72`. Next: PL8.1 Busy station world cue.

## 2026-08-02 — CityLands CL96.1–CL98.3 + CityLands_24 rollover

CL96–CL98 assert-only fidelity via **reuse** of CL88–CL90 suites (re-run green; no duplicate identical test files): Fisher/Alchemist claims + flour sink (`*-cl881`/`882`/`883`); Explore wood premium + mail/market cancel (`*-cl891`/`892`/`893`); notice/warrior + smoke (`*-cl901`/`902`/`903`). Also re-confirmed CL95 scarce suites (`*-cl871`/`872`/`873`) in the same smoke batch. Plan rollover → [FullGameBuildPlan_CityLands_24.md](../19_development_plan/FullGameBuildPlan_CityLands_24.md) (CL99–CL102). Next: CL99.1 Explore wood → land saw_planks still green.

## 2026-08-02 — CityLands CL95.1–CL95.3 scarce vs land (reuse)

City scarce kitchen/workshop (`city-scarce-craft-contention-cl871`); city scarce tree/ore (`city-scarce-gather-contention-cl872`); land unlimited craft (`land-unlimited-craft-cl873`). Reuse of CL87 suites (re-run green; no clone files). Next: CL96.1 Fisher tutor claim after land dock catch still green.

## 2026-08-02 — CityLands CL91.1–CL94.3 + CityLands_23 rollover

CL91–CL94 assert-only fidelity via **reuse** of CL83–CL86 suites (re-run green; no duplicate identical test files): Explore saw/smelt/weave (`*-cl831`/`832`/`833`); crate/fish sinks + eat (`*-cl841`/`842`/`843`); visit/trade/market (`*-cl851`/`852`/`853`); min HUD + free travel + smoke (`*-cl861`/`862`/`863`). Plan rollover → [FullGameBuildPlan_CityLands_23.md](../19_development_plan/FullGameBuildPlan_CityLands_23.md) (CL95–CL98). Next: CL95.1 City scarce kitchen/workshop craft contention still green.

## 2026-08-02 — CityLands CL89.1–CL90.3 + CityLands_22 rollover

Explore wood premium (`explore-premium-wood-sell-cl891`); mail cancel escrow (`mail-cancel-escrow-cl892`); market cancel escrow (`market-cancel-escrow-cl893`); notice tip / scarce_stations (`notice-board-tips-cl901`); warrior arena optional (`warrior-arena-board-cl902`); regression `citylands-smoke-cl903`. Assert-only (no Content Lock retune). Plan rollover → [FullGameBuildPlan_CityLands_22.md](../19_development_plan/FullGameBuildPlan_CityLands_22.md) (CL91–CL94). Next: CL91.1 Explore wood → land saw_planks still green.

## 2026-08-02 — CityLands CL88.1–CL88.3 Fisher/Alchemist claims + flour sink

Fisher claim after land dock catch (`fisher-tutor-claim-cl881`); Alchemist claim after land brew (`alchemist-tutor-claim-cl882`); land flour City vendor @5 (`land-flour-vendor-sink-cl883`). Assert-only (no Content Lock retune). Next: CL89.1 Explore premium wood sell still green.

## 2026-08-02 — CityLands CL87.1–CL87.3 city scarce vs land unlimited

City scarce kitchen/workshop craft `stationBusy` (`city-scarce-craft-contention-cl871`); city scarce tree/ore gather (`city-scarce-gather-contention-cl872`); land unlimited craft with peer (`land-unlimited-craft-cl873`). Assert-only (no Content Lock retune). Next: CL88.1 Fisher tutor claim after land dock catch still green.

## 2026-08-02 — CityLands CL85.1–CL86.3 + CityLands_21 rollover

Visit+trade (`visit-presence-trade-cl851`); trade invite accept/cancel (`trade-invite-accept-cancel-cl852`); market buy+TTL escrow (`market-buy-ttl-escrow-cl853`); min HUD (`min-hud-interact-cl861`); four-map travel+portal (`four-map-travel-cl862`); regression `citylands-smoke-cl863`. Assert-only (no Content Lock retune). Plan rollover → [FullGameBuildPlan_CityLands_21.md](../19_development_plan/FullGameBuildPlan_CityLands_21.md) (CL87–CL90). Next: CL87.1 City scarce kitchen/workshop craft contention still green.

## 2026-08-02 — CityLands CL83.1–CL84.3 Explore craft + land sinks/eat

Explore wood→land saw (`explore-wood-saw-planks-cl831`); Explore ore→land smelt (`explore-ore-smelt-cl832`); Explore leather→land weave (`explore-leather-weave-cl833`); land crate City vendor @3 (`land-crate-vendor-sink-cl841`); land cooked_fish City vendor @4 (`land-cooked-fish-vendor-sink-cl842`); bread/stew/ration eat +25/+55/+75 (`bread-stew-ration-eat-cl843`). Assert-only (no Content Lock retune). Next: CL85.1 Visit presence + nearby trade still green.

## 2026-08-02 — CityLands CL81.1–CL82.3 + CityLands_20 rollover

Explore premium leather/ore sell (`explore-premium-leather-ore-sell-cl811`); mail parcel claim (`mail-parcel-claim-cl812`); market cancel escrow (`market-cancel-escrow-cl813`); notice tip / scarce_stations (`notice-board-tips-cl821`); warrior arena optional (`warrior-arena-board-cl822`); regression `citylands-smoke-cl823`. Assert-only (no Content Lock retune). Plan rollover → [FullGameBuildPlan_CityLands_20.md](../19_development_plan/FullGameBuildPlan_CityLands_20.md) (CL83–CL86). Next: CL83.1 Explore wood → land saw_planks still green.

## 2026-08-02 — CityLands CL79.2–CL80.3 scarce gather + land craft + tutor/bread

City scarce tree/ore gather `stationBusy` (`city-scarce-gather-contention-cl792`); land unlimited craft with peer (`land-unlimited-craft-cl793`); Farmer claim after plant/harvest (`farmer-tutor-claim-cl801`); Weaver claim after loom weave (`weaver-tutor-claim-cl802`); land mill→bake→City bread sell @3 (`land-mill-bake-bread-sell-cl803`). Assert-only (no Content Lock retune). Next: CL81.1 Explore premium leather/ore sell still green.

## 2026-08-02 — CityLands CL77.2–CL78.3 + CityLands_19 rollover + CL79.1

Recipe XP gates (`recipe-xp-gate-fidelity-cl772`); homestead hunt refuse (`homestead-hunt-refuse-cl773`); min HUD prompts (`min-hud-interact-cl781`); four-map free travel (`four-map-travel-cl782`); regression `citylands-smoke-cl783`. Plan rollover → [FullGameBuildPlan_CityLands_19.md](../19_development_plan/FullGameBuildPlan_CityLands_19.md) (CL79–CL82). CL79.1 city kitchen/workshop `stationBusy` (`city-scarce-craft-contention-cl791`); land unlimited. Assert-only (no Content Lock retune). Next: CL79.2 City scarce tree/ore gather contention still green.

## 2026-08-02 — CityLands CL76.2–CL77.1 trade/market + Explore wood premium

Trade invite accept/cancel (`trade-invite-accept-cancel-cl762`) + far/own refuse; market cross-buy (`market-buy-listing-cl763`) + own-list refuse; Explore wood premium > City (`explore-premium-wood-sell-cl771`) + empty refuse. Assert-only (no Content Lock retune). Next: CL77.2 Recipe XP gate fidelity still green.

## 2026-08-02 — CityLands CL75.2–CL76.1 bandage/plank sinks + mail cancel

Land cloth_bandage → City vendor @2 (`land-bandage-vendor-sink-cl752`); land plank → City vendor @4 + market list (`land-plank-vendor-sink-cl753`); mail cancel restores escrow (`mail-cancel-escrow-cl761`) + cancel-not-yours. Assert-only (no Content Lock retune). Next: CL76.2 Trade invite accept + cancel still green.

## 2026-08-02 — CityLands CL75.1 land flour vendor + CL73.1–CL74.3 + CityLands_18 rollover

Land flour → City vendor @5 (`land-flour-vendor-sink-cl751`); empty refuse. Prior tick: Animal Hunter claim (`trail-animal-hunter-claim-cl731`); visit+trade (`visit-presence-trade-cl732`); mail send refuses (`mail-send-refuse-cl733`); portal prompts (`portal-prompts-cl741`); City vendor buy (`city-vendor-buy-seed-tool-cl742`); regression `citylands-smoke-cl743`. Assert-only (no Content Lock retune). Plan rollover → [FullGameBuildPlan_CityLands_18.md](../19_development_plan/FullGameBuildPlan_CityLands_18.md) (CL75–CL78). Next: CL75.2 Land cloth_bandage City vendor sink still green.

## 2026-08-02 — CityLands CL72.1–CL72.3 food + housing + crate sinks

Bread / Hearty Stew eat energy (`bread-stew-eat-cl721`); housing banner coin sink + broke refuse (`housing-banner-coin-sink-cl722`); land wood_crate → City vendor @3 (`land-crate-vendor-sink-cl723`). Assert-only (no Content Lock retune). Next: CL73.1 Animal Hunter claim after trail still green.

## 2026-08-02 — CityLands CL69.2–CL70.3 + CityLands_17 rollover

Four-map free travel circuit (`four-map-travel-cl692`); market cancel escrow (`market-cancel-escrow-cl693`); notice tip fidelity (`notice-board-tips-cl701`); warrior arena optional (`warrior-arena-board-cl702`); regression `citylands-smoke-cl703`. Assert-only (no Content Lock retune). Plan rollover → [FullGameBuildPlan_CityLands_17.md](../19_development_plan/FullGameBuildPlan_CityLands_17.md) (CL71–CL74). Next: CL71.1 Explore wood → land saw_planks still green.

## 2026-08-02 — CityLands CL68.2–CL69.1 Explore craft + mail verify

Explore trail leather → land loom `weave_cloth` (`explore-leather-weave-cl682`); Explore premium leather sell > City (`explore-premium-leather-sell-cl683`); mail offline parcel claim (`mail-parcel-claim-cl691`). Assert-only (no Content Lock retune). Next: CL69.2 Four-map free travel circuit still green.

## 2026-08-02 — CityLands CL67.1–CL68.1 economy sinks + Breeder verify

Land `pack_travel_ration` → eat energy + cook XP gate refuse (`travel-ration-eat-cl671`); herbal_tonic / cooked_fish eat restores (`tonic-cooked-fish-eat-cl672`); housing planter coin sink + broke refuse (`housing-decor-coin-sink-cl673`); Breeder feed+clean → City claim (`breeder-tutor-claim-cl681`). Assert-only (no Content Lock retune). Next: CL68.2 Explore leather → land loom weave still green.

## 2026-08-02 — CityLands CL65.1–CL66.3 + CityLands_16 rollover

Market TTL escrow return (`market-ttl-escrow-cl651`); city crop_plot plant soft lock (`city-scarce-crop-plot-contention-cl652`); cooked_fish cross-buy (`cooked-fish-market-buy-cl653`). Visit+trade + min HUD verify; regression `citylands-smoke-cl663`. Content Lock soft-contention note adds crop_plot. Plan rollover → [FullGameBuildPlan_CityLands_16.md](../19_development_plan/FullGameBuildPlan_CityLands_16.md) (CL67–CL70). Next: CL67.1 Travel ration craft → energy eat.

## 2026-08-02 — CityLands CL64.1–CL64.3 Farmer / Fisher / Alchemist tutor claims

Land plant→harvest → Farmer claim; land dock catch → Fisher claim; land `brew_herbal_tonic` → Alchemist claim (`farmer-tutor-claim-cl641` / `fisher-tutor-claim-cl642` / `alchemist-tutor-claim-cl643`). Incomplete + double-claim refuse. Assert-only (objectives already Content Lock). Next: CL65.1 Market listing TTL expire → escrow return.

## 2026-08-02 — CityLands CL63.1–CL63.3 remaining city scarce contention

Soft presence `stationBusy` on city loom weave + alchemy brew (assert craft lock); fishing_dock catch now soft-locks like tree/ore (`city-scarce-loom-contention-cl631` / `city-scarce-fishing-dock-contention-cl632` / `city-scarce-alchemy-bench-contention-cl633`). Content Lock soft-contention note amended. Next: CL64.1 Farmer tutor claim after land plant/harvest.

## 2026-08-02 — CityLands CL61.1–CL62.3 + CityLands_15 rollover

Market buy from other listing + own-list refuse (`market-buy-listing-cl611`); City vendor seed/tool buy + broke refuse (`city-vendor-buy-seed-tool-cl612`); cooked_fish / ore NPC rates hold (`cooked-fish-ore-npc-rates-cl613`). Builder claim after land place (`builder-tutor-claim-cl621`); Weaver claim after land weave (`weaver-tutor-claim-cl622`). Regression `citylands-smoke-cl623`. Plan rollover → [FullGameBuildPlan_CityLands_15.md](../19_development_plan/FullGameBuildPlan_CityLands_15.md) (CL63–CL66). Next: CL63.1 City scarce loom contention.

## 2026-08-02 — CityLands CL59.1–CL60.3 tutor claims + scarce gather/workshop

Miner/Blacksmith/Cook tutor claims after Explore ore / land smelt / land `cook_meat` (`miner-tutor-claim-cl591` / `blacksmith-tutor-claim-cl592` / `cook-tutor-claim-cl593`). Soft presence contention extended to city tree chop + ore chip; workshop craft assert (`city-scarce-tree-contention-cl601` / `city-scarce-ore-contention-cl602` / `city-scarce-workshop-contention-cl603`). Content Lock soft-contention note amended. Next: CL61.1 Market buy from other player listing smoke.

## 2026-08-02 — CityLands CL56.1–CL58.3 + CityLands_14 rollover

Explore ore→land smelt (`explore-ore-smelt-cl561`); ore sell / bar hold (`land-smelt-vendor-ore-bar-cl562`); miner≠smelt XP (`miner-xp-chip-not-smelt-cl563`). Scarce city forge/mill contention; cooked_fish market list. Forester/Carpenter tutor claims after land chop/saw. Regression `citylands-smoke-cl583`. Plan rollover → [FullGameBuildPlan_CityLands_14.md](../19_development_plan/FullGameBuildPlan_CityLands_14.md) (CL59–CL62). Next: CL59.1 Explore ore → Miner tutor claim.

## 2026-08-02 — CityLands CL55.1–CL55.3 Animal Hunter + hunt isolation

Explore trail → Animal Hunter claim (`trail-animal-hunter-claim-cl551`); trail/thicket tutor isolation (`trail-thicket-tutor-isolation-cl552`); homestead `huntExploreOnly` still green (`homestead-hunt-refuse-cl553`).

## 2026-08-02 — CityLands CL53.1–CL54.3 + CityLands_13 rollover

Explore thicket → Monster Hunter claim (`thicket-monster-hunter-claim-cl531`); incomplete refuse. Land tree→saw→crate→City sell (`land-tree-saw-crate-sell-cl532`). Recipe XP gates for `pack_travel_ration` / `forge_iron_hammer` (`recipe-xp-gate-fidelity-cl533`). Portal Free travel prompts on all four maps (`portal-prompts-four-maps-cl541`); warrior Exit · N. Arena board optional fidelity (`warrior-arena-board-cl542`). Regression companion `citylands-smoke-cl543`. Plan rollover → [FullGameBuildPlan_CityLands_13.md](../19_development_plan/FullGameBuildPlan_CityLands_13.md) (CL55–CL58).

## 2026-08-01 — CityLands CL51.1–CL51.3 land→City food/mat sinks

`VENDOR.sell.cooked_fish` = 4 (above fish 2, under stew 5); land catch→`cook_fish`→City `vendorSell` e2e (`land-cook-fish-vendor-sell-cl511`); empty-bag refuse. Land `cook_stew` → City market list (`land-stew-market-list-cl512`); empty-stew refuse. Land plant→harvest wheat → City `vendorSell` @2 (`land-wheat-vendor-sell-cl513`); `cropNotReady` holds. Content Lock amended. Next: CL52.1 Trade invite accept + cancel smoke.

## 2026-08-01 — CityLands CL49.3–CL50.3 + CityLands_12 rollover

Breeder tutor claim after feed+clean (`breeder-tutor-claim-cl493`); incomplete refuse. Interact prompt fidelity: `oreNodeReady` includes fishing_dock / animal_pen so care/catch prompts are not stuck on settling (`interact-prompt-stations-cl501`). Four-map free travel reverse circuit still fare-free (`four-map-travel-cl502`). Regression companion `citylands-smoke-cl503`: land fish cook, alchemy/bread/crate sinks, leather weave, visit/decor/breeder claim. Plan rollover → [FullGameBuildPlan_CityLands_12.md](../19_development_plan/FullGameBuildPlan_CityLands_12.md) (CL51–CL54).

---

# Purpose

The Changelog records significant changes made to the project's documentation, design, architecture, and planning.

Its objectives are to:

- Preserve project history.
- Improve traceability.
- Simplify collaboration.
- Document important decisions.
- Support future maintenance.

Minor wording corrections and formatting updates should generally not be included unless they affect meaning.

---

# Versioning

The documentation follows **Semantic Versioning**.

```
Major.Minor.Patch
```

Meaning:

```
Major

Breaking structural changes


Minor

New documentation
New systems
Major improvements


Patch

Corrections
Clarifications
Small updates
```

---

# Current Version

```
Project Bible

Version 1.2.0
```

Codebase

```
MVP scaffold running (server + R3F client)
```

Status

```
Active
```

---

# Version History

---

## 2026-08-01 — CityLands CL48.2–CL49.2 leather weave + ration + visit + banner

Assert-only Explore trail leather → land loom `weave_cloth` + weaver XP; homestead hunt refuse. Land mill→bake→`pack_travel_ration` + eat. Visit empty player land + nearby trade ping. L5 pad → housing `banner` coin sink; city refuse. No Content Lock number changes. Next: CL49.3 Breeder tutor claim after pen care.

## 2026-08-01 — CityLands CL47.2–CL48.1 land alchemy + bread + saw→crate

Assert-only land alchemy `brew_herbal_tonic` → City vendor sell @4 (+ market list edge). `VENDOR.sell.bread` = 3 (below flour/stew); land bake → City `vendorSell` e2e; empty-bag refuse. Land workshop `saw_planks` → `assemble_wood_crate` (carpenter XP). Content Lock amended (bread). Next: CL48.2 Explore leather → land loom weave e2e.

## 2026-08-01 — CityLands CL46.2–CL46.3 + plan rollover → CityLands_11 (+ CL47.1)

Min HUD fidelity: notice/craft/all panels closed-by-default; craft walk-up-only (no craft hotkey); short walking hint. Regression `citylands-smoke-cl8` covers land bake/forge/loom, Explore ore premium, dock catch, pen gate. Plan rollover → [FullGameBuildPlan_CityLands_11.md](../19_development_plan/FullGameBuildPlan_CityLands_11.md) (CL47–CL50). CL47.1: land dock catch → kitchen `cook_fish` (cook XP, not fisher).

## 2026-08-01 — CityLands CL45.1–CL46.1 Breeder/market/ration + pen gate

Land pen feed→clean (+ reverse) e2e grants `animal_breeder_xp` both beats (no livestock combat). Market: land `wood_crate` → cross-player buy; cancel-not-yours holds. Tip `travel_circuit` (id stable) + panel intro: Travel Ration is kitchen energy food; free travel stays fare-free. `animal_pen.minBuilderXp` = 8 (sixth costly); crop/workshop/kitchen bootstrap. Next: CL46.2 Min HUD walk-up panel fidelity.

## 2026-08-01 — CityLands CL44.1–CL44.3 Explore ore premium + land dock + hunt cook

Explore `iron_ore` regional sell **2** (City/Land stay 1); chip Explore `ore_node` → `vendorSell` e2e; tip/README/`EXPLORE_VENDOR_PREMIUM_SELL_ITEMS` updated. Land fishing dock place (builder gate) → `gatherFish` + fisher XP. Explore trail meat → land kitchen `cook_meat` + cook XP; homestead hunt still refuse. Next: CL45.1 Breeder feed + clean XP e2e.

## 2026-08-01 — CityLands CL43.1–CL43.3 land craft e2e smokes

Assert-only player-land loops: mill flour → kitchen bread (farmer/cook XP), forge smelt → iron hammer (blacksmith not miner), loom bandage → City vendor sell (+ market list edge). No Content Lock rate changes. Next: CL44.1 Explore ore chip → premium sell e2e.

---

## 2026-08-01 — CityLands CL42.3 + plan rollover → CityLands_10

Regression `citylands-smoke-cl8` extended for CL39–CL42: crate vendor sink, land mill flour, Explore stump→premium wood sell, fishing_dock builder gate refuse, housing decor place + city refuse. Plan rollover → [FullGameBuildPlan_CityLands_10.md](../19_development_plan/FullGameBuildPlan_CityLands_10.md) (CL43–CL46: land craft e2e, Explore ore premium, land dock catch, Breeder/market polish, sixth builder gate).

---

## 2026-08-01 — CityLands CL41.2–CL42.2 dock gate + decor + warrior tip + four-map travel

`fishing_dock.minBuilderXp` = 8 (fifth costly station); crop/workshop/kitchen bootstrap. Housing decor smoke via L5 `decor_pad` → planter (coin only; city refuse). Warrior tip/plaque fidelity: optional, no balance numbers, no homestead training. Four-map free travel smoke: city↔land↔explore↔warrior instant, no fare. Next: CL42.3 Regression smoke after CL39–CL42.

---

## 2026-08-01 — CityLands CL40.2–CL41.1 travel ration + scarce tip + breeder blurb

Kitchen `pack_travel_ration` → cook XP; eat restores energy (no combat / not a travel fare). Tip `scarce_stations` lists shared scarce stations (incl. alchemy bench) vs unlimited land; notice stays min HUD. Animal Breeder quest blurb names feed + wood bedding (`feed_animal_pen` stable). Next: CL41.2 gate fishing_dock on builder XP.

---

## 2026-08-01 — CityLands CL39.2–CL40.1 land mill + carpenter tip + Explore gather sell

Land plant→harvest→mill flour smoke asserts farmer XP on player_land (city mill already CL35). Carpenter tutor basics name `assemble_wood_crate` / plank sink (quest `craft_plank` stable). Explore stump chop → `vendorSell` wood at Explore premium over City. Next: CL40.2 travel ration craft assert.

---

## 2026-08-01 — CityLands CL39.1 wood crate vendor/market sink

`VENDOR.sell.wood_crate` = 3 (city / explore / land; below 2× plank). Stackable crate lists on the player market. Content Lock amended. Next: CL39.2 land plant→harvest→mill.

---

## 2026-08-01 — CityLands CL38.2 + plan rollover → CityLands_9

Regression `citylands-smoke-cl8` covers mill→bread, cook meat, tonic eat, Explore premium sell, alchemy_bench builder gate. Plan rollover → [FullGameBuildPlan_CityLands_9.md](../19_development_plan/FullGameBuildPlan_CityLands_9.md) (CL39–CL42: crate sink, land farmer, Explore e2e, ration, dock gate, warrior copy).

---

## 2026-08-01 — CityLands CL38.1 herbal tonic eat assert

`eatFood(herbal_tonic)` restores Content Lock +45 energy with no combat buff and no profession XP; kitchen cook crafts stay cook. Chose eat assert over a second brew SKU. Next: CL38.2 regression smoke CL35–CL38.

---

## 2026-08-01 — CityLands CL37.1–CL37.3 Explore premium sell + tip fidelity

Explore vendor premium sell smoke: live `vendorSell` of a premium mat (leather) pays Explore rate above City; empty-bag refuse. Tip `explore_mats_craft` fidelity asserts woodland / mines / hunt → craft (id stable). Animal Breeder tutor basics + toolsNeeded name wheat feed and wood bedding alongside notice tip `animal_breeder_path`. Next: CL38 Alchemist second beat + regression.

---

## 2026-08-01 — CityLands CL36.1–CL36.3 carpenter crate + forge tools + alchemy gate

Workshop recipe `assemble_wood_crate` (2× plank → `wood_crate`) grants carpenter XP; housing-adjacent plank sink; SKU cap 23→24. Land forge smoke asserts `forge_iron_hammer` / `forge_iron_hoe` → blacksmith XP (not miner). `alchemy_bench.minBuilderXp` = `BUILDER_PLACE_XP` (8); kitchen stays ungated. Content Lock amended. Next: CL37 Explore vendor premium + tip fidelity.

---

## 2026-08-01 — CityLands CL35.1–CL35.3 mill→bread + flour/bread sinks + cook meat

City mill `mill_flour` → farmer XP then kitchen `bake_bread` → cook XP (Content Lock recipe profession corrected to cook). Flour NPC sell stays Content Lock 5 (Explore regional 3); bread lists on player market (no NPC bread rate). Kitchen `cook_meat` asserts cook XP with existing `meat_to_kitchen` tip. Next: CL36 carpenter / smith / builder gate.

---

## 2026-08-01 — CityLands CL33.1–CL34.1 tonic/bandage sinks + meat tip + loom gate

Vendor sell book adds `herbal_tonic` @ 4 and `cloth_bandage` @ 2 (city / explore / land). Stackable tonic/bandage list on the player market (land craft → City list smoke). Notice tip `meat_to_kitchen` + Kitchen craft panel copy for Explore raw meat → cook path (parallel to `fish_to_kitchen`). `loom.minBuilderXp` = `BUILDER_PLACE_XP` (8); kitchen stays ungated. Content Lock amended. Next: CL34.2 Animal Breeder second beat + CL34.3 regression.

---

## 2026-08-01 — CityLands CL31.1–CL31.3 dual hunter XP + Alchemist XP

Trail hunts grant `animal_hunter_xp`; thicket hunts grant `monster_hunter_xp` (schema v29); shared trail/thicket → `hunter` grants retired; legacy `hunter_xp` migrates into Animal Hunter. Tip `explore_mats_craft` + Animal/Monster Hunter tutor basics name both ladders (ids stable). `brew_herbal_tonic` grants `alchemist_xp` (schema v30 / ProfessionId `alchemist`); kitchen stew/fish stay cook. Content Lock amended. Next: CL32 land gather stations.

---

## 2026-08-01 — CityLands CL29.1–CL29.3 market buy/cancel + weaver bandage + cook asserts

Market smoke: land craft → City list → buyer buys one listing; seller cancels the other; cancel-not-yours + TTL buy refuse. Loom recipe `weave_cloth_bandage` (1× cloth → `cloth_bandage`, +20 energy edible) grants weaver XP; SKU cap 22→23. Assert `fish_to_kitchen` tip + `cook_fish` / `cook_stew` sinks stay green. Content Lock amended.

---

## 2026-08-01 — CityLands CL34.2–CL34.3 pen clean + smoke + plan rollover → CityLands_8

Land `animal_pen` second care beat: refresh bedding with 1× wood (`cleanAnimalPen`), shared 45s cooldown and +5 `animal_breeder_xp` with wheat feed; gather auto-prefers wheat then wood. Notice tip `animal_breeder_path` updated. Four-map smoke extended for CL31–CL34 (dual hunter XP, alchemist XP, land tree/ore, tonic/bandage vendor+market, pen clean, loom gate). Plan rollover → [FullGameBuildPlan_CityLands_8.md](../19_development_plan/FullGameBuildPlan_CityLands_8.md) (CL35–CL38: Farmer/Cook food chain, carpenter-smith depth, explore premium, alchemist beat).

---

## 2026-08-01 — CityLands CL28.1–CL28.3 builder mill gate + Alchemist bench

`mill.minBuilderXp` = `BUILDER_PLACE_XP` (8); workshop stays ungated. Placeable `alchemy_bench` (land unlimited + city ×1 slot 29); recipe `brew_herbal_tonic` → `herbal_tonic` (+45 energy, no combat). `CITY_PRACTICE_STATIONS.alchemist` → `alchemy_bench`; tutor objective `hold_herbal_tonic`; tip/tutor copy updated; `cook_stew` stays cook at kitchen. SKU cap 22. Content Lock amended.

---

## 2026-08-01 — CityLands CL32.1–CL32.3 land gather stations

Assert place+chop land `tree_stump` → forester XP and place+chip land `ore_node` → miner XP (hammer required); city place refuse (`buildPlayerLandOnly`). Notice tip `land_gather_practice` + Build Board copy: unlimited trees/ore on Your Land vs scarce city. Catalog costs unchanged (Content Lock).

---

## 2026-08-01 — CityLands CL30.1–CL30.3 hunt XP asserts + plan rollover → CityLands_7

Explore trail/thicket hunts assert Hunter XP (not Cook); homestead refuse unchanged; Monster Hunter tutor `hold_boar_tusk` still holds. Notice tip `explore_mats_craft` body notes hunt → Hunter XP. Four-map smoke extended for CL27–CL30 (pen feed/breeder, mill gate, alchemy brew, market buy/cancel, hunt XP). Plan rollover → [FullGameBuildPlan_CityLands_7.md](../19_development_plan/FullGameBuildPlan_CityLands_7.md) (CL31–CL34: dual hunter XP, Alchemist XP, land gather stations, craft sinks).

---

## 2026-08-01 — CityLands CL27.1–CL27.3 Animal Breeder feed loop

Walk-up wheat feed on land `animal_pen` (gather energy, 45s CD, no combat). `animal_breeder_xp` schema v28 + `ProfessionId` / gate wiring. City Animal Breeder tutor seeded (`feed_animal_pen`); practice map stays null (land pens only); notice tip updated. Content Lock amended.

---

## 2026-08-01 — CityLands CL26.3 regression + plan rollover → CityLands_6

Four-map smoke extended for CL23–CL26 (fisher/fish sell-cook, explore gather XP, market list, forge builder gate, animal pen, fish→kitchen tip). Plan rollover → [FullGameBuildPlan_CityLands_6.md](../19_development_plan/FullGameBuildPlan_CityLands_6.md) (CL27–CL30: Animal Breeder feed, alchemy bench, market depth, hunter XP).

---

## 2026-08-01 — CityLands CL26.2 animal pen stub

`animal_pen` placeable on player land (Build Board); city blocked; no livestock actions/combat. Notice tip `animal_breeder_path` notes pens exist while Breeder tutor stays unseeded. Content Lock amended.

---

## 2026-08-01 — CityLands CL26.1 builder XP gate on forge

`PLAYER_LAND_STATIONS.forge.minBuilderXp` = `BUILDER_PLACE_XP` (8). Under-gated `placeLandStation` refuses with `needsXp`; enough builder XP allows place. Build Board shows the gate. Content Lock amended.

---

## 2026-08-01 — CityLands CL25.1–CL25.3 market / land produce loop

Smoke: craft plank+cloth on player land → City → `createMarketListing` for plank/cloth/fish (bad qty refused; listing not map-gated). City vendor buy book asserted complete vs Content Lock (seeds + wooden_hoe + iron_hammer). Notice tip `fish_to_kitchen` + Kitchen craft panel copy for catch→cook path.

---

## 2026-08-01 — CityLands CL24.1–CL24.3 Explore gather fidelity

Assert Explore woodland chop → forester XP and mine chip → miner XP (hammer required). Notice tip `explore_mats_craft` body extended for wood + ore → carpenter/forge; tip id unchanged.

---

## 2026-08-01 — CityLands CL23.2–CL23.3 fish vendor/market + cook fish

Vendor sell book adds `fish` @ 2 coins (city / explore / land). Stackable fish lists on the player market. Kitchen recipe `cook_fish` → `cooked_fish` (+40 energy) grants cook XP; catalog SKU cap 21. No alchemy combat. Content Lock amended.

---

## 2026-08-01 — CityLands CL23.1 Fisher XP column

Dock catch grants `fisher_xp` (schema v27, +5). `ProfessionId` includes `fisher`; cook craft XP unchanged. Content Lock amended.

---

## 2026-08-01 — CityLands CL22.1 regression smoke + CityLands_5 rollover

Four-map smoke (`citylands-smoke-cl7`) extended for CL18–CL21: forester/miner/builder XP, scarce fishing dock catch, practice maps, `explore_mats_craft` + `post_craft_market` tips. Plan rollover → [FullGameBuildPlan_CityLands_5.md](../19_development_plan/FullGameBuildPlan_CityLands_5.md) (CL23–CL26: Fisher XP, fish economy, Explore gather fidelity, market list, builder gates).

---

## 2026-08-01 — CityLands CL21.1–CL21.2 land→market + explore craft tips

One-shot onboarding tip `post_craft_market` (`postCraftMarketTip`) after first land craft nudges City Vendor / Market list; clears on dismiss, City travel, or vendor visit — min HUD, no always-on column. Notice board tip `explore_mats_craft` (`exploreMatsCraftChainTip`) documents leather / tusks / wood from Explore feeding weave, cook, and carpenter crafts.

---

## 2026-08-01 — CityLands CL20.1–CL20.2 Alchemist Kitchen practice

`CITY_PRACTICE_STATIONS.alchemist = ["kitchen"]` (shared with Cook). Notice tip `fisher_alchemist_practice` + Alchemist tutor copy state Kitchen as the brew stand-in until a dedicated bench; `cook_stew` remains a cook craft. No alchemy combat invented.

---

## 2026-08-01 — CityLands CL19.1–CL19.3 Fisher catch loop

`fish` item + `fishing_dock` on player land (Build Board; 22c + 3 wood + 1 plank). Exactly one scarce city dock (slot 27); `CITY_PRACTICE_STATIONS.fisher = ["fishing_dock"]`. Catch = gather energy + 60s cooldown (no rod). Fisher tutor objective `hold_fish`; notice tip updated (alchemist Kitchen practice follows in CL20).

---

## 2026-08-01 — CityLands CL16.1–CL16.2 empty-land tip + Animal Breeder note

Empty player land tip (`emptyLandBuildBoardTip` / onboarding `empty_land`) clarifies intentional emptiness — Build Board or travel to City; dismissible / walk-up only. Animal Breeder stays unseeded (no pens/livestock); city notice tip `animal_breeder_path` documents the deferral without inventing livestock combat.

---

## 2026-08-01 — CityLands CL15.1–CL15.2 Hunter + Builder tutors

City hub seeds Animal Hunter + Monster Hunter + Builder tutors (`hold_leather` / `hold_boar_tusk` / `place_land_station`). Hunter practice stays on Exploration (homestead hunt refuses); Builder completes after placing a station on Your Land via the build board. Warrior still off the economy ladder. Remaining stub: Animal Breeder.

---

## 2026-08-01 — CityLands CL14.1–CL14.2 Fisher + Alchemist tutors

City hub seeds Fisher + Alchemist tutors (`tutorial_fisher` / `hold_raw_meat`, `tutorial_alchemist` / `brew_stew`). No fishing dock or alchemy bench yet — `CITY_PRACTICE_STATIONS` stays null; notice tip `fisher_alchemist_practice` documents Explore meat + Kitchen stew stand-ins. Warrior still off the economy ladder.

---

## 2026-08-01 — CityLands CL17.1 regression smoke + CityLands_4 rollover

Four-map smoke (`citylands-smoke-cl7`) extended for CL13–CL16 tutors, Weaver XP, Builder ready-after-place, deferred practice nulls, empty-land tip, city place refuse, Animal Breeder stub. Plan rollover → [FullGameBuildPlan_CityLands_4.md](../19_development_plan/FullGameBuildPlan_CityLands_4.md) (CL18–CL22: XP fidelity, Fisher catch, Alchemist practice, market tips).

---

## 2026-08-01 — CityLands CL18.1 Forester XP column

Tree stump chop grants `forester_xp` (schema v24) instead of carpenter XP. Carpenter XP remains on workshop crafts. Forester tutor `gather_wood` objective tracks forester XP. Content Lock amended.

---

## 2026-08-01 — CityLands CL18.2 Miner XP column

Ore gather grants `miner_xp` (schema v25) instead of blacksmith XP. Blacksmith XP remains on forge crafts. Miner tutor `gather_ore` objective tracks miner XP. Content Lock amended.

---

## 2026-08-01 — CityLands CL18.3 Builder XP on place

Successful `placeLandStation` grants `builder_xp` (schema v26, `BUILDER_PLACE_XP` = 8). City place still blocked; warrior unused. Content Lock amended.

---

## 2026-08-01 — CityLands CL13.2–CL13.3 city loom + Weaver XP

City template gains exactly one scarce `loom` (slot 21); city place still blocked; land place unlimited. `weave_cloth` routes through `weaver` / `weaver_xp` (schema v23) instead of carpenter XP. Weaver tutor copy points at city loom or Your Land.

---

## 2026-08-01 — CityLands CL13.1 Weaver tutor

City hub seeds Weaver tutor (`tutorial_weaver` / `weave_cloth` objective). Cloth inventory completes the quest; scarce city loom deferred to CL13.2. Warrior remains off the economy ladder.

---

## 2026-08-01 — CityLands CL12.1–CL12.2 hub tip + smoke

First-session dismissible tip (`cityHubFirstSessionTip` / onboarding `city_hub`) points new players at City as the shared hub while default spawn remains empty `player_land`. Four-map smoke (`citylands-smoke-cl7`) extended for CL8–CL11 templates (6 tutors, notice board, loom, warrior homestead refuse, notice panel closed-by-default).

---

## 2026-08-01 — CityLands CL11.1–CL11.2 warrior optional clarity

Arena plaque copy shared via `arenaPlaqueCopy` (optional / no gear ladder / free exit). Warrior portal prompt + world Exit label stress **N** / north portal. Homestead build path rejects `WARRIOR_TRAINING_BUILDING_TYPES` (`arena_board`) with `warriorTrainingHomesteadForbidden`.

---

## 2026-08-01 — CityLands CL10.2 explore vendor value

Documented regional sell tip (`exploreRegionalVendorTip`) in README + city notice board. Tests assert Explore pays more than City/Land for wood/hunt mats; wheat/flour cheaper and seeds pricier at Explore.

---

## 2026-08-01 — CityLands CL10.1 explore wayfinding

Exploration gains `EXPLORE_SECTIONS` (Woodland / Mines / Hunt grounds): tinted floor patches + floating labels; interact prompts on explore prefix section names. No new minimap; hunt remains explore-only.

---

## 2026-08-01 — CityLands CL9.2 land→city tip

City notice board gains `land_to_city` tip: craft on Your Land, sell/list in City. Walk-up only — no always-on HUD column.

---

## 2026-08-01 — CityLands CL9.1 loom station

Player-land build board gains `loom` (Weaver): unlimited place, city blocked. Recipe `weave_cloth` (2× leather → cloth). Weaver XP column deferred — crafts use carpenter XP gate for now.

---

## 2026-08-01 — CityLands CL8.3 notice board

City hub gains `notice_board` walk-up stub with static tips (free travel circuit, scarce stations, warrior optional). Panel opens on interact only — no live-ops backend.

---

## 2026-08-01 — CityLands CL1.2 free travel

Free instant travel City ↔ Lands ↔ Explore ↔ Warrior (`/api/travel`); no caravan timer/fare. City/warrior portal stubs; TravelPanel lists all four destinations.

---

## Version 1.2.1 — Implementation start

Release Date

July 30, 2026

### Overview

Started MVP codebase: npm workspaces with Hono/SQLite server and Next.js + React Three Fiber client. Locked TQ-001 (monolith) and TQ-003 (R3F stack). Farmer plant/harvest and craft endpoints playable.

### Additions

```
apps/server
apps/web
packages/shared
tests/
```

### Implementation notes (same day)

```
P4.1 Visit lands (view + trade)
P4.2 Simple marketplace (list/buy/cancel, Key M, schema v4)
P5 Ore node + kitchen bread + expand/market/visit UX
P6 Trade escrow/tools, hoe plant fix, energy ETA HUD
P7 Proximity, chat, hunt trail, cook XP, minimal guilds (schema v5)
```

---

## Version 1.2.0

Release Date

July 30, 2026

Status

Documentation ready for implementation planning

---

### Overview

Closed remaining consolidation gaps: merged overlapping economy and combat docs, defined MVP, filled narrative/UI/audio foundations, added Glossary, promoted Vision package to Active, resolved class-lock Open Question.

---

### Merges And Removals

```
EconomyOverview.md + EconomicModel.md → Economy.md (canonical)
CombatGameplay.md → Combat.md (canonical)
Removed catalogs/ProfessionsContent.md (covered by Professions.md)
```

---

### Additions

```
19_development_plan/MVPDefinition.md
04_story_lore/StoryOverview.md
12_ui_ux/UIUXOverview.md
14_audio/AudioDirection.md
20_appendices/Glossary.md
```

---

### Decisions

```
GQ-001 Resolved: no permanent class locks (Core Pillars)
Foundation docs (Vision, Pillars, Rules, Principles) → Active 1.0.0
```

---

## Version 1.1.0

Release Date

July 30, 2026

Status

Documentation structure consolidation

---

### Overview

Consolidated the Project Bible into a single numbered folder tree matching `PROJECTBIBLE.md`. Removed parallel schemes (`01-Vision` / kebab-case trees vs `16_`–`20_` trees), deleted empty stubs, and deduplicated overlapping documents.

---

### Structural Changes

```
Canonical tree: docs/01_project_foundation … docs/20_appendices

Removed parallel trees (examples):
  01-Vision, 02-systems, 03-design, 04-content, 05-gameplay,
  06-world, 07-art-and-style, 08-game-features, 09-blockchain,
  10_technical_architecture, 11_gameplay_systems, 12_blockchain_systems,
  13_economy_design, 14_world_design, 15_social_systems,
  16_content_catalogs, 16_content_design, 17_economy_design,
  18_technical_design
```

---

### Naming Fixes

```
GameDesingRules.md → GameDesignRules.md
GamePlayLoop.md → GameplayLoop.md
Resourser.md → Resources.md
```

---

### Deduplication

```
Kept QuestSystem / EventSystem (removed Quests / Events duplicates)
Moved DesignPrinciples into 01_project_foundation
Content catalogs under 08_items_crafting/catalogs
Blockchain design vs architecture roles clarified in index
```

---

### Meta

```
PROJECTBIBLE.md rebuilt as accurate file index + source-of-truth rules
README.md updated
PLANNING.md and TASKS.md added
FutureIdeasBacklog.md seeded (was empty)
Placeholders for story/lore, UI/UX, audio
```

---

## Version 1.0.0

Release Date

July 30, 2026

Status

Official Initial Release

---

### Overview

First complete edition of the Project Bible.

This version establishes the complete design, technical architecture, development strategy, and long-term vision of the project.

---

### Major Additions

Completed documentation includes:

```
Project Vision

World Design

Lore

Gameplay Systems

Character Systems

Combat

Items

Crafting

Economy

Quest Design

Multiplayer

Blockchain

Artificial Intelligence

UI/UX

Art Direction

Audio Design

Technical Architecture

Backend

Infrastructure

Development Plan

Testing

Release Management

Appendices
```

---

### Development Planning

Completed:

```
Roadmap

Milestones

Sprint Structure

Workflow

Team Organization

Release Strategy
```

---

### Technical Documentation

Established:

```
Architecture

Coding Standards

Naming Conventions

Security Guidelines

Testing Strategy
```

---

### Reference Documentation

Completed:

```
Glossary

References

Risk Register

Open Questions

Design Principles
```

---

### Initial Project Goals

The first version defines:

- Core gameplay vision.
- Long-term architecture.
- MVP scope.
- Expansion strategy.
- Living world philosophy.

---

# Future Version Format

Future releases should follow this template.

---

## Version X.Y.Z

Release Date

```
YYYY-MM-DD
```

Status

```
Draft

Released

Archived
```

---

### Summary

Brief description of the release.

---

### Added

List of new documentation.

---

### Changed

Existing documentation updated.

---

### Improved

Quality improvements.

---

### Deprecated

Documentation scheduled for removal.

---

### Removed

Obsolete documentation removed.

---

### Fixed

Corrections.

---

### Security

Security-related updates.

---

### Migration Notes

Instructions for contributors when documentation structure changes.

---

# Documentation Lifecycle

Every document may progress through:

```
Draft

↓

Review

↓

Approved

↓

Released

↓

Archived
```

---

# Breaking Changes

Breaking changes include:

- Folder restructuring.
- Major architecture revisions.
- Core gameplay redesign.
- Naming convention changes.
- Documentation reorganizations.

These changes should increment the **Major** version.

---

# Minor Updates

Examples:

- New gameplay systems.
- Additional documentation.
- New technical standards.
- Expanded world design.
- Additional appendices.

These updates increment the **Minor** version.

---

# Patch Updates

Examples:

- Typographical corrections.
- Clarified explanations.
- Updated examples.
- Corrected references.
- Improved formatting.

These updates increment the **Patch** version.

---

# Release Approval

A new documentation release should be approved by:

- Project Director
- Technical Director
- Creative Director

---

# Archive Policy

Previous versions should never be overwritten.

Instead:

- Preserve historical copies.
- Tag releases in version control.
- Maintain migration notes when required.

---

# Future Milestones

Potential future documentation releases:

```
v1.1

Gameplay Improvements

↓

v1.2

Architecture Expansion

↓

v2.0

Major Gameplay Evolution
```

---

# Repository Tags

Recommended tags:

```
v1.0.0

v1.1.0

v1.2.0

v2.0.0
```

---

# Maintenance

The changelog should be updated whenever:

- A new document is added.
- A major document changes.
- Project scope changes.
- Architecture evolves.
- Gameplay systems are redesigned.

---

# Final Statement

The Changelog provides an official historical record of the Project Bible.

Maintaining accurate version history improves collaboration, simplifies future updates, and preserves the evolution of the project's vision over time.