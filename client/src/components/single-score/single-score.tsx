import React from 'react';
import './style.css';

interface IProps {
  title: string;
  value: string;
}

export const SingleScore: React.FunctionComponent<IProps> = ({ title, value }) => (
  <div className="score">
    <label className="text-primary" htmlFor="value">{title}</label>
    <p id="value">{value}</p>
  </div>
);
