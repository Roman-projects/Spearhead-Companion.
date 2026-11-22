-- 0001_initial_schema.sql
-- Foundational schema for accounts, official rules data, saved armies,
-- sessions, matches, snapshots, analytics facts, and plan entitlements.
-- Apply through a migration runner in a transaction. Never edit after deployment.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id TEXT NOT NULL UNIQUE,
  display_name TEXT,
  handle TEXT UNIQUE,
  locale TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMPTZ
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plan_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  entitlement_key TEXT NOT NULL,
  entitlement_value JSONB NOT NULL,
  UNIQUE (plan_id, entitlement_key)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
  billing_provider TEXT,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  starts_at TIMESTAMPTZ,
  current_period_ends_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (status IN ('trialing', 'active', 'past_due', 'paused', 'canceled', 'inactive'))
);
CREATE INDEX subscriptions_user_status_idx ON subscriptions(user_id, status);

CREATE TABLE source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher TEXT NOT NULL,
  title TEXT NOT NULL,
  document_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_version_label TEXT,
  published_at DATE,
  retrieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blob_key TEXT,
  sha256 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'retrieved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (sha256),
  CHECK (status IN ('retrieved', 'stored', 'unavailable', 'superseded', 'review_required'))
);

CREATE TABLE ruleset_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_system TEXT NOT NULL DEFAULT 'warhammer-age-of-sigmar',
  game_format TEXT NOT NULL,
  version_label TEXT NOT NULL,
  processor_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  content_checksum TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  UNIQUE (game_system, game_format, version_label, processor_version),
  CHECK (status IN ('draft', 'processing', 'review_required', 'verified', 'superseded', 'failed'))
);

CREATE TABLE ruleset_sources (
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  source_document_id UUID NOT NULL REFERENCES source_documents(id) ON DELETE RESTRICT,
  source_role TEXT NOT NULL DEFAULT 'primary',
  PRIMARY KEY (ruleset_version_id, source_document_id)
);

CREATE TABLE factions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE RESTRICT,
  source_page TEXT,
  UNIQUE (ruleset_version_id, code)
);

CREATE TABLE army_catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  game_format TEXT NOT NULL,
  points_value INTEGER,
  army_ability_text TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE RESTRICT,
  source_page TEXT,
  UNIQUE (ruleset_version_id, code),
  CHECK (points_value IS NULL OR points_value >= 0)
);

CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  model_count INTEGER,
  movement TEXT,
  health TEXT,
  save_value TEXT,
  ward_value TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  source_document_id UUID REFERENCES source_documents(id) ON DELETE RESTRICT,
  source_page TEXT,
  UNIQUE (ruleset_version_id, faction_id, code),
  CHECK (model_count IS NULL OR model_count >= 0)
);

CREATE TABLE unit_weapons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  weapon_type TEXT NOT NULL,
  range_value TEXT,
  attacks TEXT,
  to_hit TEXT,
  to_wound TEXT,
  rend TEXT,
  damage TEXT,
  abilities_text TEXT,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE RESTRICT,
  source_page TEXT,
  CHECK (weapon_type IN ('ranged', 'melee')),
  UNIQUE (unit_id, code)
);

CREATE TABLE abilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  original_text TEXT NOT NULL,
  ability_type TEXT NOT NULL DEFAULT 'unclassified',
  timing JSONB NOT NULL DEFAULT '{}'::jsonb,
  frequency JSONB NOT NULL DEFAULT '{}'::jsonb,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  targets JSONB NOT NULL DEFAULT '[]'::jsonb,
  effects JSONB NOT NULL DEFAULT '[]'::jsonb,
  restrictions JSONB NOT NULL DEFAULT '[]'::jsonb,
  interpretation_status TEXT NOT NULL DEFAULT 'unreviewed',
  source_document_id UUID REFERENCES source_documents(id) ON DELETE RESTRICT,
  source_page TEXT,
  UNIQUE (ruleset_version_id, code),
  CHECK (interpretation_status IN ('unreviewed', 'reviewed', 'ambiguous', 'needs_correction'))
);

CREATE TABLE unit_abilities (
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  ability_id UUID NOT NULL REFERENCES abilities(id) ON DELETE RESTRICT,
  display_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (unit_id, ability_id)
);

CREATE TABLE enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE RESTRICT,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  enhancement_group TEXT NOT NULL,
  original_text TEXT NOT NULL,
  source_document_id UUID REFERENCES source_documents(id) ON DELETE RESTRICT,
  source_page TEXT,
  CHECK (enhancement_group IN ('general', 'regiment', 'other')),
  UNIQUE (ruleset_version_id, faction_id, code)
);

