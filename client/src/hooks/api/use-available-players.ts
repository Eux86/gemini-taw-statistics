import React from 'react';

export const useAvailablePlayers = () => {
  const [data, setData] = React.useState<string[] | undefined>(undefined);

  React.useEffect(() => {
    fetch('/api/scores/availablePlayers').then(async (response: Response) => {
      const players: string[] = await response.json();
      setData(players);
    });
  }, []);

  return [data];
};
