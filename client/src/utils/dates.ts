export const getStartEndMonthByDate = (date: Date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const firstDate = new Date(y, m, 1);
  const lastDate = new Date(y, m + 1, 0);
  return { firstDate, lastDate };
};
