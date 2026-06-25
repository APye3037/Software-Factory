CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  run_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE game_types (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE manufacturers (
  id   SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE games (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  num_players     INTEGER NOT NULL CHECK (num_players > 0),
  game_type_id    INTEGER NOT NULL REFERENCES game_types(id),
  manufacturer_id INTEGER NOT NULL REFERENCES manufacturers(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE players (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  id         SERIAL PRIMARY KEY,
  played_on  DATE NOT NULL,
  game_id    INTEGER NOT NULL REFERENCES games(id),
  winner_id  INTEGER NOT NULL REFERENCES players(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE session_players (
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  player_id  INTEGER NOT NULL REFERENCES players(id),
  PRIMARY KEY (session_id, player_id)
);
