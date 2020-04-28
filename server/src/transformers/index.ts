import { IPlayerScoresDto } from "../dtos/player-scores.dto";
import { IScoreByDateDto } from "../dtos/scores-by-date.dto";
import { ISortieEventInfoDto } from "../dtos/sortie-event-info.dto";
import { IScoreByDate } from "../models/i-score-by-date";
import { IPlayerScores } from "../models/player-scores";
import { ISortieEventInfo } from "../models/sortie-event-info";


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

export const transformIPlayerKillInfoToDto = (info: ISortieEventInfo): ISortieEventInfoDto => ({
  date: info.date,
  enemyAircraft: info.enemyAircraft,
  enemyPlayer: info.enemyPlayer,
  ownAircraft: info.ownAircraft,
  playerName: info.playerName,
  serverCode: info.serverCode,
  takeOffAt: info.takeOffAt,
  url: info.url,
})

export const transformIScoresByDateToDto = (data: IScoreByDate): IScoreByDateDto => ({
  date: data.date,
  score: data.score,
  eventType: data.eventType,
})