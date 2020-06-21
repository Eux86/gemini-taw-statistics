import React from 'react';
import Dropdown, { IDropdownOption } from '../dropdown/dropdown';
import { FiltersContext } from '../../data/filters-context';
import { changePlayerNameAction } from '../../data/filters-actions';
import { useAvailablePlayers } from '../../hooks/api/use-available-players';

interface IProps { }

export const AvailablePlayersSelect: React.FunctionComponent<IProps> = () => {
  const [data] = useAvailablePlayers();
  const [options, setOptions] = React.useState<IDropdownOption[] | undefined>(undefined);
  const { dispatch, state } = React.useContext(FiltersContext);

  React.useEffect(() => {
    const tempOptions = data?.map((player) => ({ key: player, value: player })) || [];
    const optionsInt = [{ key: 'all', value: 'All Players' }].concat(tempOptions);
    setOptions(optionsInt);
  }, [data]);

  const onChange = React.useCallback((playerName: string) => dispatch(changePlayerNameAction(playerName === 'all' ? undefined : playerName)), [dispatch]);

  if (!options) return null;

  return (
    <Dropdown
      options={options}
      selected={state.playerName ?? 'all'}
      onChange={onChange}
    />
  );
};
