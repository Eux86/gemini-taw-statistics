var date = new Date(), y = date.getFullYear(), m = date.getMonth();
var firstDay = new Date(y, m, 1);
var lastDay = new Date(y, m + 1, 0);

import React from 'react';

export const useStartEndMonthFromDate = (date: Date) => {
  const [firstDay, setFirstDay] = React.useState<Date>();
  const [lastDay, setLastDay] = React.useState<Date>();
  React.useEffect(() => {
    y = date.getFullYear();
    m = date.getMonth();
    setFirstDay(new Date(y, m, 1));
    setLastDay(new Date(y, m + 1, 0));
  }, [date]);

  return {
    firstDay,
    lastDay
  }
}
