import React from 'react';
import { useAvailableMonths } from '../../api/use-available-months';
import Dropdown, { IDropdownOption } from '../dropdown/dropdown';
import { FiltersContext } from '../../data/filters-context';
import { changeMonthAction } from '../../data/filters-actions';
import { getMonthNameByIndex, getMonthYearFromCustomTimestring } from '../../utilities';

export const AvailableMonthsSelect: React.FunctionComponent<{}> = (props) => {
  const [data] = useAvailableMonths();
  const [options, setOptions] = React.useState<IDropdownOption[] | undefined>(undefined);
  const { dispatch } = React.useContext(FiltersContext);

  React.useEffect(() => {
    if (!data) return;
    const tempOptions = data.map(month => {
      const monthYear = getMonthYearFromCustomTimestring(month);
      const monthName = getMonthNameByIndex(+monthYear.month);
      return { 
        key: month,
        value: `${monthName} ${monthYear.year}`,
      }
    });
    const options = tempOptions.concat({ key: 'all', value: 'All Time' });
    setOptions(options);
  }, [data]);

  const onChange = React.useCallback((month: string) => dispatch(changeMonthAction(month === 'all' ? undefined : month)), [dispatch])

  React.useEffect(() => {
    dispatch(changeMonthAction(data?.[0] || ''));
  }, [dispatch, data])

  if (!options) return null;

  return (
    <Dropdown
      options={options}
      selected="0"
      onChange={onChange}
    />
  );
};

