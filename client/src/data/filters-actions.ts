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

interface IChangePlayerNameAction extends IAction {
  type: 'change-player-name-action',
  payload: {
    playerName?: string;
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

export const changePlayerNameAction = (playerName?: string): IChangePlayerNameAction => ({
  type: 'change-player-name-action',
  payload: {
    playerName,
  },
});

export type FiltersActions = IAction & (
  IChangeDateFromAction |
  IChangeDateToAction |
  IChangeServerCodeAction |
  IChangePlayerNameAction
)
