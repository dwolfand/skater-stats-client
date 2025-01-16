import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

// Configure plugins
dayjs.extend(utc);

// Common date formats used in the application
export const DATE_FORMATS = {
  DISPLAY: "MMM D, YYYY",
  ISO: "YYYY-MM-DD",
  FULL: "MMMM D, YYYY",
  SHORT: "MM/DD/YY",
};

// Export configured dayjs instance
export default dayjs;
