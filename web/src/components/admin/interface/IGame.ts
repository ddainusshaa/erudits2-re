import { IRound } from "./IRound";

export interface IGame {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  rounds?: IRound[];
  roundCount?: number;
  activeGameInstance?: string;
  questionCount?: number;
  last_activation?: string;
}
