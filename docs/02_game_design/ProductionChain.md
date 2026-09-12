# Production Chains

**Document Version:** 0.1.0
**Status:** Work in Progress
**Owner:** Game Design Team
**Last Updated:** July 30, 2026

---

# Purpose

This document defines every production chain in the game.

A production chain describes how resources enter the economy, how they are transformed by different professions, and how they are eventually consumed.

The objective is to ensure that every profession depends on others and every resource has multiple meaningful uses.

This document is the primary balancing reference for the game's economy.

---

# Design Principles

## Every Resource Must Have Multiple Uses

Resources should never exist for a single recipe.

Example:

Wood Logs should be used for:

- Planks
- Charcoal
- Tool Handles
- Furniture
- Construction
- Storage
- Fences

A resource with only one use is fragile and difficult to balance.

---

## Every Profession Must Be Connected

No profession should operate independently.

Every profession should both consume and produce resources required by others.

Example:

Farmer

↓

Produces Wheat

↓

Cook

↓

Produces Bread

↓

Players

↓

Recover Energy

↓

Continue Producing

---

## Every Production Chain Should Create Trade

Whenever possible, crafting should require materials from multiple professions.

Example:

Iron Sword

Requires:

- Iron Bars (Blacksmith)
- Wooden Handle (Carpenter)
- Leather Grip (Animal Breeder / Hunter)

This creates interaction between professions.

---

## Processing Adds Value

Raw materials should have lower value than processed materials.

Example:

Iron Ore

↓

Iron Bar

↓

Sword

↓

High Quality Sword

Each production step increases value through player effort.

---

## Consumption Is Mandatory

Every production chain must end with consumption.

Examples:

Food

↓

Consumed

Tool

↓

Durability Loss

Building

↓

Permanent Resource Sink

Without consumption, markets eventually collapse.

---

# Production Chain Categories

The economy is divided into several major production sectors.

---

# Agriculture

Produces:

- Crops
- Vegetables
- Cotton
- Herbs

Consumes:

- Seeds
- Water
- Energy

Supplies:

- Cooking
- Animal Husbandry
- Textile
- Alchemy

---

# Forestry

Produces:

- Logs
- Saplings
- Resin

Consumes:

- Energy

Supplies:

- Carpentry
- Construction
- Blacksmithing
- Furniture

---

# Mining

Produces:

- Stone
- Iron Ore
- Copper Ore
- Coal

Consumes:

- Pickaxe Durability
- Energy

Supplies:

- Furnace
- Blacksmith
- Construction

---

# Animal Husbandry

Produces:

- Meat
- Leather
- Wool
- Milk

Consumes:

- Animal Feed
- Water
- Energy

Supplies:

- Cooking
- Tailoring
- Blacksmith
- Furniture

---

# Hunting

Produces:

- Meat
- Leather
- Bones

Consumes:

- Weapons
- Armor
- Food
- Energy

Supplies:

- Cooking
- Crafting
- Marketplace

---

# Monster Hunting

Produces:

- Rare Materials
- Bones
- Horns
- Venom
- Monster Parts

Consumes:

- Equipment
- Food
- Potions

Supplies:

- High-Level Crafting

---

# Carpentry

Consumes:

- Logs
- Iron Parts
- Leather

Produces:

- Furniture
- Tool Handles
- Construction Parts

Supplies:

- Builders
- Blacksmiths
- Marketplace

---

# Blacksmithing

Consumes:

- Iron Bars
- Coal
- Wood Components
- Leather

Produces:

- Tools
- Weapons
- Construction Parts

Supplies:

- Every gathering profession

---

# Cooking

Consumes:

- Crops
- Meat
- Milk
- Herbs

Produces:

- Meals
- Bread
- Prepared Food

Supplies:

- Every player

---

# Textile

Consumes:

- Cotton
- Wool

Produces:

- Fabric
- Rope
- Clothing

Supplies:

- Tailoring
- Furniture
- Construction

---

# Alchemy

Consumes:

- Herbs
- Monster Materials

Produces:

- Potions
- Oils
- Future Consumables

Supplies:

- Combat
- Gathering

---

# Construction

Consumes:

- Wood
- Stone
- Iron
- Fabric

Produces:

- Production Structures
- Infrastructure
- Decorations

Consumes large amounts of materials permanently.

Construction is one of the largest resource sinks in the game.

---

# High-Level Resource Flow

Natural Resources

↓

Gathering Professions

↓

Processed Materials

↓

Crafting Professions

↓

Finished Goods

↓

Marketplace

↓

Players

↓

Consumption

↓

New Demand

---

# Core Dependencies

The following relationships should always exist.

Farmer

→ Cook

→ Players

---

Miner

→ Furnace

→ Blacksmith

→ Every Profession

---

Forester

→ Carpenter

→ Builder

→ Economy

---

Hunter

→ Cook

→ Leather

→ Blacksmith

---

Monster Hunter

→ Rare Materials

→ Advanced Crafting

---

Animal Breeder

→ Food

→ Leather

→ Textile

---

# Resource Sinks

Permanent resource sinks include:

- Construction
- Food
- Tool Durability
- Weapon Durability
- Armor Durability

Future additions may include:

- Transportation
- Territory Maintenance
- Guild Projects

---

# Chain Validation Rules

Every new production chain should answer:

Who gathers the resource?

Who processes it?

Who crafts it?

Who buys it?

How is it consumed?

What creates future demand?

If any answer is missing, the chain is incomplete.

---

# Future Expansion

Future production chains may include:

- Fishing
- Brewing
- Glassmaking
- Jewelry
- Engineering
- Transportation
- Shipbuilding

Each new profession should strengthen the existing economy instead of creating isolated gameplay.

---

# Final Statement

Production chains are the foundation of the game's economy.

The objective is not simply to transform resources into items, but to create continuous interaction between players.

A healthy production chain ensures that every profession has suppliers, customers, competitors, and meaningful opportunities within the player-driven marketplace.