CREATE TABLE army_catalog_units (
  army_catalog_id UUID NOT NULL REFERENCES army_catalogs(id) ON DELETE RESTRICT,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  composition_notes TEXT,
  PRIMARY KEY (army_catalog_id, unit_id),
  CHECK (quantity > 0)
);

CREATE TABLE army_catalog_enhancements (
  army_catalog_id UUID NOT NULL REFERENCES army_catalogs(id) ON DELETE RESTRICT,
  enhancement_id UUID NOT NULL REFERENCES enhancements(id) ON DELETE RESTRICT,
  is_selected_by_default BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (army_catalog_id, enhancement_id)
);

CREATE TABLE saved_armies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  army_catalog_id UUID REFERENCES army_catalogs(id) ON DELETE RESTRICT,
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  game_format TEXT NOT NULL,
  name TEXT NOT NULL,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (game_format IN ('spearhead', 'points'))
);
CREATE INDEX saved_armies_user_format_idx ON saved_armies(user_id, game_format);
CREATE INDEX saved_armies_favorites_idx ON saved_armies(user_id) WHERE is_favorite;

CREATE TABLE saved_army_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_army_id UUID NOT NULL REFERENCES saved_armies(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
  instance_key TEXT NOT NULL,
  model_count INTEGER,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (saved_army_id, instance_key),
  CHECK (model_count IS NULL OR model_count >= 0)
);

CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_name TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);
CREATE INDEX game_sessions_owner_started_idx ON game_sessions(owner_user_id, started_at DESC);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES game_sessions(id) ON DELETE SET NULL,
  game_format TEXT NOT NULL,
  ruleset_version_id UUID NOT NULL REFERENCES ruleset_versions(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'setup',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  winner_side TEXT,
  rounds_played INTEGER,
  result_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (game_format IN ('spearhead', 'points')),
  CHECK (status IN ('setup', 'in_progress', 'completed', 'abandoned')),
  CHECK (winner_side IS NULL OR winner_side IN ('left', 'right', 'draw')),
  CHECK (rounds_played IS NULL OR rounds_played >= 0)
);
CREATE INDEX matches_ruleset_completed_idx ON matches(ruleset_version_id, completed_at DESC);

CREATE TABLE match_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  side TEXT NOT NULL,
  display_name_snapshot TEXT,
  participant_role TEXT NOT NULL DEFAULT 'player',
  UNIQUE (match_id, side),
  CHECK (side IN ('left', 'right')),
  CHECK (participant_role IN ('player', 'spectator', 'organizer'))
);
CREATE INDEX match_participants_user_idx ON match_participants(user_id);

CREATE TABLE match_army_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  side TEXT NOT NULL,
  saved_army_id UUID REFERENCES saved_armies(id) ON DELETE SET NULL,
  army_catalog_id UUID REFERENCES army_catalogs(id) ON DELETE SET NULL,
  faction_name_snapshot TEXT NOT NULL,
  army_name_snapshot TEXT NOT NULL,
  source_version_snapshot TEXT NOT NULL,
  processor_version_snapshot TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  snapshot_checksum TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, side),
  CHECK (side IN ('left', 'right'))
);

CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sequence_number BIGINT NOT NULL,
  event_type TEXT NOT NULL,
  side TEXT,
  turn_number INTEGER,
  round_number INTEGER,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (match_id, sequence_number),
  CHECK (side IS NULL OR side IN ('left', 'right')),
  CHECK (turn_number IS NULL OR turn_number > 0),
  CHECK (round_number IS NULL OR round_number > 0)
);
CREATE INDEX match_events_type_idx ON match_events(event_type, occurred_at DESC);

CREATE TABLE match_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  side TEXT NOT NULL,
  score_category TEXT NOT NULL,
  score_value INTEGER NOT NULL,
  round_number INTEGER,
  turn_number INTEGER,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (side IN ('left', 'right')),
  CHECK (score_value >= 0),
  CHECK (round_number IS NULL OR round_number > 0),
  CHECK (turn_number IS NULL OR turn_number > 0)
);
CREATE INDEX match_scores_match_side_idx ON match_scores(match_id, side);

-- The schema deliberately stores source facts and immutable match snapshots.
-- Derived statistics should be computed from completed matches/events, not
-- treated as the only copy of a user's history.
