import { IPlayerScores } from "../models/player-scores";
import { IPlayerScoresDto } from "../dtos/player-scores.dto";


export const transformIPlayerScoresToDto = (scores: IPlayerScores): IPlayerScoresDto => {
  return {
    airKills: scores.airKills,
    deaths: scores.deaths,
    flightTimeMinutes: scores.flightTimeMinutes,
    groundKills: scores.groundKills,
    name: scores.name,
    sorties: scores.sorties,
    streakAk: scores.streakAk,
    streakGk: scores.streakGk,
    updateDate: scores.updateDate?.toUTCString(),
    serverCode: scores.serverCode,
  } as IPlayerScoresDto
}