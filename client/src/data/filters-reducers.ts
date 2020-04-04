import { IFiltersStore } from './filters-context';
import { FiltersActions } from './filters-actions';

export const filtersReducer = (state: IFiltersStore, action: FiltersActions) => {
  switch (action.type) {
    case 'change-month-action':
      return {
        ...state,
        month: action.payload.month,
      }
    case 'change-serverCode-action':
      return {
        ...state,
        serverCode: action.payload.serverCode,
      }
    default:
      return state;
  }
}
