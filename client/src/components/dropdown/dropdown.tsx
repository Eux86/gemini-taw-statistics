import React from 'react';
import './style.css';

export interface IDropdownOption {
  key: string;
  value: string;
}

interface IProps {
  selected: string;
  options: Array<IDropdownOption>;
  onChange?: (value: string) => void;
}

const Dropdown: React.FunctionComponent<IProps> = (props) => {
  const {
    options,
    onChange,
    selected,
  } = props;

  return (
    <div className="wrapper">
      <select
        onChange={(event) => onChange && onChange(event.target.value)}
      >
        {options && options.map((option: IDropdownOption) => <option selected={selected === option.key} key={option.key} value={option.key}>{option.value}</option>)}
      </select>
      <svg height="24" role="img" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.984 6.19l9.465 9.893c.28.299.418.397.551.397.145 0 .31-.114.572-.392l9.443-9.898.962.918-9.439 9.893a2.108 2.108 0 01-1.538.81 2.083 2.083 0 01-1.517-.813l-9.46-9.889z" />
      </svg>
    </div>
  );
};
export default Dropdown;
