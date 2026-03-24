import { IQuestion } from "./IQuestion";

export interface IRound {
  id: string;
  title: string;
  disqualify_amount: number;
  answer_time: number;
  points: number;
  is_additional: boolean;
  game_id?: string;
  questions?: IQuestion[];
  is_test: boolean;
  started_at?: string;
  game_started?: boolean;
  total_questions?: number;
}
