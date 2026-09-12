# Smart Contracts

**Document Version:** 0.1.0  
**Status:** Work in Progress  
**Owner:** Blockchain Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Smart Contract System defines the blockchain contracts required to support ownership, trading, and token functionality.

The objective is to create a secure blockchain layer while keeping gameplay logic efficient and scalable.

---

# Smart Contract Philosophy

## Minimal On-Chain Logic

Smart contracts should only handle systems that require:

- Ownership.
- Transparency.
- Trustless transactions.
- Asset transfers.

Gameplay calculations should remain outside the blockchain.

---

# Smart Contract Architecture

The initial ecosystem contains:

```
Land NFT Contract

+

Token Contract

+

Marketplace Contract

+

Future Extension Contracts
```

---

# Land NFT Contract

The Land NFT Contract represents ownership of player lands.

---

# Contract Standard

Recommended:

ERC-721 compatible NFT.

Reason:

Each land is unique.

---

# Land NFT Responsibilities

The contract manages:

- Minting.
- Ownership.
- Transfers.
- Metadata reference.
- Land ID.

---

# Land NFT Data

Stored on-chain:

```
Token ID

+

Owner Address

+

Metadata URI
```

---

# Off-Chain Land Data

Stored by the game server:

```
Buildings

+

Production Areas

+

Decorations

+

Temporary State
```

---

# Land Minting

Land creation should be controlled.

Possible sources:

- Initial land release.
- Special events.
- Future expansions.

---

# Land Transfer

When ownership changes:

```
NFT Transfer

↓

Blockchain Event

↓

Game Backend Detects Change

↓

New Owner Access Enabled
```

---

# Token Contract

The Token Contract manages the blockchain currency.

---

# Contract Standard

Recommended:

ERC-20 compatible token.

---

# Token Responsibilities

The contract manages:

- Balances.
- Transfers.
- Allowances.

---

# Token Supply

The contract must define:

- Maximum supply.
- Minting rules.
- Distribution.

---

# Minting Control

Token creation should be restricted.

Possible mechanisms:

- Controlled minting roles.
- Treasury management.
- Governance approval.

---

# Marketplace Contract

The Marketplace Contract enables NFT trading.

---

# Marketplace Responsibilities

Handles:

- Listings.
- Purchases.
- Sales.
- Payments.

---

# Marketplace Flow

Example:

```
Seller Lists Land

↓

Buyer Purchases

↓

Payment Executed

↓

NFT Transferred
```

---

# Marketplace Design Goals

The marketplace should be:

- Simple.
- Transparent.
- Secure.

---

# Marketplace Fees

Possible fee:

A small percentage from transactions.

Used for:

- Ecosystem maintenance.
- Development.
- Treasury.

---

# Security Requirements

Smart contracts must prioritize:

- Security.
- Auditing.
- Simplicity.

---

# Common Risks To Prevent

---

## Unauthorized Ownership Changes

Protection:

- Standard NFT ownership rules.
- Access control.

---

## Token Manipulation

Protection:

- Controlled minting.
- Supply limits.

---

## Marketplace Exploits

Protection:

- Validation checks.
- Secure transfer methods.

---

# Upgradeability

Possible approach:

Use upgradeable contracts carefully.

Reasons:

- Bug fixes.
- Future improvements.

Risks:

- Centralization.
- Contract complexity.

---

# Contract Events

Contracts should emit events.

Examples:

Land:

```
LandCreated

LandTransferred
```

Token:

```
TokensTransferred
```

Marketplace:

```
ItemListed

ItemSold
```

---

# Backend Integration

The backend listens to blockchain events.

Example:

```
Smart Contract Event

↓

Blockchain Listener

↓

Game Database Update

↓

Player Access Updated
```

---

# What Should NOT Be A Smart Contract

The following systems remain off-chain:

```
Experience

+

Energy

+

Profession Levels

+

Resource Production

+

Crafting

+

Combat

+

NPC Logic
```

---

# Reasons

These systems require:

- Fast updates.
- Frequent changes.
- Game balancing.

---

# Development Environment

Recommended tools:

- Solidity.
- Hardhat.
- Foundry.
- OpenZeppelin libraries.

---

# Testing Requirements

Contracts require:

- Unit tests.
- Security tests.
- Deployment tests.

---

# Deployment Strategy

Possible environments:

```
Local Network

↓

Test Network

↓

Main Network
```

---

# Three.js Integration

Three.js does not directly interact with contracts.

Flow:

```
Three.js Client

↓

Game Backend

↓

Blockchain Services
```

---

# Future Smart Contracts

Possible additions:

- Cosmetic NFT contracts.
- Event reward contracts.
- Governance contracts.
- Achievement badges.

---

# Balance Rules

Smart contracts should:

- Protect ownership.
- Enable trading.
- Maintain transparency.

They should not:

- Control gameplay.
- Create unnecessary complexity.

---

# Final Statement

Smart contracts provide the foundation for digital ownership and open economic systems.

The goal is a secure blockchain layer that supports the game while keeping gameplay fast, flexible, and enjoyable.