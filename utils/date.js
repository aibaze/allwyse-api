const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");

dayjs.extend(utc);

function getCurrentWeek() {
  const currentDate = new Date();

  // Get the current day of the week (0-6, where 0 is Sunday and 6 is Saturday)
  const currentDay = currentDate.getDay();

  // Calculate the start of the week (Sunday)
  const weekStartDate = new Date(currentDate);
  weekStartDate.setDate(currentDate.getDate() - currentDay);
  weekStartDate.setHours(0, 0, 0, 0); // Set time to midnight

  // Calculate the end of the week (Saturday)
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999); // Set time to the end of the day

  return {
    weekStartDate: weekStartDate,
    weekEndDate: weekEndDate,
  };
}

function getCurrentDayBounds() {
  const currentDate = new Date();

  // Get the start of the current day (midnight)
  const startOfDay = new Date(currentDate);
  startOfDay.setHours(0, 0, 0, 0); // Set time to midnight

  // Get the end of the current day (just before midnight)
  const endOfDay = new Date(currentDate);
  endOfDay.setHours(23, 59, 59, 999); // Set time to the end of the day

  return {
    startOfDay: startOfDay,
    endOfDay: endOfDay,
  };
}

const getStartAndEndOfCurrentMonth = () => {
  const startOfMonth = dayjs().startOf("month").toDate();
  const endOfMonth = dayjs().endOf("month").toDate();

  return { startOfMonth, endOfMonth };
};

function getFirstDateOfNextYearISO() {
  const today = dayjs();
  const currentYear = today.year();
  const currentMonth = today.month(); // 0-indexed: 0 for January, 11 for December

  // Determine the target year
  const targetYear = currentMonth > 7 ? currentYear + 2 : currentYear + 1;

  // Create a Day.js object for January 1st of the target year
  const firstDateOfNextYear = dayjs(`${targetYear}-01-01`);

  // Return the date as an ISO 8601 string
  return firstDateOfNextYear.toISOString();
}

const isoDateToUTCisoDate = (isoDate) => {
  if (!isoDate) return null;
  const utcDate = dayjs(isoDate).utc().toISOString();
  return utcDate;
};

module.exports = {
  getCurrentWeek,
  getCurrentDayBounds,
  getStartAndEndOfCurrentMonth,
  getFirstDateOfNextYearISO,
  isoDateToUTCisoDate,
};
