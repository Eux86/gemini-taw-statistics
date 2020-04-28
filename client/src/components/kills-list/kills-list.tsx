import { ISortieEventInfoDto } from 'gemini-statistics-api/build/dtos/sortie-event-info.dto';
import React from 'react';
import { getMonthNameByIndex } from '../../utilities';
import './style.css';

const AimIcon = () => (
  <svg version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 502 502" width="30px">
    <g>
      <path d="M492,240.641h-28.648c-5.013-109.268-92.955-197.258-202.204-202.346V10c0-5.523-4.477-10-10-10s-10,4.477-10,10v28.295     C131.9,43.383,43.958,131.373,38.945,240.641H10c-5.523,0-10,4.477-10,10s4.477,10,10,10h28.956     c5.159,109.131,93.042,196.966,202.192,202.049V492c0,5.523,4.477,10,10,10s10-4.477,10-10v-29.309     c109.15-5.084,197.033-92.919,202.192-202.049H492c5.523,0,10-4.477,10-10S497.523,240.641,492,240.641z M241.148,58.311v30.797     c-81.264,4.983-146.484,70.25-151.394,151.533H58.958C63.936,142.402,142.929,63.363,241.148,58.311z M241.148,442.674     c-98.12-5.047-177.05-83.932-182.172-182.033h30.797c5.051,81.145,70.211,146.259,151.375,151.236V442.674z M251.148,329.79     c-5.523,0-10,4.477-10,10v52.049c-70.132-4.914-126.35-61.084-131.336-131.197h52.398c5.523,0,10-4.477,10-10s-4.477-10-10-10     h-52.417c4.848-70.251,61.124-126.573,131.355-131.494v53.063c0,5.523,4.477,10,10,10c5.523,0,10-4.477,10-10v-53.063     c73.486,5.149,131.703,66.573,131.703,141.346S334.635,386.69,261.148,391.838V339.79     C261.148,334.267,256.671,329.79,251.148,329.79z M261.148,442.675v-30.797c81.164-4.977,146.325-70.091,151.375-151.236h30.797     C438.199,358.742,359.269,437.627,261.148,442.675z M412.543,240.641c-4.91-81.283-70.131-146.55-151.394-151.533V58.311     c98.219,5.052,177.212,84.091,182.19,182.33H412.543z" />
      <path d="M339.79,260.641H360c5.523,0,10-4.477,10-10s-4.477-10-10-10h-20.21c-5.523,0-10,4.477-10,10     S334.267,260.641,339.79,260.641z" />
    </g>
  </svg>
)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  let month: string = getMonthNameByIndex(date.getMonth());
  month = (+month < 10 ? '0' : '') + month;
  let day: string = '' + (date.getDate());
  day = (+day < 10 ? '0' : '') + day;
  let hours = '' + date.getHours();
  hours = (+hours < 10 ? '0' : '') + hours;
  let min = '' + date.getMinutes();
  min = (+min < 10 ? '0' : '') + min;
  return `${day} ${month} ${hours}:${min}`
}


const KillInfo = ({ data, color }: { data: ISortieEventInfoDto; color: string }) => (
  <tr onClick={() => window.open(data.url, "_blank")}>
    <td>{formatDate(data.date)}<br /><small>({data.serverCode})</small></td>
    <td>{data.playerName}<br />({data.ownAircraft})</td>
    <td><span className="aim-icon" style={{ fill: color }}><AimIcon /></span></td>
    <td>{data.enemyPlayer}<br />({data.enemyAircraft})</td>
  </tr>
)

export const KillsList: React.FunctionComponent<{ kills: ISortieEventInfoDto[], color: string }> = ({ kills, color }) => {
  return (
    <div className="kills-list">
      <table>
        {kills.map((killInfo) => (
          <KillInfo data={killInfo} color={color} />
        ))}
      </table>
    </div>
  )
}