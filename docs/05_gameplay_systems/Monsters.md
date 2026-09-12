# Monsters

**Document Version:** 0.1.0  
**Status:** Work in Progress  
**Owner:** Gameplay Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Monster System defines the creatures that inhabit the game world.

The objective is to create a living ecosystem where monsters provide:

- Exploration challenges.
- Combat opportunities.
- Resource sources.
- World events.

---

# Design Philosophy

## Monsters Are Part Of The World

Monsters should not feel like simple enemies that exist only to be defeated.

They should:

- Occupy territories.
- Interact with environments.
- Create risks and opportunities.

---

# Monster Categories

The world contains different types of creatures.

```
Wild Creatures

+

Hostile Monsters

+

Elite Monsters

+

Boss Creatures
```

---

# Wild Creatures

Neutral creatures that exist in the environment.

Examples:

- Deer.
- Birds.
- Small animals.

Purpose:

- World immersion.
- Resources.
- Exploration.

---

# Hostile Monsters

Aggressive creatures that attack players.

Examples:

- Wolves.
- Goblins.
- Corrupted creatures.

Purpose:

- Combat.
- Rewards.
- Challenges.

---

# Elite Monsters

Stronger versions of normal creatures.

Characteristics:

- More health.
- Better rewards.
- Unique abilities.

---

# Boss Creatures

Rare world threats.

Characteristics:

- High difficulty.
- Special mechanics.
- Unique rewards.

---

# Monster Ecosystems

Each region has specific creatures.

Example:

```
Forest Region

↓

Wolves

Forest Spirits

Giant Insects
```

---

```
Mountain Region

↓

Stone Creatures

Giants

Ancient Beasts
```

---

# Monster Attributes

Each monster has:

```
Health

Attack

Defense

Speed

Resistance

Level
```

---

# Monster Behavior

Monsters should have different behaviors.

Examples:

- Passive.
- Aggressive.
- Territorial.
- Hunting.
- Fleeing.

---

# AI Behavior System

Monster AI controls:

- Movement.
- Target selection.
- Combat decisions.
- Reactions.

---

# Behavior States

Example:

```
Idle

↓

Detect Player

↓

Chase

↓

Attack

↓

Return
```

---

# Monster Spawn System

Monsters appear based on:

- Region.
- Time.
- Events.
- Player activity.

---

# Spawn Rules

Example:

```
Forest Area

+

Night Time

+

Low Player Activity

=

Higher Monster Spawn
```

---

# Dynamic Ecosystem

The world can change over time.

Example:

```
Too Many Monsters

↓

Players Hunt Them

↓

Population Decreases

↓

Regeneration Period
```

---

# Monster Levels

Monster difficulty depends on:

- Region.
- Player progression.
- World state.

---

# Scaling Rules

Avoid creating enemies that simply increase numbers.

Difficulty should include:

- New abilities.
- Better strategies.
- Different behaviors.

---

# Monster Drops

Monsters provide rewards.

Possible drops:

```
Materials

Items

Equipment

Crafting Components

Rare Objects
```

---

# Drop Philosophy

Rewards should support the economy.

Example:

```
Monster Defeat

↓

Rare Material

↓

Crafting Component

↓

Player Trade
```

---

# Rare Drops

Rare creatures may provide:

- Unique materials.
- Cosmetic items.
- Special crafting resources.

---

# Boss Rewards

Bosses can provide:

- Legendary materials.
- Achievements.
- Special items.

---

# Monster Interaction With Economy

Monsters create economic opportunities.

Example:

```
Hunter

↓

Collects Monster Materials

↓

Crafts Items

↓

Sells To Players
```

---

# Monster Hunting Profession

Future profession:

```
Hunter
```

Benefits:

- Better tracking.
- Increased drops.
- Special tools.

---

# Monster Territories

Certain areas may become dangerous.

Example:

```
Corrupted Forest

↓

High Monster Activity

↓

Rare Resources
```

---

# World Events

Monsters can participate in events.

Examples:

- Monster invasion.
- Ancient boss awakening.
- Seasonal creatures.

---

# Multiplayer Monster System

Monsters are server-controlled.

The server manages:

- Spawn.
- Position.
- Health.
- Rewards.

---

# Anti Exploit Rules

Prevent:

- Infinite farming.
- Automated killing.
- Reward duplication.

---

# Blockchain Integration

Possible future assets:

- Rare monster trophies.
- Cosmetic collectibles.
- Unique achievements.

Combat rewards remain off-chain.

---

# Monster Progression

Future systems:

- Monster evolution.
- Regional mutations.
- Player-created ecosystems.

---

# Three.js Integration

The client handles:

- Monster models.
- Animations.
- Effects.
- Visual behavior.

The server controls:

- Logic.
- Combat.
- Rewards.

---

# Future Expansion

Possible additions:

- Monster breeding.
- Capturing systems.
- Monster companions.
- Large-scale raids.

---

# Final Statement

The Monster System creates a living ecosystem that connects exploration, combat, economy, and world progression.

Monsters are not only enemies; they are an essential part of the world's balance and economy.