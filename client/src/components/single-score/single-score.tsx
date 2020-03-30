import React from 'react';
import './style.css';

interface IProps {
  title: string;
  value: string;
}

export const SingleScore: React.FunctionComponent<IProps> = ({title, value}) => {
  return (
    <div className="score">
      <label className="text-primary">{title}</label>
      <p>{value}</p>
    </div>
  )
}