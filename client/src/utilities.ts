export const getMonthNameByIndex = (index: number) => {
  const monthsName = new Array();
  monthsName[0] = "January";
  monthsName[1] = "February";
  monthsName[2] = "March";
  monthsName[3] = "April";
  monthsName[4] = "May";
  monthsName[5] = "June";
  monthsName[6] = "July";
  monthsName[7] = "August";
  monthsName[8] = "September";
  monthsName[9] = "October";
  monthsName[10] = "November";
  monthsName[11] = "December";
  return monthsName[index];
}

export const getMonthYearFromCustomTimestring = (timestring: string) => ({
  month: timestring.split('-')[0],
  year: timestring.split('-')[1],
});