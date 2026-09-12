# Open Questions

**Document Version:** 1.0.0  
**Status:** Living Document  
**Owner:** Project Management Team  
**Last Updated:** July 30, 2026

---

# Purpose

The Open Questions document tracks unresolved design, technical, business, and operational decisions.

Its objectives are to:

- Prevent forgotten discussions.
- Document important uncertainties.
- Support informed decision making.
- Prioritize future research.
- Reduce architectural uncertainty.

---

# Usage

Every unresolved topic should include:

- Unique identifier.
- Description.
- Category.
- Current status.
- Owner.
- Priority.
- Proposed solutions.
- Expected decision date.

---

# Status Values

Questions may have one of the following states:

```
Open

Researching

Under Discussion

Waiting

Resolved

Rejected
```

---

# Priority Levels

```
Critical

High

Medium

Low
```

---

# Categories

Questions are grouped into:

```
Gameplay

Technical

Blockchain

Artificial Intelligence

Economy

Infrastructure

Narrative

Business

Community

Operations
```

---

# Gameplay

---

## GQ-001

Title

Should classes be permanently locked?

Status

Resolved

Priority

Medium

Decision

**No.** Core Pillars forbid fixed class locks and permanent profession selection. Players may change priorities freely. Multi-character remains optional product choice, not a class lock.

Resolved Date

July 30, 2026

---

## GQ-002

Title

How much vertical progression should exist?

Status

Researching

Priority

High

Considerations

```
Long-Term Progression

â†“

Player Accessibility

â†“

Content Balance
```

---

## GQ-003

Title

Should level scaling exist?

Status

Open

Priority

Medium

Possible options:

- Full scaling.
- Regional scaling.
- No scaling.

---

# Economy

---

## EQ-001

Title

Should all crafting materials be tradable?

Status

Open

Priority

High

Questions

- Market health.
- Resource scarcity.
- Inflation impact.

---

## EQ-002

Title

How many currencies should exist?

Status

Researching

Priority

High

Possible models:

- Single currency.
- Dual currency.
- Multiple specialized currencies.

---

## EQ-003

Title

Should taxes exist in player trading?

Status

Open

Priority

Medium

Purpose

- Currency sinks.
- Market stabilization.
- Economic balancing.

---

# Blockchain

---

## BQ-001

Title

Which assets should become NFTs?

Status

Open

Priority

Critical

Candidate assets:

```
Land

Equipment

Collectibles

Cosmetics

Achievements
```

---

## BQ-002

Title

Should gameplay require blockchain interactions?

Status

Researching

Priority

Critical

Goal

Minimize friction while preserving ownership.

---

## BQ-003

Title

Should on-chain crafting exist?

Status

Open

Priority

Low

Requires evaluation of:

- Cost.
- Speed.
- Player experience.

---

# Artificial Intelligence

---

## AQ-001

Title

Should NPC memories persist permanently?

Status

Researching

Priority

Medium

Considerations

- Storage costs.
- Gameplay value.
- Scalability.

---

## AQ-002

Title

Should AI generate dynamic quests?

Status

Open

Priority

Medium

Challenges

- Quality.
- Balance.
- Narrative consistency.

---

## AQ-003

Title

Should companions use LLMs?

Status

Open

Priority

Medium

Requires:

- Cost evaluation.
- Latency analysis.
- Safety review.

---

# Infrastructure

---

## IQ-001

Title

Should regional servers exist?

Status

Researching

Priority

Medium

Topics

- Latency.
- Cost.
- Player distribution.

---

## IQ-002

Title

Dedicated servers or cloud scaling?

Status

Open

Priority

High

Evaluation criteria

- Performance.
- Cost.
- Flexibility.

---

# Narrative

---

## NQ-001

Title

How much freedom should players have to affect world history?

Status

Open

Priority

Medium

Discussion

Balance between:

- Persistent lore.
- Dynamic storytelling.

---

## NQ-002

Title

Can major NPCs permanently die?

Status

Open

Priority

Low

Potential impact

- Story continuity.
- Player agency.

---

# Business

---

## BZ-001

Title

What monetization model best supports long-term sustainability?

Status

Researching

Priority

Critical

Possible approaches

```
Cosmetics

Battle Pass

Expansions

Marketplace Fees

Optional Subscription
```

---

## BZ-002

Title

Will community governance be implemented?

Status

Open

Priority

Low

Potential systems

- DAO.
- Advisory council.
- Community voting.

---

# Community

---

## CQ-001

Title

Should players create official events?

Status

Open

Priority

Medium

Benefits

- Engagement.
- Content creation.
- Community growth.

---

# Technical

---

## TQ-001

Title

Should microservices be introduced from the beginning?

Status

Resolved

Priority

Medium

Decision

**No.** Start with a TypeScript monolith (`apps/server`). Split services only when operational need is proven.

Resolved Date

July 30, 2026

---

## TQ-002

Title

Should game logic remain server authoritative?

Status

Resolved

Decision

Yes.

Reason

Security and anti-cheat protection.

---

## TQ-003

Title

What is the MVP client and data stack?

Status

Resolved

Priority

Critical

Decision

```
Client: Next.js + React Three Fiber (Three.js) + Drei + Tailwind
Server: Node.js + Hono (monolith)
DB: SQLite + Drizzle (Postgres later)
Auth: local username/password (no wallet)
3D art: primitives only in MVP; GLTF later on same plot scene
```

Resolved Date

July 30, 2026

---

# Decision Process

Questions should be resolved through:

```
Research

â†“

Prototype

â†“

Evaluation

â†“

Decision

â†“

Documentation
```

---

# Decision Criteria

Every decision should consider:

```
Player Experience

Technical Complexity

Business Value

Development Cost

Long-Term Maintenance
```

---

# Documentation Updates

Whenever a question is resolved:

- Update its status.
- Record the final decision.
- Link to related documentation.
- Remove obsolete alternatives if necessary.

---

# Review Schedule

The document should be reviewed:

```
Monthly

Before Major Milestones

Before Major Releases
```

---

# Final Statement

The Open Questions document captures uncertainty as an explicit part of the development process.

Rather than leaving important decisions undocumented, the project tracks them transparently, ensuring that future choices are informed, traceable, and aligned with the long-term vision.