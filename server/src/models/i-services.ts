import { ScoresService } from "../services/scores";
import { SortiesService } from "../services/sorties";

export interface IServices {
  scores: ScoresService;
  sorties: SortiesService;
}