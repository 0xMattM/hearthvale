# Item Catalog

**Document Version:** 0.1.0  
**Status:** Work in Progress  
**Owner:** Content Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Item Catalog defines all item types available in the game world.

The objective is to create a standardized structure for:

- Inventory systems.
- Trading.
- Crafting.
- Loot generation.
- Economy balancing.
- Blockchain asset integration.

---

# Item Philosophy

## Every Item Should Have A Purpose

Items should contribute to:

```
Gameplay

+

Progression

+

Economy

+

Player Identity
```

---

# Item Categories

The game contains multiple item categories.

```
Resources

+

Equipment

+

Consumables

+

Crafting Materials

+

Quest Items

+

Collectibles

+

Special Assets
```

---

# Item Data Structure

Every item contains:

```
Item ID

Name

Description

Category

Rarity

Stack Rules

Value

Properties

Metadata
```

---

# Item ID

Unique identifier.

Example:

```
ITEM_WOOD_BASIC_001

ITEM_SWORD_IRON_001
```

---

# Item Name

The visible name shown to players.

Examples:

```
Iron Sword

Ancient Crystal

Healing Potion
```

---

# Item Description

Provides:

- Lore.
- Usage information.
- Flavor text.

---

# Item Category

Defines the item behavior.

Examples:

```
Weapon

Armor

Resource

Consumable

Material
```

---

# Item Rarity

Items have rarity levels.

```
Common

↓

Uncommon

↓

Rare

↓

Epic

↓

Legendary

↓

Mythic
```

---

# Rarity Impact

Higher rarity may affect:

- Stats.
- Appearance.
- Market value.
- Availability.

---

# Item Quality

Some items have quality values.

Example:

```
Poor

Normal

Good

Excellent

Masterwork
```

---

# Stack Rules

Defines if items can stack.

Examples:

```
Wood x999

Potion x50

Legendary Sword x1
```

---

# Item Value

Defines economic information.

Includes:

```
Base Price

Market Reference

Trade Restrictions
```

---

# Item Properties

Properties depend on category.

Examples:

Weapon:

```
Damage

Speed

Durability
```

Resource:

```
Material Type

Usage

Processing Level
```

---

# Equipment Items

Equipment includes:

```
Weapons

Armor

Accessories
```

---

# Consumable Items

Examples:

```
Potions

Food

Temporary Boosts
```

---

# Resource Items

Examples:

```
Wood

Ore

Herbs

Crystals
```

---

# Crafting Materials

Used to create other items.

Examples:

```
Metal Components

Magic Essences

Processed Materials
```

---

# Quest Items

Special objects connected to missions.

Examples:

```
Ancient Artifact

Secret Document

Quest Key
```

---

# Collectibles

Items focused on collection.

Examples:

```
Trophies

Decorations

Rare Finds
```

---

# Special Assets

Potential blockchain-connected items.

Examples:

```
Unique Weapons

Legendary Artifacts

Limited Collectibles
```

---

# Item Binding

Some items may have restrictions.

Types:

```
Tradeable

Account Bound

Character Bound

Soul Bound
```

---

# Durability System

Some items may degrade.

Affected by:

- Usage.
- Combat.
- Time.

---

# Item Repair

Durability can be restored through:

```
Resources

+

Currency

+

Crafting Services
```

---

# Item Enhancement

Items can be improved.

Possible upgrades:

```
Level

Stats

Abilities

Appearance
```

---

# Item Evolution

Advanced items may evolve.

Example:

```
Ancient Sword

↓

Awakened Sword

↓

Legendary Weapon
```

---

# Item Sources

Items can be obtained from:

```
Gathering

Crafting

Quests

Bosses

Dungeons

Events

Trading
```

---

# Item Economy Role

Each item should have:

```
Creation Source

+

Consumption Method

+

Market Value
```

---

# Item Sinks

Items may be consumed through:

- Crafting.
- Upgrades.
- Repairs.
- Special activities.

---

# Loot Integration

Items connect with:

```
Dungeon Loot Tables

Boss Rewards

Event Rewards
```

---

# NFT Item Rules

Not every item should become an NFT.

NFT candidates:

```
Unique Items

Limited Items

Player-Created Legendary Items
```

---

# NFT Metadata

Possible metadata:

```
Item Name

Origin

Creator

History

Attributes
```

---

# Item Database Structure

Example:

```
Item

{
 id,
 name,
 category,
 rarity,
 properties,
 value,
 metadata
}
```

---

# Content Validation

Before adding an item:

Check:

```
Balance

Economic Impact

Usefulness

Rarity

Availability
```

---

# Item Naming Rules

Names should:

- Match world theme.
- Avoid duplicates.
- Communicate identity.

---

# Analytics

Track:

```
Item Creation

Item Usage

Market Price

Player Demand
```

---

# Technical Requirements

The system requires:

- Item database.
- Inventory integration.
- Trading integration.
- Loot generation.

---

# Future Expansion

Possible additions:

- Procedural item generation.
- Player-created items.
- Dynamic item histories.
- AI-assisted balancing.

---

# Final Statement

The Item Catalog provides the foundation for all objects in the game.

A well-designed item system creates meaningful progression, a healthy economy, and memorable player experiences.