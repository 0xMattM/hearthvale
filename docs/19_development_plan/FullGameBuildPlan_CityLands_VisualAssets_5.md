# Full Game Build Plan — CityLands Visual Assets 5 (VA5)

**Document Version:** 1.0.0  
**Status:** Complete — VA5.1–VA5.4 done; post-VA5 survey → **no VA6** (visual-asset track **idle**)  
**Created:** 2026-08-02  
**Product SoT:** [PlayerVision_CityLands.md](PlayerVision_CityLands.md)  
**Prior visual assets:** VA1.1–VA1.3 + VA2.1–VA2.6 + VA3.1–VA3.4 + VA4.1–VA4.4 done (`world-object-materials.ts`)  
**Live checklist:** [TASKS.md](../../TASKS.md) — **Visual assets (VA*)** — **idle** (no pending VA*)  
**Parallel to:** Polish PL* (cue loop) — do not block PL*

---

# Goal

Continue **player-visible mesh/material polish** after VA4 emptied. Survey of leftovers (flat materials without shared PBR SoT):

| Gap | Where | Notes |
| --- | --- | --- |
| Remote presence halo / ping | `RemotePlayerAvatar` | Cool teal silhouette + sage interact ping — color/opacity envelopes stay; rings lack roughness/metalness |
| Avatar ground shadow disc | `AvatarKit` | Flat `meshBasicMaterial` circle under local + remotes |
| Crop growth progress bar | `CropFieldMesh` in `ResourceMeshes` | Color-only box while planted; ready/growing pads stay on cue catalogs |
| Cue-pad flash discs | `GatherSuccessFlashPad`, `FishCatchSplashPad`, `ExpandFieldFlashPad`, `BuildPlaceSpawnFlashPad`, process complete/upgrade pads | Pulse envelopes + pad RGB stay; base discs lack PBR |

Prefer **procedural PBR + cheap geometry** via `packages/shared/src/world-object-materials.ts`. No new texture pipeline. Keep gameplay / polish cue envelopes / economy / **MAP_IDENTITY** intact — only upgrade base materials/meshes under those cues.

---

# Non-goals

- Do **not** invent GLTF downloads or texture atlases.  
- Do **not** change `PRESENCE_PEER_SILHOUETTE` / `NEARBY_PEER_PING` / exit-fade / flash-pad **RGB**, opacity peaks, or envelope helpers.  
- Do **not** change presence rules, crop grow timers, gather/craft yields, or expand costs.  
- Do **not** block or reorder Polish PL*.  
- Do **not** grow always-on HUD.

---

# Phase order

```
VA5.1 Remote presence halo/ping
 → VA5.2 Avatar ground shadow disc
 → VA5.3 Crop growth progress bar
 → VA5.4 Cue-pad flash base materials
```

---

# Phase VA5 — Remotes / discs / bars / cue pads

| ID | Work | Acceptance |
| --- | --- | --- |
| VA5.1 | **Remote presence materials.** Shared SoT for silhouette halo + nearby ping ring PBR (+ optional quiet lip). Wire `RemotePlayerAvatar`. Keep `PRESENCE_PEER_SILHOUETTE` / `NEARBY_PEER_PING` colors, geometry, opacity, emissive, PL134.2 exit fade. | Presence / interact range unchanged; tests on helper — **done** |
| VA5.2 | **Avatar ground shadow disc.** Shared SoT for soft ground shadow PBR (replace flat basic). Wire `AvatarKit` local+remote. Keep silhouette / palette / map tint. | Movement / combat / silhouette lock unchanged; tests on helper — **done** |
| VA5.3 | **Crop growth progress bar.** Shared SoT for planted progress bar PBR (+ light frame lip). Wire `CropFieldMesh`. Keep ready pad pulse / growing sway / growMs. | Plant / harvest / timers unchanged; tests on helper — **done** |
| VA5.4 | **Cue-pad flash base materials.** Shared SoT for gather/fish/expand/build/craft/upgrade flash disc PBR under existing envelope drivers. Keep pad colors + pulse helpers. | Yields / costs / craft rules unchanged; tests on helper — **done** |

---

# Continuations

When VA5.* empties → survey any remaining flat world meshes → author VA6 or fold leftovers into next visual appendix. Do **not** resume PL* solely because VA flats remain; PL* stays parallel.

## Post-VA5 survey (2026-08-02) — no meaningful flat kits → track idle

Survey of `apps/web/components/land-scene/*` after VA5.4: **no structural world kits** remain on color-only `meshStandardMaterial` / `meshBasicMaterial` without shared PBR SoT.

| Remaining without SoT roughness | Classification | Action |
| --- | --- | --- |
| Emissive / transparent cue pads & halos (process working, commerce, crop ready/growing, gather depleted, hunt pads, tutor claimable, notice unread, scarce busy/free, visit host pad, build-board beacon) | Polish **cue envelopes** (RGB / opacity / emissive driven) | Leave — not a flat kit; VA5 already covered flash disc bases |
| Atmosphere haze planes (city / homestead / explore / warrior + landmark haze) | FX overlays; prior VA phases explicitly kept haze | Leave |
| Portal veil, HighlightRing (`meshBasicMaterial` via `interactHighlightRingMaterials`) | Cue / select feedback SoT | Leave |
| Hunt ready footprint discs (`meshBasicMaterial` tiny circles) | Decorative cue under HUNT_TRAIL_WAYFINDING | Leave — not a kit |
| Crop stem / head (emissive tied to grow/ready) | Plant geometry + PL cue emissives; soil + progress bar already VA1.3 / VA5.3 | **Optional only** — do not invent VA6 busywork |
| Lived chimney + smoke plume (PL118.1) | Cue-driven emissive / transparent FX on shed | **Optional only** |
| Scarce barrel band literals (`roughness={0.55}` inline) | Already PBR; micro SoT dedupe | **Optional only** |

**Decision:** Do **not** author VA6. Visual-asset (VA*) workstream is **idle**. Optional leftovers above stay annex notes only — pick only if a future player/product ask targets them. Loop continues on **Polish PL\*** (parallel track).

---

# Choices log

- **2026-08-02:** Same SoT file (`world-object-materials.ts`) — no texture pipeline. Remotes first (deferred from VA4 Continuations): presence cues stay on catalog; only ring PBR. Avatar shadow next (same kit family as VA3.3). Progress bar then cue-pad bases so grow/ready and flash envelopes stay isolated from presence.
- **2026-08-02:** VA5.1–VA5.2 shipped same tick — remote halo/ping + quiet lip, then AvatarKit ground shadow PBR; crop progress / cue-pad bases deferred to VA5.3–VA5.4.
- **2026-08-02:** VA5.3–VA5.4 shipped same tick — crop progress fill/frame PBR on CropFieldMesh (growMs / ready pulse / growing sway unchanged), then shared cue-pad flash disc PBR (land + water) under gather/fish/expand/build/craft/upgrade envelopes (pad RGB / peaks intact). VA5.* empty → Continuations survey.
- **2026-08-02:** Post-VA5 survey — no meaningful structural flat kits left (only cue/haze/optional micro leftovers). **No VA6** authored; VA* track marked **idle** (avoid busywork).
