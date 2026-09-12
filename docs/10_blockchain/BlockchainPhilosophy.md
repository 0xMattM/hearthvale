# Blockchain

**Document Version:** 0.1.0  
**Status:** Draft  
**Owner:** Game Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Blockchain System defines how decentralized technologies integrate with the game while preserving a seamless gameplay experience.

Blockchain exists to enhance ownership, interoperability, and transparency.

It should never introduce unnecessary complexity into the core gameplay loop.

---

# Vision

Players should enjoy the game regardless of their knowledge of blockchain technology.

Web3 should remain optional for understanding the game, but valuable for those who wish to participate in the on-chain economy.

The game should feel like a great MMO that happens to use blockchain—not a blockchain application trying to become a game.

---

# Design Goals

The Blockchain System must:

- Provide true ownership of digital assets.
- Keep gameplay simple.
- Minimize transaction friction.
- Avoid pay-to-win mechanics.
- Support long-term interoperability.
- Integrate naturally with the player-driven economy.

---

# Functional Requirements

### BC-001

Player lands are NFTs.

---

### BC-002

Players fully own their NFT lands.

---

### BC-003

NFT lands may be freely traded outside the game.

---

### BC-004

Gameplay items are off-chain in Version 1.

---

### BC-005

Blockchain interactions should be invisible whenever possible.

---

# Security invariant (F15.5)

**Wallet, deeds, mint/list stubs, and chain marketplace mirrors never gate energy or combat.** See [ChainNeverGatesCombat.md](./ChainNeverGatesCombat.md).

---

# Blockchain Philosophy

Blockchain represents ownership.

Gameplay represents progression.

Ownership should never replace progression.

---

# NFT Assets

Version 1 includes only one NFT type.

## Lands

Lands are unique NFTs representing ownership of player property.

Each land stores metadata such as:

- Size
- Production bonuses
- Visual appearance
- Identifier

Players may buy, sell, and transfer lands freely.

---

# Non-NFT Assets

The following assets remain off-chain:

- Resources
- Tools
- Weapons
- Armor
- Food
- Consumables
- Buildings
- Profession Progress
- Character Progress

Keeping gameplay assets off-chain improves performance and user experience.

---

# Tokens

The game contains two currencies.

## Soft Currency

Used for:

- Marketplace transactions
- NPC purchases
- Crafting costs
- Construction

Earned exclusively through gameplay.

---

## Blockchain Token

Represents the premium currency.

May be used for:

- Land purchases
- Marketplace fees (future)
- Cosmetic purchases
- Governance (future)

The blockchain token should never replace gameplay progression.

---

# Wallet Integration

Players may connect a blockchain wallet.

Wallet connection enables:

- NFT ownership
- Token management
- Asset transfers

Players may enjoy the game without constantly interacting with their wallet.

---

# Marketplace Integration

NFT Lands may be traded through blockchain marketplaces.

Regular gameplay trading occurs entirely inside the in-game Marketplace.

This separation keeps everyday gameplay fast and accessible.

---

# Security

Players remain responsible for their wallets.

The game never stores private keys.

Transactions requiring blockchain interaction always require explicit player approval.

---

# Relationship with Lands

Blockchain guarantees ownership.

The game defines functionality.

Ownership and gameplay remain separate concepts.

---

# Relationship with Economy

Blockchain supports asset ownership.

The in-game economy remains driven by production, crafting, and trade.

Blockchain complements the economy rather than replacing it.

---

# Anti Pay-to-Win

Owning more NFT lands provides greater production capacity.

It does not provide:

- Stronger combat.
- Faster leveling.
- Better equipment.
- Exclusive professions.

Success still depends on player decisions, planning, and market participation.

---

# Future Expansion Ideas

Potential additions include:

- Cosmetic NFTs.
- Seasonal collectibles.
- Achievement NFTs.
- Guild emblems.
- Cross-game interoperability.

Gameplay progression should always remain off-chain unless a compelling reason exists.

---

# Risks

## Risk

Blockchain complexity discourages new players.

### Mitigation

Keep blockchain interactions optional and intuitive.

---

## Risk

Speculation overshadows gameplay.

### Mitigation

Ensure that valuable assets derive their worth from in-game utility rather than artificial scarcity.

---

## Risk

Pay-to-win perception.

### Mitigation

Separate ownership from progression and avoid direct gameplay advantages tied to NFT ownership.

---

# Open Questions

Should future cosmetic items become NFTs?

Should governance exist?

Should premium purchases require blockchain tokens?

Should achievements be tokenized?

These questions remain open.

---

# Final Statement

Blockchain is a supporting technology, not the foundation of the game.

It provides secure ownership and open asset exchange while allowing the core gameplay to remain accessible, competitive, and focused on the player-driven economy.

The game should always be enjoyable first and decentralized second.