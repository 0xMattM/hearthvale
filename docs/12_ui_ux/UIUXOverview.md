# UI And UX Overview

**Document Version:** 1.1.0  
**Status:** Active  
**Owner:** Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

Interface principles for an MMO-style client: **move a character, approach content, open one surface at a time**.

Canonical presentation rules also live in [MVPContentLock.md](../19_development_plan/MVPContentLock.md) § Client Presentation.

---

# UX Pillars

1. **Presence first** — the land view with your avatar is the main screen.
2. **Move then interact** — First 5 minutes teach movement (EarlyGameExperience).
3. **One job per panel** — Inventory, Craft, Trade, Vendor are separate surfaces.
4. **Proximity gates production UI** — Craft only at Mill/Forge; vendor only at stall; fields via E in range.
5. **Minimal HUD** — energy, coins, shortcuts. No craft/buy mega-menu permanently open.
6. **Blockchain invisible** — no wallet in core loops.

---

# Controls (MVP)

| Input | Action |
| --- | --- |
| WASD / Arrows | Move avatar |
| E | Interact with nearest building in range |
| I | Toggle Inventory |
| T | Toggle Trade |
| Esc | Close active panel |

---

# Primary Surfaces

| Surface | How it opens | Job |
| --- | --- | --- |
| World | Always | Avatar + buildings |
| Prompt | Near interactable | “E · Mill” |
| Inventory | I | Mats, tools, equip, eat bread |
| Craft | E at Mill/Forge | Station recipes only |
| Vendor | E at Vendor Stall | Tutorial buy/sell |
| Trade | T | P2P offers |
| Expand | E at empty expansion pad | Spend coins/mats for slot 6–7 |

---

# HUD Minimum

- Energy bar  
- Coins  
- Farmer / Blacksmith XP (compact)  
- Key hints: I Inventory · T Trade  

No stacked vendor+craft+trade columns over the world.

---

# Final Statement

If the player can craft without walking to a station, the client is wrong.
