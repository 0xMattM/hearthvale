# Recipe Catalog

**Document Version:** 0.1.0  
**Status:** Work in Progress  
**Owner:** Content Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Recipe Catalog defines all crafting recipes available in the game world.

The objective is to create a structured system for:

- Item creation.
- Crafting professions.
- Resource consumption.
- Economic loops.
- Player specialization.
- Rare item production.

---

# Recipe Philosophy

## Recipes Transform Resources Into Value

Every recipe should define:

```
Input Resources

+

Crafting Process

+

Required Skill

+

Output Item

+

Economic Value
```

---

# Recipe Categories

The system includes:

```
Equipment Recipes

+

Consumable Recipes

+

Material Processing Recipes

+

Building Recipes

+

Alchemy Recipes

+

Legendary Recipes
```

---

# Recipe Data Structure

Every recipe contains:

```
Recipe ID

Name

Category

Required Profession

Materials

Requirements

Crafting Time

Output

Rarity

Metadata
```

---

# Recipe ID

Unique identifier.

Examples:

```
RECIPE_SWORD_IRON_001

RECIPE_POTION_HEALING_001
```

---

# Equipment Recipes

Used to create:

```
Weapons

Armor

Accessories
```

---

# Weapon Recipes

Examples:

```
Iron Sword Recipe

Hunter Bow Recipe

Ancient Blade Recipe
```

---

# Armor Recipes

Examples:

```
Leather Armor Recipe

Knight Plate Recipe

Dragon Armor Recipe
```

---

# Consumable Recipes

Used to create:

```
Potions

Food

Temporary Buffs
```

---

# Potion Recipes

Examples:

```
Healing Potion

Mana Potion

Fire Resistance Potion
```

---

# Food Recipes

Examples:

```
Traveler Meal

Combat Food

Special Dish
```

---

# Material Processing Recipes

Transform raw materials.

Example:

```
Iron Ore

↓

Iron Bar
```

---

# Processing Categories

Examples:

```
Metal Processing

Wood Processing

Magic Processing

Alchemy Processing
```

---

# Building Recipes

Used for:

```
Structures

Furniture

Decorations

Modules
```

---

# Alchemy Recipes

Create magical items.

Examples:

```
Elemental Essence

Magic Potion

Special Enhancement
```

---

# Legendary Recipes

Extremely rare recipes.

Characteristics:

```
Limited Discovery

Unique Output

High Requirements
```

---

# Recipe Requirements

Recipes may require:

```
Level

Profession Skill

Blueprint

Materials

Location

Equipment
```

---

# Profession Integration

Recipes connect with:

```
Blacksmith

Carpenter

Alchemy

Tailor

Chef

Engineer
```

---

# Blacksmith Recipes

Creates:

```
Weapons

Armor

Metal Components
```

---

# Carpenter Recipes

Creates:

```
Wood Items

Furniture

Buildings
```

---

# Alchemy Recipes

Creates:

```
Potions

Magical Components

Enhancements
```

---

# Tailoring Recipes

Creates:

```
Clothing

Light Armor

Accessories
```

---

# Cooking Recipes

Creates:

```
Food

Buff Items

Special Meals
```

---

# Recipe Rarity

Recipes have rarity:

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

# Common Recipes

Available from:

- NPCs.
- Tutorials.
- Basic progression.

Examples:

```
Basic Potion

Iron Tool
```

---

# Rare Recipes

Obtained through:

```
Exploration

Dungeons

Quests

Bosses
```

---

# Legendary Recipes

Obtained through:

```
Ancient Discoveries

World Events

Legendary Bosses
```

---

# Recipe Discovery

Players discover recipes through:

```
NPC Teachers

Loot

Exploration

Experimentation

Achievements
```

---

# Crafting Experimentation

Future system:

Players combine materials to discover unknown recipes.

Example:

```
Rare Crystal

+

Ancient Metal

↓

Unknown Result
```

---

# Recipe Quality

Crafted items depend on:

```
Materials

+

Crafter Skill

+

Tools

+

Environment
```

---

# Crafting Time

Recipes define:

```
Instant

Short

Medium

Long

Advanced
```

---

# Crafting Stations

Some recipes require stations:

```
Forge

Workbench

Alchemy Table

Kitchen

Laboratory
```

---

# Recipe Costs

Every recipe defines:

```
Resource Cost

Currency Cost

Time Cost
```

---

# Recipe Economy

Recipes create economic roles:

```
Gatherers

↓

Material Producers

↓

Crafters

↓

Traders

↓

Consumers
```

---

# Recipe Trading

Possible systems:

```
Recipe Learning

Recipe Scrolls

Recipe Market
```

---

# Recipe Ownership

Possible states:

```
Public Recipe

Learned Recipe

Rare Recipe

Unique Recipe
```

---

# Unique Recipes

Special recipes may belong to:

```
Players

Guilds

Factions

Historical Events
```

---

# NFT Integration

Possible uses:

```
Unique Recipe Scrolls

Legendary Crafting Blueprints

Historical Recipes
```

---

# Recipe Metadata

Possible metadata:

```
Creator

Discovery Date

First Crafter

Crafting History
```

---

# Anti Exploit Systems

Prevent:

- Recipe duplication.
- Infinite production.
- Economic imbalance.

---

# Analytics

Track:

```
Recipe Usage

Production Volume

Market Demand

Resource Consumption
```

---

# Database Structure

Example:

```
Recipe

{
 id,
 category,
 profession,
 materials,
 requirements,
 output,
 rarity,
 metadata
}
```

---

# Technical Requirements

The system requires:

- Crafting engine.
- Inventory system.
- Resource system.
- Economy tracking.

---

# Future Expansion

Possible additions:

- Player-created recipes.
- Dynamic crafting.
- AI-assisted discoveries.
- Legendary crafting systems.

---

# Final Statement

The Recipe Catalog defines how players transform resources into meaningful creations.

A strong recipe system creates professions, economic specialization, and long-term player progression.