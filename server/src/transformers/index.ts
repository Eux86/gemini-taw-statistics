import { IPlayerScores } from "../business-models/player-scores";
import { IPlayerScoresDto } from "../dtos/player-scores.dto";
import { IPlayerKillInfo } from "../business-models/player-kill-info";
import { IPlayerKillInfoDto } from "../dtos/player-kill-info.dto";


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

export const transformIPlayerKillInfoToDto = (info: IPlayerKillInfo): IPlayerKillInfoDto => {
  return {
    date: info.date,
    enemyAircraft: info.enemyAircraft,
    enemyPlayer: info.enemyAircraft,
    ownAircraft: info.ownAircraft,
    playerName: info.playerName,
    serverCode: info.serverCode,
    takeOffAt: info.takeOffAt,
  } as IPlayerKillInfoDto
}