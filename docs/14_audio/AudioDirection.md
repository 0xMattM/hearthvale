# Audio Direction

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Audio Team  
**Last Updated:** July 30, 2026

---

# Purpose

Define audio goals that reinforce a living workshop-frontier world without competing with gameplay clarity.

---

# Direction

- Grounded, warm production sounds (tools, crops, workshops).
- Public wilds: sparse, tense ambience.
- UI: short, readable confirmations—not arcade spam.
- Music supports long sessions; loops must not fatigue.
- CityLands map beds (PL7): quiet per-map drones in `game-audio` `BGM_BEDS` — Explore stays sparser/tenser than homestead Land; not a full music suite.
- Map continuity (PL51.1): bed identities stay distinct; landKind / visit swaps use a quieter restart / brief crossfade (`BGM_MAP_TRANSITION`) instead of a hard cut; mute still silences.

---

# MVP Priorities

| Priority | Content |
| --- | --- |
| P0 | UI confirm / error cues (PL16.1 soft refuse on busy/energy/already-here; mute-safe) |
| P0 | Crafting / harvest one-shots |
| P1 | Land ambient bed |
| P1 | Soft marketplace cue (PL10.1 vendor_buy/vendor_sell + PL10.2 market TopBar cues) |
| P1 | Housing decor place confirm (PL16.2 decor SFX + ephemeral TopBar cue) |
| P2 | Combat hits / creature cues (if thin-slice combat ships) |
| P3 | Full music suite |

---

# Technical Notes

- Centralized audio bus (SFX / Music / UI / Ambient).
- Respect mute and per-bus volume from day one.
- Prefer small compressed assets; stream music if needed.

---

# Planned Documents

| Doc | Status |
| --- | --- |
| SFXCatalog.md | Planned |
| MusicBrief.md | Planned |

---

# Final Statement

Audio makes production and place feel real. Clarity beats spectacle for MVP.
