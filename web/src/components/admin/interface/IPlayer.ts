export interface IPlayer {
  id: string;
  buzzer_enabled: boolean;
  player_name: string;
  points: number;
  is_disqualified: boolean;
  updated_at?: string;
}
