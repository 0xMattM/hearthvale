# Energy System

**Document Version:** 0.1.0  
**Status:** Draft  
**Owner:** Game Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Energy System regulates how much productive work a player can perform over time.

Energy is one of the primary balancing mechanisms of the game.

It limits production without restricting player freedom.

Instead of preventing players from playing, the system encourages them to make meaningful decisions about how to spend their available time and energy.

---

# Design Goals

The Energy System must:

- Prevent infinite resource generation.
- Prevent economic inflation.
- Encourage planning.
- Create demand for food and consumables.
- Reward active players without requiring endless grinding.
- Keep the economy healthy over the long term.

---

# Core Philosophy

Energy limits **productive actions**, not gameplay.

A player with no energy should still be able to:

- Walk around the world.
- Visit lands.
- Trade.
- Chat.
- Organize storage.
- Buy and sell items.
- Manage buildings.
- Plan future production.

The player is never locked out of the game.

Only production slows down.

---

# Functional Requirements

### ENERGY-001

Every character has an Energy Pool.

---

### ENERGY-002

Energy is consumed only by productive actions.

---

### ENERGY-003

Energy regenerates automatically over time.

---

### ENERGY-004

The Energy Pool has a maximum capacity.

---

### ENERGY-005

Energy cannot become negative.

---

### ENERGY-006

Players may recover energy through gameplay systems.

Recovery methods will be defined in future documents.

---

### ENERGY-007

Energy costs are determined per activity.

Different actions consume different amounts.

---

# Energy Consumption

Examples:

| Activity | Energy Cost |
|----------|------------:|
| Harvest Crop | Low |
| Plant Crop | Low |
| Chop Tree | Medium |
| Mine Ore | Medium |
| Hunt Animal | Medium |
| Hunt Monster | High |
| Build Structure | High |
| Craft Sword | Medium |
| Cook Food | Low |

Exact values will be determined during balancing.

---

# Activities That Do NOT Consume Energy

The following actions should never require energy:

- Walking
- Exploring
- Trading
- Using the Marketplace
- Chatting
- Managing Inventory
- Visiting Lands
- Organizing Buildings
- Reading Crafting Recipes

The player should always have meaningful things to do.

---

# Regeneration

Energy regenerates continuously over time.

The regeneration rate should be predictable.

Players should always know:

- Current Energy
- Maximum Energy
- Recovery Rate
- Estimated Full Recovery Time

Hidden mechanics should be avoided.

---

# Increasing Maximum Energy

The maximum energy capacity may increase through future progression systems.

Possible examples include:

- Character Level
- Equipment
- Food Buffs
- Consumables
- Temporary Events

The exact progression system will be documented separately.

---

# Energy Recovery

Energy recovery should become an important part of the economy.

Future systems may include:

- Cooked Meals
- Drinks
- Rest Areas
- Inns
- Potions
- Festivals
- Guild Buffs

Food should become one of the primary energy recovery mechanics.

This creates demand for farmers, cooks, and merchants.

---

# Strategic Decisions

Energy is intentionally limited.

Players should constantly decide:

- Should I gather resources?
- Should I process materials?
- Should I craft equipment?
- Should I hunt monsters?
- Should I save energy for tomorrow?

There should never be a single optimal answer.

---

# Relationship with the Economy

Energy acts as a natural production limit.

Without energy:

Resources become infinite.

Prices collapse.

Production loses value.

Energy protects the long-term health of the economy.

---

# Relationship with Lands

Large lands do not eliminate energy limitations.

Owning more land creates more production opportunities.

Players still need enough energy to use those opportunities.

This prevents land ownership from becoming overpowered.

---

# Relationship with Professions

Every profession consumes energy.

Some professions may become:

- Fast but expensive.
- Slow but efficient.
- High energy / High reward.
- Low energy / Low reward.

Balancing these trade-offs creates meaningful choices.

---

# Relationship with Crafting

Crafting consumes energy because it represents productive work.

More complex recipes should generally require more effort.

However, crafting should remain more energy-efficient than repeatedly gathering raw materials.

---

# Relationship with Combat

Combat consumes energy.

Stronger monsters generally require more effort.

Higher risk should provide higher economic rewards.

---

# Relationship with Food

Food is not only a consumable.

Food becomes an energy resource.

The Cooking profession therefore becomes economically valuable even for players who never cook themselves.

---

# Balance Philosophy

Energy should never feel frustrating.

The player should think:

"I need to decide what is most valuable today."

Not:

"I can't play anymore."

The limitation should create strategy.

Not boredom.

---

# Anti-Exploitation

The Energy System helps reduce:

- Infinite farming
- Bot efficiency
- Economic inflation
- Excessive grinding
- Dominance by players with unlimited free time

It should never completely eliminate these behaviors, but it should reduce their economic advantage.

---

# Risks

## Risk

Energy feels like a mobile game timer.

### Mitigation

Ensure players always have meaningful non-energy activities.

---

## Risk

Players stop playing after spending all energy.

### Mitigation

Provide activities that do not require energy:

- Trading
- Exploration
- Social interaction
- Guild management
- Market analysis

---

## Risk

Energy recovery becomes Pay-to-Win.

### Mitigation

Energy recovery must always be obtainable through gameplay.

Premium options, if they ever exist, must never create an overwhelming competitive advantage.

---

## Risk

Food becomes irrelevant.

### Mitigation

Make food one of the primary methods of restoring energy.

---

# Future Expansion Ideas

Potential future systems include:

- Weather affecting energy consumption.
- Profession-specific efficiency bonuses.
- Mounts reducing travel fatigue.
- Rest bonuses.
- Guild feasts.
- Festivals.
- Seasonal buffs.
- Regional climate effects.

These systems should enhance the Energy System rather than replace it.

---

# Open Questions

Should energy regenerate while offline?

Should sleeping accelerate regeneration?

Should professions reduce energy costs at higher levels?

Should tools influence energy consumption?

Should different biomes affect energy usage?

These questions remain open for future design.

---

# Final Statement

The Energy System is not designed to stop players from playing.

It exists to protect the economy.

By limiting productive work instead of limiting gameplay, energy creates meaningful decisions, encourages specialization, supports multiple professions, and helps maintain a healthy player-driven economy over the lifetime of the game.