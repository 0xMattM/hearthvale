# Item System

**Document Version:** 0.1.0  
**Status:** Draft  
**Owner:** Game Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Item System defines every object that can exist within the game.

Everything that players can gather, craft, equip, consume, trade, store, or place is considered an Item.

A unified item system simplifies gameplay, balancing, backend development, and future content expansion.

---

# Vision

Items should feel like real economic assets.

Every item should have a purpose.

Every item should belong to one or more production chains.

Every item should have value because of its utility, not because it is artificially rare.

The game should avoid creating useless items.

---

# Design Goals

The Item System must:

- Support every gameplay system.
- Be easy to expand.
- Support thousands of future items.
- Keep item behavior consistent.
- Encourage trading.
- Integrate naturally with the player-driven economy.

---

# Functional Requirements

### ITEM-001

Every item has a unique identifier.

---

### ITEM-002

Every item belongs to exactly one primary category.

---

### ITEM-003

Every item has a display name.

---

### ITEM-004

Every item has an icon.

---

### ITEM-005

Every item defines whether it can be traded.

---

### ITEM-006

Every item defines whether it can be stacked.

---

### ITEM-007

Every item defines its maximum stack size.

---

### ITEM-008

Every item defines whether it can be consumed.

---

### ITEM-009

Every item defines whether it has durability.

---

### ITEM-010

Every item may define profession requirements.

---

# Item Categories

Items belong to one of the following categories.

## Natural Resources

Examples

- Wood Logs
- Stone
- Iron Ore
- Sand

---

## Agricultural Resources

Examples

- Wheat
- Corn
- Cotton
- Herbs

---

## Animal Products

Examples

- Leather
- Meat
- Milk
- Wool

---

## Monster Materials

Examples

- Claws
- Bones
- Horns
- Venom

---

## Processed Materials

Examples

- Iron Bars
- Wooden Planks
- Fabric
- Flour

---

## Tools

Examples

- Axe
- Pickaxe
- Hammer
- Fishing Rod
- Hoe

---

## Weapons

Examples

- Sword
- Bow
- Spear

---

## Armor

Examples

- Helmet
- Chestplate
- Gloves
- Boots

---

## Food

Examples

- Bread
- Soup
- Steak

---

## Consumables

Examples

- Potion
- Oil
- Medicine

---

## Seeds

Examples

- Wheat Seeds
- Corn Seeds
- Cotton Seeds

---

## Construction Components

Examples

- Fence
- Gate
- Storage Crate
- Workbench

---

## Decorative Items

Items with cosmetic purposes only.

---

# Common Item Properties

Every item should define the following information.

| Property | Description |
|-----------|-------------|
| ID | Unique identifier |
| Name | Display name |
| Description | Short description |
| Category | Item category |
| Icon | Inventory icon |
| Stackable | Yes / No |
| Max Stack | Maximum quantity |
| Tradable | Yes / No |
| Sellable | Yes / No |
| Droppable | Yes / No |
| Durability | Optional |
| Weight | Optional |
| Rarity | Optional |
| NFT | Yes / No |

---

# Stacking Rules

Most resources should be stackable.

Examples

✓ Stone

✓ Wood

✓ Wheat

✓ Iron Ore

Equipment should generally not stack.

Examples

✗ Sword

✗ Pickaxe

✗ Armor

---

# Durability

Only certain items use durability.

Examples

- Tools
- Weapons
- Armor

Resources should never have durability.

Food should never have durability.

Durability creates continuous demand for crafted equipment.

---

# Item Quality

The first version of the game uses one quality level.

Future versions may introduce:

- Common
- Fine
- Superior
- Masterwork

Quality should increase value without replacing progression.

---

# Item Lifecycle

Every item follows a lifecycle.

Creation

↓

Inventory

↓

Storage

↓

Marketplace

↓

Player Use

↓

Consumption or Durability Loss

↓

Removal from Economy

The objective is to keep items circulating.

---

# Item Ownership

Items may belong to:

- Player Inventory
- Land Storage
- Marketplace Listing
- Guild Storage
- Ground Loot (future)

Ownership should always be clearly defined.

---

# Tradability

Most items should be tradable.

Exceptions may include:

- Starter Tools
- Tutorial Items
- Quest Items (future)

Tradability strengthens the player economy.

---

# Item Metadata

Certain items may contain additional data.

Examples

Tool

- Durability
- Crafted By
- Repair Count

Weapon

- Durability
- Crafted By
- Cosmetic Skin

Land NFT

- Size
- Bonuses
- Biome

Metadata should remain lightweight whenever possible.

---

# Relationship with Resources

Resources are items.

Every resource follows the Item System.

The Resource System defines how resources are produced.

The Item System defines how they behave.

---

# Relationship with Crafting

Crafting consumes items.

Crafting produces items.

Every crafting recipe operates on the Item System.

---

# Relationship with Marketplace

Only tradable items may be listed.

Marketplace listings reference item instances rather than item definitions.

---

# Relationship with Blockchain

Only selected items become NFTs.

Version 1 only includes:

- Lands

Future versions may introduce:

- Cosmetic NFTs
- Collectibles
- Limited Edition Decorations

Gameplay items should remain off-chain unless there is a compelling gameplay reason.

---

# Anti Pay-to-Win

NFT status should never increase an item's combat power.

NFT ownership represents ownership and tradability.

Not gameplay superiority.

---

# Risks

## Risk

Too many item categories confuse players.

### Mitigation

Maintain clear naming.

Use consistent icons.

Introduce categories gradually.

---

## Risk

Thousands of nearly identical items.

### Mitigation

Every new item must justify its existence.

Avoid redundant resources.

---

## Risk

Item inflation.

### Mitigation

Ensure continuous item consumption through crafting, durability, food, and construction.

---

# Future Expansion Ideas

Potential additions include:

- Item enchantments.
- Cosmetic skins.
- Signed crafted items.
- Collection log.
- Item history.
- Museum system.
- Seasonal collectibles.

These systems should add depth without increasing unnecessary complexity.

---

# Open Questions

Should items have weight?

Should storage capacity be limited?

Should crafted items display their creator?

Should legendary crafted items become unique?

Should cosmetic skins be separate items?

These questions remain open.

---

# Final Statement

The Item System is the common language spoken by every gameplay system.

Resources, tools, weapons, food, construction components, and future content all inherit from the same foundation.

A robust Item System ensures consistency, scalability, and a healthy player-driven economy throughout the lifetime of the game.