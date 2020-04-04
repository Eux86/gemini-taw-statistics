import React, { createContext, Dispatch, useReducer } from 'react';
import { FiltersActions } from './filters-actions';
import { filtersReducer } from './filters-reducers';

export interface IFiltersStore {
  month: string;
  serverCode?: string;
}

const initialState: IFiltersStore = {
  month: '',
  serverCode: undefined,
}

const FiltersContext = createContext<{
  state: IFiltersStore;
  dispatch: Dispatch<FiltersActions>;
}>({
  state: initialState,
  dispatch: () => null,
});

const FiltersProvider: React.FunctionComponent<{}> = ({children}) => {
  const [state, dispatch] = useReducer(filtersReducer, initialState);
console.log(state);
  return (
    <FiltersContext.Provider value={{state, dispatch}}>
      {children}
    </FiltersContext.Provider>
  )
}

export { FiltersProvider, FiltersContext };