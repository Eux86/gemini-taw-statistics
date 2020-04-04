import React from 'react';

export const useAvailableServers = () => {
  const [data, setData] = React.useState<string[] | undefined>(undefined);
  
  React.useEffect(() => {
    fetch('/api/scores/availableServers').then(async (response: Response) => {
      const scores: string[] = await response.json();
      setData(scores);
    });
  }, []);

  return [data];
}