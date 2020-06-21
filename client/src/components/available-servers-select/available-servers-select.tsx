import React from 'react';
import Dropdown, { IDropdownOption } from '../dropdown/dropdown';
import { useAvailableServers } from '../../hooks/api/use-available-servers';
import { FiltersContext } from '../../data/filters-context';
import { changeServerCodeAction } from '../../data/filters-actions';

interface IProps { }

export const AvailableServersSelect: React.FunctionComponent<IProps> = () => {
  const [data] = useAvailableServers();
  const [options, setOptions] = React.useState<IDropdownOption[] | undefined>(undefined);
  const { dispatch, state } = React.useContext(FiltersContext);

  React.useEffect(() => {
    const tempOptions = data?.map((server) => ({ key: server, value: server })) || [];
    const optionsInt = [{ key: 'all', value: 'All Servers' }].concat(tempOptions);
    setOptions(optionsInt);
  }, [data]);

  const onChange = React.useCallback((serverCode: string) => dispatch(changeServerCodeAction(serverCode === 'all' ? undefined : serverCode)), [dispatch]);

  if (!options) return null;

  return (
    <Dropdown
      options={options}
      selected={state.serverCode ?? 'all'}
      onChange={onChange}
    />
  );
};
