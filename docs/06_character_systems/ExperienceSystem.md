# Experience System

**Document Version:** 0.1.0  
**Status:** Work in Progress  
**Owner:** Game Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Experience System defines how players gain experience from their actions.

Experience represents learning, improvement, and participation in the world.

Every meaningful activity should contribute to player progression while maintaining economic balance.

---

# Design Philosophy

## Experience Represents Effort

Players gain experience by creating value.

Actions that contribute to the economy should generate progression.

---

## Two Experience Layers

The game uses two main experience systems:

```
Player Experience (XP)

+

Profession Experience (PX)
```

---

# Player Experience (XP)

Player XP represents general character progression.

It increases from almost every meaningful activity.

Examples:

- Mining.
- Farming.
- Crafting.
- Building.
- Combat.
- Trading.

---

# Profession Experience (PX)

Profession Experience represents specialization.

Each profession has its own experience.

Examples:

```
Mining XP

Farming XP

Blacksmith XP

Cooking XP

Hunting XP
```

---

# Experience Distribution

Every activity can provide both types of experience.

Example:

A player creates an Iron Sword.

Rewards:

```
Player XP

+

Blacksmith XP
```

---

A player defeats a monster.

Rewards:

```
Player XP

+

Combat XP

+

Monster Hunter XP
```

---

# Activity Experience Model

Each action calculates experience based on:

```
Base Experience

×

Difficulty Modifier

×

Time Modifier

×

Energy Cost Modifier

×

Quality Modifier
```

---

# Base Experience

Every activity has a base XP value.

Example:

Simple Action:

- Plant Crop

Low XP.

Complex Action:

- Craft Legendary Equipment

High XP.

---

# Difficulty Modifier

More difficult activities provide more experience.

Examples:

Easy:

Gathering basic wood.

Medium:

Mining iron.

Hard:

Defeating a boss.

---

# Time Modifier

Longer activities may provide additional experience.

However, time alone should not create infinite rewards.

---

# Energy Modifier

Actions consuming more energy generally provide more experience.

Energy represents player effort.

---

# Quality Modifier

Higher quality results may provide additional experience.

Example:

Normal Sword:

Standard XP.

Masterwork Sword:

Higher XP.

---

# Experience Sources

---

# Gathering Experience

Examples:

## Mining

Provides:

- Player XP
- Mining XP

---

## Farming

Provides:

- Player XP
- Farming XP

---

## Forestry

Provides:

- Player XP
- Forestry XP

---

# Crafting Experience

Crafting rewards both creation and specialization.

Examples:

Creating:

- Tools.
- Weapons.
- Furniture.
- Food.

Rewards:

- Player XP.
- Profession XP.

---

# Construction Experience

Building structures provides:

- Player XP.
- Builder XP.

Large projects provide more experience.

---

# Combat Experience

Combat rewards:

- Player XP.
- Combat XP.
- Monster Hunter XP.

Rewards depend on:

- Monster difficulty.
- Preparation required.
- Risk.

---

# Trading Experience

Future system.

Possible rewards:

- Merchant XP.
- Reputation.

Trading should reward economic contribution.

Not simple currency movement.

---

# Experience Caps

Some activities may have diminishing returns.

Purpose:

Prevent:

- Bot farming.
- Repetitive abuse.
- Economic imbalance.

---

# Example:

A player cuts thousands of trees.

First actions:

Normal XP.

After excessive repetition:

Reduced XP efficiency.

---

# Experience and Energy

Energy limits progression naturally.

A player cannot infinitely:

- Produce resources.
- Gain XP.
- Generate wealth.

---

# Experience and Economy

XP should never become the main source of value.

The economy remains based on:

- Production.
- Trading.
- Consumption.

Experience only represents progression.

---

# Anti-Exploit Rules

The system should prevent:

## Infinite Crafting Loops

Example:

Craft item.

Destroy item.

Craft again.

Gain infinite XP.

---

## Self Trading

Example:

Player A sells.

Player B buys.

Both gain rewards.

---

## Low Value Spam

Example:

Creating thousands of useless items.

---

# Experience Storage

Experience is stored as player progression data.

Required data:

```
Player ID

Total XP

Current Level

Profession XP

Profession Levels
```

---

# Experience Feedback

Players should clearly understand:

- What action gave XP.
- How much XP was earned.
- Progress toward next level.

---

# Future Expansion

Possible additions:

- Experience bonuses.
- Guild bonuses.
- Events.
- Learning systems.
- Mentorship.

---

# Balance Rules

Experience should:

- Reward meaningful gameplay.
- Support specialization.
- Encourage exploration.
- Avoid grinding.
- Respect economic balance.

---

# Final Statement

The Experience System transforms player actions into long-term progression.

A successful system ensures that every meaningful activity feels rewarding while maintaining a healthy economy where value comes from production and interaction rather than repetitive farming.