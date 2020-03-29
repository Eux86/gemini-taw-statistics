export interface IPlayerScoresDto {
  name: string;
  airKills: number;
  groundKills: number;
  streakAk: number;
  streakGk: number;
  deaths: number;
  sorties: number;
  flightTimeMinutes: number;
  updateDate: string;
  serverCode: string;
}