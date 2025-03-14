import { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Grid,
  VStack,
  Link,
  HStack,
  Container,
  useStyleConfig,
  Badge,
  Tooltip,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { getCompetitionData } from "../api/client";
import { useQuery } from "@tanstack/react-query";
import dayjs, { DATE_FORMATS } from "../utils/date";
import FavoriteButton from "../components/FavoriteButton";
import { SearchIcon, CloseIcon } from "@chakra-ui/icons";

interface Event {
  name: string;
  date: string;
  time: string;
  status: string;
  resultsUrl: string;
}

interface SixEvent {
  name: string;
  segment: string;
  resultsUrl: string;
}

interface CompetitionDetails {
  ijsId: string;
  year: string;
  name: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue: string;
  city: string;
  state: string;
  events: Event[];
  sixEvents: SixEvent[];
}

// Convert US timezone abbreviations to IANA timezone names
function convertToIANATimezone(timezone: string): string {
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

function formatEventTime(
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

function Card({ children }: { children: React.ReactNode }) {
  const styles = useStyleConfig("Box", { variant: "card" });
  return <Box __css={styles}>{children}</Box>;
}

export default function Competition() {
  const { year, ijsId } = useParams<{ year: string; ijsId: string }>();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: competition,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["competition", year, ijsId],
    queryFn: () => getCompetitionData(year!, ijsId!),
    enabled: !!(year && ijsId),
  });

  // Filter events based on search query
  const filteredEvents =
    competition?.events.filter((event: Event) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const filteredSixEvents =
    competition?.sixEvents.filter((event: SixEvent) =>
      event.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (isLoading) {
    return (
      <Container py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (error || !competition) {
    return (
      <Container py={8}>
        <Text color="red.500">
          Error: {error ? String(error) : "Competition not found"}
        </Text>
      </Container>
    );
  }

  return (
    <Container py={8}>
      <Card>
        <HStack justify="space-between" align="center" mb={4}>
          <Heading>{competition.name}</Heading>
          <FavoriteButton
            type="competition"
            name={competition.name}
            params={{ year: year!, ijsId: ijsId! }}
          />
        </HStack>
        <Box mb={8}>
          <Text color="gray.600">
            {dayjs.utc(competition.startDate).format(DATE_FORMATS.DISPLAY)} -{" "}
            {dayjs.utc(competition.endDate).format(DATE_FORMATS.DISPLAY)}
            {competition.timezone && ` (${competition.timezone})`}
          </Text>
          <Text color="gray.600">
            {[competition.venue, competition.city, competition.state]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </Box>
      </Card>

      <Box mt={4} mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
          />
          {searchQuery && (
            <InputRightElement>
              <IconButton
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
              />
            </InputRightElement>
          )}
        </InputGroup>
      </Box>

      <Grid templateColumns={{ md: "repeat(2, 1fr)" }} gap={8} mt={8}>
        {competition.events.length > 0 ? (
          <Box>
            <Heading size="lg" mb={4}>
              IJS Events
            </Heading>
            <VStack align="stretch" spacing={4}>
              {filteredEvents.map((event: Event, index: number) => (
                <Box
                  key={index}
                  opacity={!event.resultsUrl ? 0.6 : 1}
                  position="relative"
                >
                  {event.resultsUrl ? (
                    <Link
                      as={RouterLink}
                      to={`/competition/${competition.year}/${
                        competition.ijsId
                      }/event/${encodeURIComponent(event.resultsUrl)}`}
                      _hover={{ textDecoration: "none" }}
                    >
                      <Card>
                        <Heading size="md" mb={2}>
                          {event.name}
                          <Badge
                            ml={2}
                            colorScheme={
                              event.status === "Final" ? "green" : "orange"
                            }
                          >
                            {event.status}
                          </Badge>
                        </Heading>
                        <Text color="gray.600">
                          {dayjs(event.date).format(DATE_FORMATS.DISPLAY)} at{" "}
                          {formatEventTime(
                            event.date,
                            event.time,
                            competition.timezone
                          )}
                        </Text>
                      </Card>
                    </Link>
                  ) : (
                    <Card>
                      <Heading size="md" mb={2}>
                        {event.name}
                        <Badge
                          ml={2}
                          colorScheme={
                            event.status === "Final" ? "green" : "orange"
                          }
                        >
                          {event.status}
                        </Badge>
                      </Heading>
                      <Text color="gray.600">
                        {dayjs(event.date).format(DATE_FORMATS.DISPLAY)} at{" "}
                        {formatEventTime(
                          event.date,
                          event.time,
                          competition.timezone
                        )}
                      </Text>
                      <Text color="gray.500" fontSize="sm" mt={2}>
                        Results not yet available
                      </Text>
                    </Card>
                  )}
                </Box>
              ))}
            </VStack>
          </Box>
        ) : (
          <Box>
            <Heading size="lg" mb={4}>
              IJS Events
            </Heading>
            <Text color="gray.600">No IJS events have been scheduled yet.</Text>
          </Box>
        )}

        {competition.sixEvents.length > 0 && (
          <Box>
            <Heading size="lg" mb={4}>
              6.0 Events
            </Heading>
            <VStack align="stretch" spacing={4}>
              {filteredSixEvents.map((event: SixEvent, index: number) => (
                <Link
                  key={index}
                  as={RouterLink}
                  to={`/competition/${competition.year}/${
                    competition.ijsId
                  }/six-event/${encodeURIComponent(event.resultsUrl)}`}
                  _hover={{ textDecoration: "none" }}
                >
                  <Card>
                    <Heading size="md" mb={2}>
                      {event.name}
                    </Heading>
                    <Text color="gray.600">Segment: {event.segment}</Text>
                  </Card>
                </Link>
              ))}
            </VStack>
          </Box>
        )}
      </Grid>
    </Container>
  );
}
