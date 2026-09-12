# Marketplace

**Document Version:** 0.1.0  
**Status:** Draft  
**Owner:** Game Design Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Marketplace is the central hub of the player-driven economy.

It allows players to exchange goods, discover prices, satisfy demand, and transform production into profit.

The Marketplace is not simply a trading interface.

It is the mechanism through which the game's economy operates.

---

# Vision

Players should not ask:

> "How much is this item worth?"

Instead they should ask:

> "What are players willing to pay today?"

Prices should emerge naturally from player behavior.

The Marketplace reflects the state of the economy.

It should never dictate it.

---

# Design Goals

The Marketplace must:

- Be completely player-driven.
- Encourage specialization.
- Support price discovery.
- Reward market knowledge.
- Remain easy to use.
- Prevent unnecessary friction.
- Scale to thousands of items.

---

# Functional Requirements

### MARKET-001

Every tradable item may be listed for sale.

---

### MARKET-002

Players determine listing prices.

---

### MARKET-003

Players may purchase any active listing.

---

### MARKET-004

Listings automatically expire after a configurable period.

---

### MARKET-005

Completed transactions transfer ownership instantly.

---

### MARKET-006

The Marketplace supports both game currency and blockchain token listings where applicable.

---

### MARKET-007

Only tradable items may be listed.

---

# Marketplace Philosophy

The Marketplace exists to connect producers and consumers.

It is not intended to guarantee profit.

Poor production decisions should naturally result in lower profits.

Good market analysis should be rewarded.

---

# Listing Workflow

The standard selling process is:

Player Selects Item

↓

Chooses Quantity

↓

Sets Unit Price

↓

Pays Listing Fee (optional)

↓

Listing Becomes Public

↓

Another Player Purchases

↓

Seller Receives Currency

↓

Listing Closes

The process should require as few steps as possible.

---

# Buying Workflow

Player Searches Item

↓

Views Available Listings

↓

Sorts by Price

↓

Chooses Quantity

↓

Confirms Purchase

↓

Items Transfer Immediately

The buying experience should be fast and predictable.

---

# Supported Trading Models

## Fixed Price Listings

The initial version of the game uses fixed-price listings.

This keeps the system simple and accessible.

---

## Future Buy Orders

Future versions may allow players to create purchase requests.

Example:

Player wants:

500 Iron Ore

Maximum Price:

12 Coins

Any seller can fulfill the order.

This increases market liquidity.

---

## Future Contracts

Possible future features include:

- Bulk deliveries
- Guild contracts
- Production agreements
- Resource supply contracts

These systems support advanced economic gameplay.

---

# Search and Filters

Players should be able to filter listings by:

- Item
- Category
- Price
- Quantity
- Profession
- Seller (future)

Fast item discovery is essential.

---

# Price Discovery

Developers never define item prices.

Prices emerge naturally through:

- Supply
- Demand
- Production Costs
- Opportunity Cost
- Player Expectations

The Marketplace simply exposes this information.

---

# Historical Data

Future versions may include:

- Average Price
- Daily Volume
- Weekly Trends
- Price Charts
- Highest Price
- Lowest Price

Market history rewards informed decision-making.

---

# Listing Fees

Listing fees may be introduced to:

- Reduce spam
- Remove currency from circulation
- Encourage thoughtful pricing

Fees should remain low enough to avoid discouraging legitimate trading.

---

# Transaction Fees

Small transaction fees may serve as a currency sink.

Fees should:

- Be transparent
- Be predictable
- Never feel punitive

---

# Relationship with the Economy

The Marketplace reflects the current economy.

It does not create it.

Every price shown originates from player decisions.

---

# Relationship with Professions

Every profession should regularly interact with the Marketplace.

Examples:

Farmer

↓

Sells Wheat

↓

Cook Purchases Wheat

↓

Produces Bread

↓

Bread Sold

↓

Players Recover Energy

The Marketplace connects production chains.

---

# Relationship with Resources

Resources are expected to represent a large portion of daily trading volume.

Processed materials and crafted goods should gradually increase in value as they move through production chains.

---

# Relationship with Lands

Land bonuses influence production efficiency.

Production efficiency influences supply.

Supply influences market prices.

The Marketplace indirectly reflects land specialization across the player base.

---

# Relationship with Blockchain

NFT Lands may be traded through blockchain-enabled systems.

Regular gameplay items remain off-chain unless future design decisions justify otherwise.

Blockchain should support ownership without increasing trading complexity.

---

# Anti Market Manipulation

Possible protections include:

- Listing expiration.
- Transparent pricing.
- Public transaction history.
- Large resource availability.
- Multiple competing producers.

The goal is to make manipulation difficult rather than impossible.

---

# Anti Pay-to-Win

The Marketplace rewards:

- Knowledge
- Timing
- Production
- Market Analysis

Not simply purchasing assets.

Owning valuable NFTs should increase opportunity rather than guarantee economic dominance.

---

# Risks

## Risk

Market flooding.

### Mitigation

Resource sinks.

Energy limits.

Land capacity.

Profession progression.

---

## Risk

Price manipulation.

### Mitigation

Transparent listings.

Competition.

Large supply.

Future buy orders.

---

## Risk

New players cannot compete.

### Mitigation

Starter Lands.

Abundant basic resources.

Low entry barriers.

Strong demand for beginner materials.

---

## Risk

Marketplace becomes overwhelming.

### Mitigation

Powerful filters.

Favorites.

Clear categories.

Simple interface.

---

# Future Expansion Ideas

Potential future systems include:

- Buy Orders.
- Regional Markets.
- Auction Listings.
- Merchant Reputation.
- Trade Contracts.
- Delivery Services.
- Market Analytics.
- Price Alerts.
- Public API.

These systems should deepen economic gameplay without increasing unnecessary complexity.

---

# Open Questions

Should the Marketplace be global or regional?

Should players pay listing fees in soft currency or tokens?

Should anonymous listings exist?

Should players be able to negotiate directly?

Should guilds have private marketplaces?

These questions remain open.

---

# Final Statement

The Marketplace is the beating heart of the player-driven economy.

Every profession, every resource, every crafted item, and every production chain eventually converges here.

Its purpose is not to create wealth, but to enable players to create wealth for one another through production, specialization, and trade.

A successful Marketplace transforms individual effort into a living economy shared by the entire world.