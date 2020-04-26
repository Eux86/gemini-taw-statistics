import React from 'react';
import { useAvailableMonths } from '../../hooks/api/use-available-months';
import Dropdown, { IDropdownOption } from '../dropdown/dropdown';
import { FiltersContext } from '../../data/filters-context';
import { changeDateFromAction, changeDateToAction } from '../../data/filters-actions';
import { getMonthNameByIndex, getMonthYearFromCustomTimestring } from '../../utilities';
import { getStartEndMonthByDate } from '../../utils/dates';

export const AvailableMonthsSelect: React.FunctionComponent<{}> = (props) => {
  const [data] = useAvailableMonths();
  const [options, setOptions] = React.useState<IDropdownOption[] | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = React.useState<string>();
  const { dispatch, state } = React.useContext(FiltersContext);

  React.useEffect(() => {
    if (!options) return;
    setSelectedMonth(options[0].key);
  }, [options])

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

  const onChange = React.useCallback((month: string) => {
    setSelectedMonth(month);
  }, [dispatch]);

  React.useEffect(() => {
    if (!selectedMonth) return;
    const monthYear = getMonthYearFromCustomTimestring(selectedMonth);
    const date = new Date(+monthYear.year, +(monthYear.month), 1);
    const { firstDate, lastDate } = getStartEndMonthByDate(date);
    dispatch(changeDateFromAction(firstDate));
    dispatch(changeDateToAction(lastDate));
  }, [dispatch, selectedMonth])

  if (!options) return null;

  return (
    <Dropdown
      options={options}
      selected="0"
      onChange={onChange}
    />
  );
};

