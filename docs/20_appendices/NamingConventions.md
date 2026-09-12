# Naming Conventions

**Document Version:** 1.0.0  
**Status:** Active  
**Owner:** Technical Director & Creative Director  
**Last Updated:** July 30, 2026

---

# Purpose

The Naming Conventions document establishes consistent naming rules across every discipline involved in the project.

Consistent naming improves:

- Readability
- Searchability
- Collaboration
- Automation
- Maintainability

Every contributor should follow these conventions.

---

# General Principles

Names should be:

- Descriptive.
- Concise.
- Consistent.
- Unambiguous.
- Written in English.

Avoid:

- Abbreviations without documentation.
- Temporary names.
- Personal naming styles.
- Version numbers inside file names.

---

# Programming

## Classes

Use:

```
PascalCase
```

Examples

```
InventoryManager

PlayerController

QuestSystem

MarketplaceService
```

---

## Interfaces

Use:

```
IInventoryService

ICombatSystem

IPlayerRepository
```

---

## Methods

Use:

```
PascalCase
```

Examples

```
CreateCharacter()

CalculateDamage()

LoadInventory()
```

---

## Properties

Use:

```
PascalCase
```

Examples

```
PlayerLevel

MaximumHealth

CurrentExperience
```

---

## Local Variables

Use:

```
camelCase
```

Examples

```
currentPlayer

itemCount

damageValue
```

---

## Private Fields

Use:

```
_camelCase
```

Examples

```
_currentHealth

_inventory

_database
```

---

## Constants

Use:

```
PascalCase
```

Examples

```
MaximumLevel

DefaultHealth

MaxInventorySize
```

---

## Enums

Use singular nouns.

Examples

```
CharacterClass

ItemType

QuestState

WeaponCategory
```

---

# Namespaces

Structure:

```
Company.Project.Feature
```

Example

```
LandNFT.Game.Inventory
```

---

# Folder Structure

Folders use:

```
PascalCase
```

Example

```
Characters/

Inventory/

Marketplace/

UI/

Audio/
```

---

# File Naming

One public class per file.

File name equals class name.

Example

```
InventoryService.cs

PlayerController.cs
```

---

# Asset Naming

General structure:

```
Category_Description_Variant
```

Examples

```
Character_Knight_01

Weapon_Sword_Iron

Tree_Oak_Large

Rock_Granite_02
```

---

# Texture Naming

Examples

```
T_StoneWall

T_PlayerArmor

T_Grass01
```

---

# Material Naming

Examples

```
M_Leather

M_Wood

M_Metal
```

---

# Prefab Naming

Examples

```
PF_Player

PF_Goblin

PF_Marketplace

PF_Tree
```

---

# Animation Naming

Examples

```
AN_Player_Run

AN_Player_Attack

AN_Wolf_Bite
```

---

# Audio Naming

Music

```
MU_MainTheme

MU_Town

MU_Battle
```

Sound Effects

```
SFX_Footstep_Stone

SFX_SwordHit

SFX_ButtonClick
```

Voice

```
VO_Merchant_Greeting

VO_Guard_Warning
```

---

# UI Assets

Examples

```
UI_Button_Primary

UI_InventoryPanel

UI_HealthBar
```

---

# Icons

Examples

```
ICO_Sword

ICO_Gold

ICO_Quest
```

---

# Database

Tables

```
Players

Characters

Inventories

Items

Guilds
```

---

## Columns

Use:

```
PascalCase
```

Examples

```
PlayerId

CreatedAt

Experience

LastLogin
```

---

## Primary Keys

Format

```
<Entity>Id
```

Examples

```
PlayerId

ItemId

GuildId
```

---

# API Endpoints

REST endpoints use:

```
lowercase

kebab-case
```

Examples

```
/players

/inventory

/marketplace

/world-events
```

---

# JSON Properties

Use:

```
camelCase
```

Example

```json
{
  "playerId": "",
  "inventoryId": "",
  "currentLevel": 10
}
```

---

# Smart Contracts

Contract names

```
LandNFT

Marketplace

QuestRewards

PlayerInventory
```

---

## Solidity Files

```
LandNFT.sol

Marketplace.sol

TokenVault.sol
```

---

# Events

Past tense.

Examples

```
ItemPurchased

QuestCompleted

CharacterCreated

LandTransferred
```

---

# Functions

Verb-first naming.

Examples

```
Mint()

Transfer()

Withdraw()

Purchase()
```

---

# Branch Naming

```
feature/player-inventory

feature/combat

bugfix/shop-ui

hotfix/login

release/v1.2.0
```

---

# Documentation Files

Use:

```
PascalCase.md
```

Examples

```
CombatSystem.md

Marketplace.md

Architecture.md
```

---

# Images

Examples

```
combat-flow.png

inventory-ui.png

economy-diagram.svg
```

---

# Diagram Files

Examples

```
BackendArchitecture.drawio

CombatSequence.drawio

MarketplaceFlow.drawio
```

---

# Configuration Files

Examples

```
appsettings.json

docker-compose.yml

.env.example
```

---

# Version Naming

Examples

```
v0.1.0

v0.9.5

v1.0.0

v2.0.0
```

Semantic Versioning should be followed.

---

# Reserved Words

Avoid names such as:

```
Data

Manager

Helper

Utils

Misc

Temp

New

Test
```

unless they clearly describe their responsibility.

---

# Naming Review

During code reviews verify:

- Consistency.
- Clarity.
- Domain terminology.
- English spelling.
- Compliance with this document.

---

# Updating Conventions

Changes require approval from:

- Technical Director.
- Creative Director.

Existing assets should not be renamed without evaluating migration costs.

---

# Final Statement

Consistent naming reduces confusion, improves productivity, and enables the project to scale across large teams without sacrificing clarity.

Every name should communicate intent clearly and remain understandable years after it was created.