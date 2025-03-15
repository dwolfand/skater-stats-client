import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Text, Tooltip } from "@chakra-ui/react";
import React from "react";

dayjs.extend(timezone);
dayjs.extend(utc);

// Convert US timezone abbreviations to IANA timezone names
export function convertToIANATimezone(timezone: string): string {
  const timezoneMap: { [key: string]: string } = {
    EDT: "America/New_York",
    EST: "America/New_York",
    ET: "America/New_York",
    CDT: "America/Chicago",
    CST: "America/Chicago",
    CT: "America/Chicago",
    MDT: "America/Denver",
    MST: "America/Denver",
    MT: "America/Denver",
    PDT: "America/Los_Angeles",
    PST: "America/Los_Angeles",
    PT: "America/Los_Angeles",
  };
  return timezoneMap[timezone] || timezone;
}

export function formatEventTime(
  date: string,
  time: string,
  timezone: string | undefined
) {
  if (!timezone) {
    return dayjs(`2000-01-01 ${time}`).format("h:mm A");
  }

  // Get local timezone
  const localTimezone = dayjs.tz.guess();

  // Convert timezone if needed
  const ianaTimezone = convertToIANATimezone(timezone);

  // If timezones match, just return the time
  if (ianaTimezone === localTimezone) {
    return dayjs(`2000-01-01 ${time}`).format("h:mm A");
  }

  // Create the time in the competition's timezone
  const competitionTime = dayjs.tz(
    `${date} ${time}`,
    "YYYY-MM-DD HH:mm:ss",
    ianaTimezone
  );

  // Convert to local time
  const localTime = competitionTime.tz(localTimezone);

  // Format the display times
  const eventTimeDisplay = competitionTime.format("h:mm A");
  const localTimeDisplay = localTime.format("h:mm A");

  // Only show local time if it's different
  if (eventTimeDisplay !== localTimeDisplay) {
    return (
      <Tooltip label={`${localTimeDisplay} your time`}>
        <Text as="span">
          {eventTimeDisplay}{" "}
          <Text as="span" fontSize="sm" color="gray.500">
            ({localTimeDisplay} local)
          </Text>
        </Text>
      </Tooltip>
    );
  }

  return eventTimeDisplay;
}
