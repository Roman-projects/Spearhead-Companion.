# Spearhead Companion architecture

## Purpose

Build the current Spearhead companion on a foundation that can later support accounts, persistent army collections, match history, statistics, points-based army lists, and subscription plans. Future capabilities are represented in the data model from the beginning, but are not all exposed or activated in the first release.

## Current application boundary

- Frontend: React, TypeScript, Vite, and Capacitor.
- Server boundary: Vercel Functions under `/api`; private credentials and all trusted writes stay server-side.
- Relational data: PostgreSQL on Neon.
- Original source files: Vercel Blob, addressed by immutable object keys and checksums.
- Official publications and errata are the authority for game data.
- The current game rules engine is a semantic catalog and availability/usage tracker. It does not verify battlefield conditions or adjudicate combat.

## Domain boundaries

### Identity and account
- Authentication: Better Auth, hosted by our Vercel Functions and backed by Neon PostgreSQL.
- Supported sign-in methods: email/password and Google OAuth.
- Better Auth owns authentication identities, provider accounts, credentials, verification records, and login sessions. Do not create a parallel provider-identity table in the product schema.
- The product-level `users` row stores game/profile data and maps one-to-one to the Better Auth user through `auth_user_id`. Product tables reference the product-level user ID.
- Link sign-in methods only through Better Auth's verified identity and account-linking flow. Never merge accounts based only on an unverified matching email.
- Require email verification for password-based accounts before issuing an authenticated session. Configure a transactional email sender before enabling public registration.
- Account deletion/deactivation must be designed with retention and anonymization of historical match records in mind.

### Entitlements
- `plans`, `plan_entitlements`, and `subscriptions` define plan capabilities and limits as data.
- Application code asks for capabilities/limits; it must not scatter hard-coded premium checks across screens.
- Billing provider and exact plan benefits are intentionally undecided.
- Historical matches and personal statistics must not be deleted when a subscription changes. Entitlements primarily govern future creation and access to premium tools.

### Official rules catalog
- Every source document is retained with publisher, source URL, version label, retrieval time, Blob key, and checksum.
- A ruleset version records both source provenance and the processor version that interpreted it.
- Parsed catalog entities are versioned. A newer official publication creates a new ruleset version; it does not mutate an existing match snapshot.
- Preserve original text and source page references alongside normalized interpretation.
- Ambiguous source material is flagged for review, never silently inferred.

### Saved armies
- A saved army belongs to a user and references a catalog/ruleset version.
- Support both future list formats: Spearhead and points-based.
- Keep a saved army/template distinct from the copy selected for a match.
- Repeated instances of the same unit remain separate selections where the game data requires it.
- Favorites are a user-to-army relationship, not a property of the global catalog.

### Sessions and matches
- A session is a play occasion and may contain one or more matches, or remain unfinished.
- A match has participants, sides, result, score, rounds/turns, and exact ruleset provenance.
- At match start, persist immutable army snapshots and selected options. A later catalog update must never alter an in-progress or historical match.
- Store meaningful match events (for example turn changes, scores, priority, underdog, ability-use confirmations) so future statistics can be calculated without guessing from a final score.
- Avoid collecting unnecessary personal or sensitive information.

### Statistics
- Match facts and events are the source of truth.
- Aggregated statistics are derived and can be recalculated. Do not make an aggregate the only record of a result.
- Queries should support user, army, faction, matchup, format, time range, and ruleset version.

## Match data lifecycle

1. Select two armies before starting.
2. Resolve the current official publications and applicable errata/FAQs.
3. Store source documents in Blob and register their checksums and metadata.
4. Extract and normalize the data into a candidate ruleset version.
5. Verify required sections and generated Army/Battle views for both armies.
6. Block game start if required data is missing or unresolved.
7. On confirmation, create the match and immutable army/rules snapshots.
8. During play, read the snapshots only. Persist session/match progress and meaningful events.
9. Derive statistics from completed match records and events.

## Initial implementation sequence

1. Establish this architecture and the database migration baseline.
2. Provision Neon and configure Vercel environment variables without committing secrets.
3. Add Better Auth with email/password and Google OAuth, plus its generated database schema.
4. Add server-side database access and health/migration checks.
4. Build the official-source ingestion and verification pipeline.
5. Define the normalized army catalog and generate Army and Battle views from the same data.
6. Add match snapshot persistence.
8. Add saved armies, game sessions, match history, and account-linked profiles.
9. Add statistics, points-based lists, and subscription entitlements as later product phases.

## Operational rules

- Use additive, numbered SQL migrations; never edit an already-applied migration.
- Store timestamps in UTC.
- Use UUIDs for domain identifiers.
- Keep credentials server-side. The client never connects directly to Neon.
- Use transactions for match start, snapshot creation, scoring, and subscription changes.
- Use explicit status fields for ingestion and verification. Never silently fall back to stale or incomplete official data.
- Keep the frontend usable as a local prototype while backend services are introduced incrementally.

## Decisions intentionally left open

- Transactional email delivery provider for verification and password recovery.
- Billing/subscription provider.
- Exact free and premium limits.
- Whether anonymous/local matches can later be claimed by an account.
- Retention and export policy for user data.
- Exact analytics/event granularity beyond the gameplay facts already agreed.

These choices should be made before their corresponding integrations, not guessed in the foundational schema.
