import { IPlayerScores } from "../business-models/player-scores";
import { IPlayerScoresDto } from "../dtos/player-scores.dto";
import { ISortieEventInfo } from "../business-models/sortie-event-info";
import { ISortieEventInfoDto } from "../dtos/sortie-event-info.dto";


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

export const transformIPlayerKillInfoToDto = (info: ISortieEventInfo): ISortieEventInfoDto => {
  return {
    date: info.date,
    enemyAircraft: info.enemyAircraft,
    enemyPlayer: info.enemyPlayer,
    ownAircraft: info.ownAircraft,
    playerName: info.playerName,
    serverCode: info.serverCode,
    takeOffAt: info.takeOffAt,
  } as ISortieEventInfoDto
}