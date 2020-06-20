import { IFiltersStore } from './filters-context';
import { FiltersActions } from './filters-actions';

export const filtersReducer = (state: IFiltersStore, action: FiltersActions): IFiltersStore => {
  switch (action.type) {
    case 'change-date-from':
      return {
        ...state,
        from: action.payload.dateFrom,
      };
    case 'change-date-to':
      return {
        ...state,
        to: action.payload.dateTo,
      };
    case 'change-serverCode-action':
      return {
        ...state,
        serverCode: action.payload.serverCode,
      };
    default:
      return state;
  }
};
