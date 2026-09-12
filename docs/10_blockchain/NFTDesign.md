# NFT Design

**Document Version:** 0.1.0  
**Status:** Work in Progress  
**Owner:** Blockchain Team  
**Last Updated:** July 30, 2026

---

# Purpose

The NFT Design System defines which game assets become NFTs, how they are structured, and how they interact with the game economy.

The objective is to create meaningful digital ownership without turning every gameplay element into a blockchain asset.

---

# Design Philosophy

## Valuable Ownership Over Excessive Tokenization

Not everything in the game should be an NFT.

NFTs should represent:

- Long-term ownership.
- Scarce assets.
- Player identity.
- Tradeable value.

---

# NFT Categories

The initial game version contains:

```
Land NFTs

+

Future Special NFTs
```

---

# Land NFTs

Land NFTs are the main blockchain assets.

They represent ownership of production areas.

---

# Land NFT Properties

Each land NFT contains:

```
Land ID

+

Location

+

Size

+

Base Attributes

+

Rarity

+

Ownership History
```

---

# Land Metadata

Example:

```json
{
  "name": "Forest Valley Land #00125",
  "type": "Land",
  "size": "Large",
  "region": "Forest",
  "bonus": {
    "woodProduction": "+10%"
  }
}
```

---

# Land Size

Land size determines available space.

Possible values:

```
Small

Medium

Large

Extra Large
```

---

# Small Land

Characteristics:

- Entry level.
- Limited production.
- Lower value.

Purpose:

Allow new players to participate.

---

# Medium Land

Characteristics:

- More production options.
- Better customization.

Purpose:

Growing players.

---

# Large Land

Characteristics:

- Multiple production chains.
- Higher economic potential.

Purpose:

Advanced players.

---

# Extra Large Land

Characteristics:

- Major economic centers.
- Large development capacity.

Purpose:

Organizations and advanced players.

---

# Land Regions

Land location creates diversity.

Examples:

---

## Forest Region

Possible bonuses:

- Wood production.
- Forestry activities.

---

## Mountain Region

Possible bonuses:

- Mining.
- Mineral resources.

---

## Fertile Region

Possible bonuses:

- Farming.
- Animal production.

---

# Land Bonuses

Bonuses should influence specialization.

They should not create absolute advantages.

Example:

Good:

```
+10% Wood Production
```

Bad:

```
Only this land can produce wood
```

---

# Land Rarity

Possible rarity system:

```
Common

Uncommon

Rare

Epic

Legendary
```

---

# Rarity Philosophy

Rarity should represent:

- Interesting characteristics.
- Unique combinations.
- Historical value.

Not:

- Impossible economic advantages.

---

# Example Rare Land

A rare mountain land:

Attributes:

```
Large Size

+

Mountain Region

+

Mining Bonus

+

Rare Location
```

---

# NFT Transferability

Players can:

- Buy lands.
- Sell lands.
- Transfer ownership.

---

# Ownership History

Each land maintains history.

Examples:

- Previous owners.
- Creation date.
- Important events.

This creates long-term value.

---

# NFT Marketplace

Players can trade:

- Lands.
- Future NFT assets.

---

# Marketplace Requirements

The system should support:

- Listings.
- Purchases.
- Ownership verification.

---

# Future NFT Assets

Possible future additions:

---

# Cosmetic NFTs

Examples:

- Unique outfits.
- Decorations.
- Visual effects.

---

# Historical NFTs

Examples:

- First world achievements.
- Event rewards.
- Legendary discoveries.

---

# Special Buildings

Possible future option:

Unique cosmetic buildings.

---

# What Should NOT Be NFTs

The following remain off-chain:

```
Normal Resources

+

Experience

+

Energy

+

Profession Levels

+

Normal Items

+

Crafting Results
```

---

# Reasons

These systems require:

- Frequent updates.
- Balance changes.
- Fast interactions.

---

# NFT Security

The system must prevent:

- Duplicate assets.
- Invalid metadata.
- Unauthorized ownership changes.

---

# Smart Contract Requirements

The NFT contract should support:

- Minting.
- Transfers.
- Metadata updates.
- Ownership verification.

---

# Game Server Integration

When ownership changes:

```
Blockchain Event

↓

Game Server Detection

↓

Permission Update

↓

Player Access Changes
```

---

# Three.js Integration

NFT data influences:

Visual representation:

- Land appearance.
- Region.
- Size.
- Bonuses.

Example:

Large forest land:

↓

Larger visible area.

↓

More trees.

↓

Forest environment.

---

# Balance Rules

NFTs should:

- Represent ownership.
- Create player investment.
- Support economy.

NFTs should not:

- Guarantee victory.
- Replace gameplay.
- Create unfair advantages.

---

# Final Statement

NFTs are used as a foundation for true digital ownership.

The goal is to create valuable assets that enhance the player-driven economy while keeping the game focused on production, interaction, and strategy.