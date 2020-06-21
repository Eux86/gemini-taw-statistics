import React from 'react';
import { useAvailableMonths } from '../../hooks/api/use-available-months';
import Dropdown, { IDropdownOption } from '../dropdown/dropdown';
import { FiltersContext } from '../../data/filters-context';
import { changeDateFromAction, changeDateToAction } from '../../data/filters-actions';
import { getMonthNameByIndex, getMonthYearFromCustomTimestring } from '../../utilities';
import { getStartEndMonthByDate } from '../../utils/dates';

export const AvailableMonthsSelect: React.FunctionComponent<{}> = () => {
  const [data] = useAvailableMonths();
  const [options, setOptions] = React.useState<IDropdownOption[] | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = React.useState<string | undefined>(options?.[0].key);
  const { dispatch } = React.useContext(FiltersContext);

  // React.useEffect(() => {
  //   if (!options) return;
  //   setSelectedMonth(options[0].key);
  // }, [options]);

  React.useEffect(() => {
    if (!data) return;
    const tempOptions = data.map((month) => {
      const monthYear = getMonthYearFromCustomTimestring(month);
      const monthName = getMonthNameByIndex(+monthYear.month);
      return {
        key: month,
        value: `${monthName} ${monthYear.year}`,
      };
    });
    const optionsInt = tempOptions.concat({ key: 'all', value: 'All Time' });
    setOptions(optionsInt);
  }, [data]);

  const onChange = React.useCallback((month: string) => {
    setSelectedMonth(month);
  }, []);

  React.useEffect(() => {
    if (!selectedMonth) return;
    let firstDate: Date = new Date();
    let lastDate: Date = new Date();
    if (selectedMonth === 'all') {
      const today = new Date();
      const threeMontsAgo = new Date();
      threeMontsAgo.setMonth(today.getMonth() - 3);
      firstDate = threeMontsAgo;
      lastDate = today;
    } else {
      const monthYear = getMonthYearFromCustomTimestring(selectedMonth);
      const date = new Date(+monthYear.year, +(monthYear.month), 1);
      const { firstDate: start, lastDate: end } = getStartEndMonthByDate(date);
      firstDate = start;
      lastDate = end;
    }
    dispatch(changeDateFromAction(firstDate));
    dispatch(changeDateToAction(lastDate));
  }, [dispatch, selectedMonth]);

  if (!options) return null;

  return (
    <Dropdown
      options={options}
      selected={selectedMonth ?? '0'}
      onChange={onChange}
    />
  );
};
