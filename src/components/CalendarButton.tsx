import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FaCalendarPlus, FaApple, FaGoogle } from "react-icons/fa";
import { FiCalendar } from "react-icons/fi";
import dayjs from "../utils/date";
import { convertToIANATimezone } from "../utils/timeFormat";

interface CalendarButtonProps {
  eventName: string;
  competitionTitle: string;
  date: string;
  time: string;
  timezone?: string;
  eventUrl: string;
  officialUrl?: string;
  competitionType?: string;
}

const CalendarButton: React.FC<CalendarButtonProps> = ({
  eventName,
  competitionTitle,
  date,
  time,
  timezone,
  eventUrl,
  officialUrl,
  competitionType,
}) => {
  // Create Google Calendar Link
  const createGoogleCalendarLink = () => {
    // Convert timezone if needed
    const ianaTimezone = timezone ? convertToIANATimezone(timezone) : "UTC";

    // Create start time
    const startDateTime = dayjs.tz(
      `${date} ${time}`,
      "YYYY-MM-DD HH:mm:ss",
      ianaTimezone
    );

    // End time (default to 30 minutes later)
    const endDateTime = startDateTime.add(30, "minutes");

    // Format dates for Google Calendar - using UTC time to ensure exact time
    const start = startDateTime.utc().format("YYYYMMDDTHHmmss") + "Z";
    const end = endDateTime.utc().format("YYYYMMDDTHHmmss") + "Z";

    // Create event details
    const title = encodeURIComponent(`${eventName} - ${competitionTitle}`);

    let detailsText = `Be sure to check for any changes to the start order and results:`;
    detailsText += `<br><a href="${eventUrl}"><b>Skater Stats</b></a>`;

    // Add official results URL if available
    if (officialUrl) {
      detailsText += ` | <a href="${officialUrl}">Official Start Order & Results</a>`;
    }

    const details = encodeURIComponent(detailsText);
    // Use competition title as location
    const location = encodeURIComponent(competitionTitle || "");

    // Additional calendar parameters:
    // - crm: 15 (15-minute reminder)
    // - trp: true (show as busy/blocking time)
    // - color: 1 (lavender color for the event)

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}&crm=15&trp=true&color=1&sf=true&output=xml`;
  };

  // Create .ics file for iOS and other platforms
  const createICSFile = () => {
    // Convert timezone if needed
    const ianaTimezone = timezone ? convertToIANATimezone(timezone) : "UTC";

    // Create start and end times
    const startDateTime = dayjs.tz(
      `${date} ${time}`,
      "YYYY-MM-DD HH:mm:ss",
      ianaTimezone
    );

    const endDateTime = startDateTime.add(30, "minutes");

    // Format for iCal - ensure we preserve the exact time, not rounding to nearest hour
    const formatForICal = (dt: dayjs.Dayjs) => {
      // Format in UTC time as per iCalendar spec
      return dt.utc().format("YYYYMMDDTHHmmss") + "Z";
    };

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `SUMMARY:${eventName} - ${competitionTitle}`,
      `DTSTART:${formatForICal(startDateTime)}`,
      `DTEND:${formatForICal(endDateTime)}`,
      `LOCATION:${competitionTitle || ""}`,
      `DESCRIPTION:Be sure to check for any changes to the start order and results:\\n\\nSkater Stats: ${eventUrl}${
        officialUrl
          ? `\\n\\nOfficial Start Order & Results: ${officialUrl}`
          : ""
      }`,
      "BEGIN:VALARM",
      "TRIGGER:-PT15M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Reminder",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
  };

  // Handle downloading ICS file
  const downloadICSFile = () => {
    const icsData = createICSFile();
    if (!icsData) return;

    // Create element and trigger download
    const element = document.createElement("a");
    element.setAttribute("href", icsData);
    element.setAttribute("download", `${eventName || "Event"}.ics`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // For Apple Calendar (iOS)
  const addToAppleCalendar = () => {
    const icsData = createICSFile();
    if (icsData) {
      window.open(icsData);
    }
  };

  // For Outlook.com calendar
  const addToOutlookCalendar = () => {
    const ianaTimezone = timezone ? convertToIANATimezone(timezone) : "UTC";
    const startDateTime = dayjs.tz(
      `${date} ${time}`,
      "YYYY-MM-DD HH:mm:ss",
      ianaTimezone
    );
    const endDateTime = startDateTime.add(30, "minutes");

    // Format using ISO 8601 for exact time
    const start = startDateTime.toISOString();
    const end = endDateTime.toISOString();

    const title = encodeURIComponent(`${eventName} - ${competitionTitle}`);
    const location = encodeURIComponent(competitionTitle || "");

    let description = encodeURIComponent(
      `Be sure to check for any changes to the start order and results:\n\nSkater Stats: ${eventUrl}`
    );

    if (officialUrl) {
      description += encodeURIComponent(`\n\nOfficial Results: ${officialUrl}`);
    }

    const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&location=${location}&body=${description}&path=%2Fcalendar%2Faction%2Fcompose&rru=addevent`;

    window.open(outlookUrl, "_blank");
  };

  return (
    <Menu>
      <Tooltip label="Add to Calendar">
        <MenuButton
          as={IconButton}
          aria-label="Add to Calendar"
          icon={<FaCalendarPlus />}
          variant="ghost"
          colorScheme="blue"
        />
      </Tooltip>
      <MenuList>
        <MenuItem
          icon={<FaGoogle />}
          onClick={() => window.open(createGoogleCalendarLink(), "_blank")}
        >
          Google Calendar
        </MenuItem>
        <MenuItem icon={<FaApple />} onClick={addToAppleCalendar}>
          Apple Calendar
        </MenuItem>
        <MenuItem icon={<FiCalendar />} onClick={addToOutlookCalendar}>
          Outlook Calendar
        </MenuItem>
        <MenuItem icon={<FiCalendar />} onClick={downloadICSFile}>
          Download .ics File
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default CalendarButton;
