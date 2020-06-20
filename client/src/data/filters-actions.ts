interface IAction {
  type: string;
}

interface IChangeDateFromAction extends IAction {
  type: 'change-date-from',
  payload: {
    dateFrom?: Date;
  }
}

interface IChangeDateToAction extends IAction {
  type: 'change-date-to',
  payload: {
    dateTo?: Date;
  }
}

interface IChangeServerCodeAction extends IAction {
  type: 'change-serverCode-action',
  payload: {
    serverCode?: string;
  }
}

export const changeDateFromAction = (dateFrom?: Date): IChangeDateFromAction => ({
  type: 'change-date-from',
  payload: {
    dateFrom,
  },
});

export const changeDateToAction = (dateTo?: Date): IChangeDateToAction => ({
  type: 'change-date-to',
  payload: {
    dateTo,
  },
});

export const changeServerCodeAction = (serverCode?: string): IChangeServerCodeAction => ({
  type: 'change-serverCode-action',
  payload: {
    serverCode,
  },
});

export type FiltersActions = IAction & (
  IChangeDateFromAction |
  IChangeDateToAction |
  IChangeServerCodeAction
)
