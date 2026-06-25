export interface GameType { id: number; name: string; }
export interface Manufacturer { id: number; name: string; }
export interface Game {
  id: number; name: string; num_players: number;
  game_type_id: number; game_type_name: string;
  manufacturer_id: number; manufacturer_name: string;
  created_at: string;
}
export interface Player { id: number; name: string; created_at: string; }
export interface SessionPlayer { player_id: number; player_name: string; }
export interface Session {
  id: number; played_on: string; game_id: number; game_name: string;
  winner_id: number; winner_name: string; players: SessionPlayer[];
  created_at: string; warning?: string;
}
export interface GameStats {
  game_id: number; game_name: string; times_played: number;
  winners: { player_id: number; player_name: string; wins: number; }[];
}
export interface PlayerStats {
  player_id: number; player_name: string; total_sessions: number;
  most_played_game: { game_id: number; game_name: string; count: number; } | null;
  wins: { this_week: number; this_month: number; this_year: number; all_time: number; };
}
