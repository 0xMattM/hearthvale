# Full Game Build Plan — CityLands Visual Assets 4 (VA4)

**Document Version:** 1.0.0  
**Status:** Emptied — VA4.1–VA4.4 done (2026-08-02); live → [FullGameBuildPlan_CityLands_VisualAssets_5.md](FullGameBuildPlan_CityLands_VisualAssets_5.md)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior visual assets:** VA1.1–VA1.3 + VA2.1–VA2.6 + VA3.1–VA3.4 done (`world-object-materials.ts`)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Visual assets (VA*)**  
**Parallel to:** Polish PL* (cue loop) — do not block PL*

---

# Goal

Continue **player-visible mesh/material polish** after VA3 emptied. Survey of leftovers (flat `meshStandardMaterial` / `meshBasicMaterial` without shared PBR SoT):

| Gap | Where | Notes |
| --- | --- | --- |
| City hub floors | `CityEnvironment` | Streets / plaza / scarce yard / inlay / roads — color-only; `CITY_HUB_VISUAL` locked |
| Homestead yard floors | `HomesteadEnvironment` | Meadow / plot / pad / path — color-only; empty/lived/visit + PL142.1 path emissive stay |
| Explore wilds floors | `ForestEnvironment` | Outer canopy / section floors / entry path — color-only; landmark haze/emissive stay |
| Warrior arena floors | `WarriorEnvironment` | Grounds / clay ring / chalk / exit path — color-only; props already VA2.6 |
| Interact HighlightRing | `BuildingMesh` + `ResourceMeshes` | Duplicate flat `meshBasicMaterial` gold rings |
| Remote presence extras | `RemotePlayerAvatar` (+ avatar shadow disc) | Halo / nearby ping cue colors stay; body kit already VA3.3 |

Prefer **procedural PBR + cheap geometry** via `packages/shared/src/world-object-materials.ts`. No new texture pipeline. Keep gameplay / cues / economy / **MAP_IDENTITY** / atmosphere floor **hexes** intact.

---

# Non-goals

- Do **not** invent GLTF downloads or texture atlases.  
- Do **not** change floor / haze / landmark / MAP_IDENTITY **RGB** values in catalog.  
- Do **not** override tutor-lane / plaza / woodland / mines / hunt landmark emissives or lived-path pulse.  
- Do **not** block or reorder Polish PL*.  
- Do **not** grow always-on HUD.

---

# Phase order

```
VA4.1 City hub floors
 → VA4.2 Homestead yard floors
 → VA4.3 Explore wilds floors
 → VA4.4 Warrior arena floors + HighlightRing
```

Remote presence extras → Continuations / VA5 if still flat after VA4.4.

---

# Phase VA4 — Map floors / select ring

| ID | Work | Acceptance |
| --- | --- | --- |
| VA4.1 | **City hub floor materials.** Shared SoT for streets / plaza / scarce yard / inlay / road PBR + cheap curb/lip articulation. Wire `CityEnvironment`. Keep `cityHubFloorColors` / scarce-vs-civic contrast / landmark cues. | Layouts / contention / MAP_IDENTITY unchanged; tests on helper — **done** |
| VA4.2 | **Homestead yard floor materials.** Meadow / plot / pad / path PBR + light edge lip. Wire `HomesteadEnvironment`. Keep empty/lived/visit palette + PL142.1 path emissive. | Slots / visit rules unchanged; tests on helper — **done** |
| VA4.3 | **Explore wilds floor materials.** Outer canopy / section floors / entry + hunt path PBR. Wire `ForestEnvironment`. Keep `EXPLORE_SECTIONS` / woodland+mines landmark emissive+haze. | Spawns / layouts unchanged; tests on helper — **done** |
| VA4.4 | **Warrior arena floors + HighlightRing.** Grounds / ring / chalk / path PBR; dedupe interact ring SoT (`BuildingMesh` + `ResourceMeshes`). Keep `WARRIOR_ARENA_VISUAL` + select gold cue. | Combat stub / select feedback unchanged; tests on helper — **done** |

---

# Continuations

When VA4.* empties → survey remotes / cue-pad discs / progress bars → author VA5 or fold into next visual appendix.

**2026-08-02:** VA4.* emptied. Leftovers surveyed → [FullGameBuildPlan_CityLands_VisualAssets_5.md](FullGameBuildPlan_CityLands_VisualAssets_5.md) (VA5.1–VA5.4: remotes / avatar shadow / crop progress / cue-pad bases).

---

# Choices log

- **2026-08-02:** Same SoT file (`world-object-materials.ts`) — no texture pipeline. City floors first: hub still reads as flat color planes beside VA3 civic blocks + VA2 fountain; atmosphere hexes stay on `CITY_HUB_VISUAL`. Homestead / Explore / Warrior floors follow so four-map contrast tests keep working. HighlightRing after floors so select gold stays isolated from map ground PBR. Remotes deferred past VA4.4.
- **2026-08-02:** VA4.1–VA4.2 shipped in same tick — city curb lips then homestead path lips; Explore deferred to VA4.3 so woodland/mines landmark emissives stay isolated.
- **2026-08-02:** VA4.3–VA4.4 shipped same tick — Explore canopy/section/path PBR + lips (landmarks untouched), then Warrior grounds/ring/chalk/path + `interactHighlightRingMaterials` dedupe. Remotes deferred to VA5.
- **2026-08-02:** VA4.* empty → authored VA5 (remotes → avatar shadow → crop progress → cue-pad bases).
