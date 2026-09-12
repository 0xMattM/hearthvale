# Full Game Build Plan — CityLands Visual Assets 2 (VA2)

**Document Version:** 1.0.2  
**Status:** Complete — VA2.1–VA2.6 done; live → [FullGameBuildPlan_CityLands_VisualAssets_3.md](FullGameBuildPlan_CityLands_VisualAssets_3.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior visual assets:** VA1.1–VA1.3 done (`world-object-materials.ts` — gather nodes, process stations, scarce yard props, trees/fences/sheds, crop soil)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Visual assets (VA*)**  
**Parallel to:** Polish PL* (cue loop) — do not block PL*

---

# Goal

Continue **player-visible mesh/material polish** after VA1 emptied. Survey showed remaining flat kits (default `meshStandardMaterial` colors, no shared PBR SoT):

| Gap | Where | Notes |
| --- | --- | --- |
| Travel portals | `PortalBuilding` | MAP_IDENTITY tints only; no roughness/metalness / footing articulation |
| Vendor / market | `VendorStall`, `MarketBoardBuilding` | Flat awning/counter/posts |
| Notice / build / arena plaques | `NoticeBoardBuilding`, `BuildBoardBuilding`, `ArenaBoardBuilding` | Flat boards/posts |
| Tutors + housing decor | `TutorialNpcBuilding`, decor pad/planter/banner | Flat capsules / pots |
| Hunt trails | `GameTrailMesh`, `EdgeThicketMesh` | Flat path + creature |
| Plaza fountain + warrior ring props | `PlazaFountainLandmark`, `WarriorEnvironment` | Flat basin / posts / benches |
| Avatar kit | `AvatarKit` | Flat farmer silhouette (optional later) |
| Expand / claim | `ExpandPadMesh`, `ClaimNodeBuilding` | Flat posts / banner |

Prefer **procedural PBR + cheap geometry** via `packages/shared/src/world-object-materials.ts`. No new texture pipeline. Keep gameplay / cues / economy / **MAP_IDENTITY** intact.

---

# Non-goals

- Do **not** invent GLTF downloads or texture atlases.  
- Do **not** change travel fares, station layouts, contention, or MAP_IDENTITY veil/frame **colors**.  
- Do **not** block or reorder Polish PL*.  
- Do **not** grow always-on HUD.

---

# Phase order

```
VA2.1 Travel portals
 → VA2.2 Vendor + market commerce kits
 → VA2.3 Notice / build / arena plaque kits
 → VA2.4 Tutors + housing decor kits
 → VA2.5 Hunt trail / thicket kits
 → VA2.6 Plaza fountain + warrior arena props
```

---

# Phase VA2 — Civic / travel / service kits

| ID | Work | Acceptance |
| --- | --- | --- |
| VA2.1 | **Travel portal kit materials.** Shared SoT surfaces for posts/lintel/footing/threshold/band + cheap articulation (footings, mid bands, threshold slab, lintel keystone). Wire `PortalBuilding`. Keep `portalMeshTintForLandKind` / MAP_IDENTITY colors + Free pulse / labels. | Layouts / fares / tint RGB unchanged; tests on helper — **done** |
| VA2.2 | **Vendor stall + market board materials.** Counter/awning/posts/goods + market frame/listing strips PBR + light articulation. Commerce pads / lantern cues unchanged. | Prices / layouts unchanged — **done** |
| VA2.3 | **Notice board + build board + arena plaque materials.** Timber/plaque/metal trim SoT; unread/beacon/pulse emissives stay on existing cue helpers. | Copy / beacon rules unchanged — **done** |
| VA2.4 | **Tutor NPC + housing decor materials.** Cloak/skin/boots PBR; planter pot/foliage + banner cloth/pole; decor pad stone. Claim pads / tips unchanged. | Profession cloaks / layouts unchanged — **done** |
| VA2.5 | **Hunt trail + thicket materials.** Path/track/vegetation + creature hide surfaces; ready cues unchanged. | Spawns / hunt rules unchanged — **done** |
| VA2.6 | **Plaza fountain + warrior arena prop materials.** Basin/spout/water lip articulation; arena posts/ropes/benches/banner poles. Landmark pulse / exit chrome unchanged. | Floors / MAP_IDENTITY unchanged — **done** |

---

# Continuations

VA2.* emptied 2026-08-02 → leftovers surveyed → [FullGameBuildPlan_CityLands_VisualAssets_3.md](FullGameBuildPlan_CityLands_VisualAssets_3.md) (VA3.1–VA3.4).

---

# Choices log

- **2026-08-02:** Same SoT file as VA1 (`world-object-materials.ts`) — one import surface for kits; no texture pipeline. Portal first because free-travel gates every map and still read as flat boxes beside VA1 stations.
- **2026-08-02:** VA2.1–VA2.2 shipped in same tick — portals then commerce kits; notice/build/arena deferred to VA2.3 so plaque cue emissives stay isolated.
- **2026-08-02:** VA2.3–VA2.4 shipped in same tick — plaque boards first (unread/beacon/pulse isolation), then tutors+housing decor so flat capsules no longer sit beside upgraded civic boards.
- **2026-08-02:** VA2.5–VA2.6 shipped in same tick — hunt trail/thicket first (Explore nodes matching VA1 stations), then plaza fountain + warrior arena props (last VA2 flat kits). Path/creature wayfinding colors + landmark pulse + arena floors unchanged.
- **2026-08-02:** VA2 queue empty → survey leftovers (expand / claim / avatar / civic blocks) → VA3 authored.
