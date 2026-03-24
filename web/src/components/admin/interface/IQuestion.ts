import { AnswerType } from "../../universal/AnswerType";

export interface IQuestion {
  id: string;
  title: string;
  is_text_answer: boolean;
  guidelines: string;
  image_url: string;
  answers: AnswerType[];
  open_answers: string;
  round_id: string;
  order?: number;
}
