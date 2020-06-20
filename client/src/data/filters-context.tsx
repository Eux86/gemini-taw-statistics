import React, { createContext, Dispatch, useReducer } from 'react';
import { FiltersActions } from './filters-actions';
import { filtersReducer } from './filters-reducers';
import { getStartEndMonthByDate } from '../utils/dates';

export interface IFiltersStore {
  from?: Date,
  to?: Date,
  serverCode?: string;
}

const date = new Date();
const { firstDate, lastDate } = getStartEndMonthByDate(date);

const initialState: IFiltersStore = {
  from: firstDate,
  to: lastDate,
  serverCode: undefined,
};

const FiltersContext = createContext<{
  state: IFiltersStore;
  dispatch: Dispatch<FiltersActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

const FiltersProvider: React.FunctionComponent<{}> = ({ children }) => {
  const [state, dispatch] = useReducer(filtersReducer, initialState);
  return (
    <FiltersContext.Provider value={{ state, dispatch }}>
      {children}
    </FiltersContext.Provider>
  );
};

export { FiltersProvider, FiltersContext };
