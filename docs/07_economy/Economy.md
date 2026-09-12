# Economy

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Game Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Economy System defines how value is created, exchanged, consumed, and preserved.

This game relies on a **player-driven economy**. Developers provide systems; players create the market.

Every major gameplay system should either produce, transform, consume, or exchange value.

---

# Vision

The economy should feel alive.

Players influence prices, decide what is worth producing, create shortages, and solve them.

The game should feel less like a scripted experience and more like a real economy.

---

# Design Goals

- Encourage player interaction and specialization.
- Support long production chains.
- Allow prices to emerge naturally.
- Minimize developer price-setting.
- Create continuous demand and healthy sinks.
- Prevent uncontrolled inflation and locked scarcity.
- Support long-term progression for new and veteran players.

---

# Functional Requirements

| ID | Requirement |
| --- | --- |
| ECO-001 | Almost every tradable item originates from player activity. |
| ECO-002 | Every valuable item has one or more consumers. |
| ECO-003 | Resources continuously enter and leave the economy. |
| ECO-004 | Players determine market prices. |
| ECO-005 | Developers avoid artificial prices whenever possible. |
| ECO-006 | Every profession participates in at least one production chain. |
| ECO-007 | Every gameplay system produces, transforms, consumes, or exchanges value. |

---

# Core Economic Loop

```
Resource Generation
        ↓
Resource Processing
        ↓
Crafting
        ↓
Marketplace
        ↓
Player Usage / Consumption
        ↓
New Demand
```

Value increases through transformation (time, energy, profession skill, land, risk, and demand)—not rarity alone.

---

# Economic Participants And Roles

Players naturally become producers, manufacturers, traders, and consumers. Most will combine roles over time.

| Role | Focus | Examples |
| --- | --- | --- |
| Gatherer | Collection, exploration, rare mats | Miner, Farmer, Hunter, Herbalist |
| Producer / Crafter | Processing and finished goods | Blacksmith, Builder, Cook, Tailor |
| Explorer | Discovery, rare locations | Regional scouts |
| Fighter | Risky materials via combat | Monster Hunter |
| Trader | Price discovery, logistics | Merchants |
| Land Owner | Infrastructure and production space | Starter + NFT lands |
| Guild | Shared goals, warehouses, territory | Collective economy |

Specialization creates dependency. Dependency creates trade.

---

# Supply And Demand

**Supply** depends on player decisions (who mines, farms, crafts). Overproduction lowers prices; players switch; supply recovers.

**Demand** comes from gameplay needs: craft equipment, build, cook, repair, expand, prepare for combat—not from artificial NPC buybacks.

---

# Faucets And Sinks

## Faucets (value enters)

- Gathering and farming
- Crafting outputs
- Combat / monster materials
- Events and achievements (limited)
- Soft currency from gameplay

## Sinks (value leaves)

- Crafting and construction costs
- Food and consumable use
- Tool / equipment durability and repair
- Marketplace fees (if introduced)
- Building maintenance
- Future taxes only if justified by Open Questions

Without sinks, inflation is inevitable. Without accessible faucets, new players stall.

---

# Production Limits

Capacity is gated by multiple factors so no single mechanic dominates:

- Energy
- Land space
- Profession level
- Time
- Tools

Every decision has opportunity cost (land used for crops cannot grow trees; energy spent mining is not spent hunting).

---

# Market Self-Balancing

```
High Profit → More Players Enter → Supply Up → Prices Fall
→ Players Leave → Supply Down → Prices Recover
```

Player behavior is the primary balance lever. Developers monitor analytics and adjust rewards/costs only when systems fail.

---

# Currency Model

## Soft Currency

Earned through gameplay. Used for NPC services, repairs, basic purchases, and optional taxes.

## Blockchain Token

Used for premium trading, NFT transactions, high-value exchanges, and possible future governance.

The token complements the economy; it must not replace soft-currency gameplay loops.

Details: [CurrencySystem.md](CurrencySystem.md), [Tokenomics.md](Tokenomics.md), [../10_blockchain/TokenEconomy.md](../10_blockchain/TokenEconomy.md).

---

# Economic Assets

- Soft currency and tokens
- Resources and processed materials
- Crafted items and equipment
- Land (starter + NFT)
- Services and digital ownership records

NFT / land rules: ownership and production opportunity—never direct combat power. See Vision and Lands docs.

---

# NPC Participation

NPCs may provide tutorials, starter tools, basic services, and information.

NPCs must **never** be the primary buyers or sellers of resources.

---

# System Relationships

| System | Relationship |
| --- | --- |
| Lands | Cap production space and bonuses; opportunity, not guaranteed profit |
| Professions | Primary producers; each feeds another profession or player need |
| Crafting | Turns raw materials into higher-value goods |
| Marketplace | Price discovery; players set prices |
| Combat | Introduces exclusive materials; must not dominate wealth |
| Guilds | Shared logistics and territorial bonuses (post-MVP) |

Related: [Marketplace.md](Marketplace.md), [TradingSystem.md](TradingSystem.md), [LandEconomy.md](LandEconomy.md), [CraftingEconomy.md](CraftingEconomy.md), [EconomicBlueprint.md](../02_game_design/EconomicBlueprint.md).

---

# Anti Pay-To-Win

Success depends on planning, market knowledge, production efficiency, and profession progression.

NFT land expands opportunity. Poor decisions on a large land should underperform smart play on a Starter Land.

---

# Monitoring And Adjustments

Track: currency supply, item prices, trading volume, resource consumption, player wealth distribution.

Adjust via data + community feedback. Prefer sink/faucet tuning over hard price floors.

---

# Risks And Mitigations

| Risk | Mitigation |
| --- | --- |
| One profession dominates | Multiple interdependent chains |
| Market manipulation | Broad supply, transparent market, competition |
| Inflation | Energy, sinks, durability, construction |
| Stagnation | New recipes, professions, regions, seasonal sinks |
| Wealth lockout | Starter land always viable; regenerating basics |

---

# Future Expansion (Post-MVP)

Regional markets, caravans, shipping, guild warehouses, contracts, public works, seasonal events, dynamic discoveries.

These must strengthen the existing loop—not replace it.

---

# Open Questions

Tracked in [OpenQuestions.md](../20_appendices/OpenQuestions.md): transportation, regional prices, guild influence, taxes, extra token utility.

---

# Final Statement

The economy is the foundation of the game. Professions, lands, recipes, combat rewards, and marketplace trades exist to support a living, player-driven market.

Success is meaningful interaction through production, trade, specialization, and cooperation—not scripted wealth.
