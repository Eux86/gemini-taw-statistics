
interface IAction {
  type: string;
}

interface IChangeMonthAction extends IAction {
  type: 'change-month-action',
  payload: {
    month?: string;
  }
}

interface IChangeServerCodeAction extends IAction {
  type: 'change-serverCode-action',
  payload: {
    serverCode?: string;
  }
}

export const changeMonthAction = (month?: string): IChangeMonthAction => ({
  type: 'change-month-action',
  payload: {
    month: month,
  }
});

export const changeServerCodeAction = (serverCode?: string): IChangeServerCodeAction => ({
  type: 'change-serverCode-action',
  payload: {
    serverCode: serverCode
  }
});

export type FiltersActions = IAction & (
  IChangeMonthAction |
  IChangeServerCodeAction
)