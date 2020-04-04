import React from 'react';
import { useAvailableMonths } from '../../api/use-available-months';
import Dropdown, { IDropdownOption } from '../dropdown/dropdown';

export const AvailableMonthsSelect: React.FunctionComponent<{}> = (props) => {
  const [data] = useAvailableMonths();
  const [options, setOptions] = React.useState<IDropdownOption[] | undefined>(undefined);
  React.useEffect(() => {
    const options = data?.map(month => ({ key: month, value: month }));
    setOptions(options);
  }, [data]);

  if (!options) return null;
  
  return (
    <Dropdown
      options={options}
      selected="0"
    />
  );
};

