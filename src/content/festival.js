// Is the festival section live right now? (switch on + inside the date range)
// Dates are "YYYY-MM-DD"; the end date counts as a full day.
export function getFestivalStatus(festival, now = new Date()) {
  if (!festival?.enabled) return "off";

  const today = now.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
  if (festival.startDate && today < festival.startDate) return "scheduled";
  if (festival.endDate && today > festival.endDate) return "ended";
  return "live";
}

export const FESTIVAL_STATUS_TEXT = {
  off: "Hidden — switched off",
  scheduled: "Scheduled — will appear on the start date",
  ended: "Hidden — the end date has passed",
  live: "LIVE on the website now",
};
