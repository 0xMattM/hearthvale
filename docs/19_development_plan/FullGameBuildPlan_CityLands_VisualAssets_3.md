# Full Game Build Plan — CityLands Visual Assets 3 (VA3)

**Document Version:** 1.0.0  
**Status:** Complete — VA3.1–VA3.4 done; live → [FullGameBuildPlan_CityLands_VisualAssets_4.md](FullGameBuildPlan_CityLands_VisualAssets_4.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior visual assets:** VA1.1–VA1.3 + VA2.1–VA2.6 done (`world-object-materials.ts`)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Visual assets (VA*)**  
**Parallel to:** Polish PL* (cue loop) — do not block PL*

---

# Goal

Continue **player-visible mesh/material polish** after VA2 emptied. Survey of leftovers (flat `meshStandardMaterial` kits still without shared PBR SoT):

| Gap | Where | Notes |
| --- | --- | --- |
| Expand pad posts | `ExpandPadMesh` | Pad afford tint / short pulse stay on `EXPAND_PAD_*`; corner posts flat `#5c4330` |
| Claim node beacon | `ClaimNodeBuilding` | Banner yours/held/unclaimed colors + walk-up tip emissives stay; post/banner flat |
| Avatar farmer kit | `AvatarKit` / `avatar-art` | Palette + PL122.1 map tint stay; boots/cloth/hat/tool flat |
| Civic block silhouettes | `CivicBlock` in `CityEnvironment` | Cool civic pads / door / window flat boxes (PL36.1 / PL1.1) |

Prefer **procedural PBR + cheap geometry** via `packages/shared/src/world-object-materials.ts`. No new texture pipeline. Keep gameplay / cues / economy / **MAP_IDENTITY** intact.

---

# Non-goals

- Do **not** invent GLTF downloads or texture atlases.  
- Do **not** change expand costs, claim/war rules, avatar movement, or MAP_IDENTITY veil/frame **colors**.  
- Do **not** override `EXPAND_PAD_AFFORD_CUE` / short-pulse emissives or claim banner ownership colors.  
- Do **not** block or reorder Polish PL*.  
- Do **not** grow always-on HUD.

---

# Phase order

```
VA3.1 Expand pad posts
 → VA3.2 Claim node beacon
 → VA3.3 Avatar farmer kit
 → VA3.4 Civic block silhouettes
```

---

# Phase VA3 — Interact pads / self / civic leftovers

| ID | Work | Acceptance |
| --- | --- | --- |
| VA3.1 | **Expand pad kit materials.** Shared SoT for pad stone PBR + post timber/caps + cheap footing lip / post-cap articulation. Wire `ExpandPadMesh`. Keep `expandPadMeshColors` / short-afford pulse / walk-up tip. | Costs / slots / afford RGB unchanged; tests on helper — **done** |
| VA3.2 | **Claim node kit materials.** Post/footing/banner cloth/finial PBR + cheap articulation. Wire `ClaimNodeBuilding`. Keep yours/held/unclaimed banner colors + first-walk-up tip emissives. | Claim / war / produce rules unchanged; tests on helper — **done** |
| VA3.3 | **Avatar farmer kit materials.** Cloth/skin/boots/hat/tool surfaces in SoT; wire `AvatarKit` fallback meshes. Keep `resolveAvatarKitColors` / PL122.1 vest+hatBand tint + remotes palette. | Movement / combat / silhouette lock unchanged; tests on helper — **done** |
| VA3.4 | **Civic block silhouette materials.** Pad/wall/roof/door/window PBR + light sill/trim articulation on `CivicBlock`. Keep civic pad cool tint vs scarce yard (PL36.1). | Layouts / MAP_IDENTITY floors unchanged; tests on helper — **done** |

---

# Continuations

VA3.* emptied 2026-08-02 → leftovers surveyed → [FullGameBuildPlan_CityLands_VisualAssets_4.md](FullGameBuildPlan_CityLands_VisualAssets_4.md) (VA4.1–VA4.4).

---

# Choices log

- **2026-08-02:** Same SoT file (`world-object-materials.ts`) — no texture pipeline. Expand pad first: homestead every-session unlock marker still reads as flat posts beside VA1 stations; afford cue colors stay isolated on catalog helpers.
- **2026-08-02:** Claim node next (Explore Wild Grove) before avatar so ownership banner colors stay isolated from farmer kit PBR; avatar + civic blocks follow.
- **2026-08-02:** VA3.1–VA3.2 shipped in same tick — expand lip/caps then claim footing/finial; avatar deferred to VA3.3.
- **2026-08-02:** VA3.3–VA3.4 shipped in same tick — avatar cuff/belt/ferrule then civic sill/eaves; map-tint palette kept isolated from hub masonry. VA3.* empty → survey floors/HighlightRing for VA4.
- **2026-08-02:** VA3 queue empty → authored VA4 (map floors → HighlightRing → remote presence).
