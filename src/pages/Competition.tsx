import { useState } from "react";
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
import { formatEventTime } from "../utils/timeFormat";

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
  logoRef: string | null;
  events: Event[];
  sixEvents: SixEvent[];
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
    <>
      <Box
        bg="rgba(255, 255, 255, 0.9)"
        borderBottom="1px solid"
        borderColor="gray.100"
        mb={6}
      >
        <Container py={{ base: 4, md: 6 }}>
          <HStack
            justify="space-between"
            align="center"
            spacing={{ base: 2, md: 6 }}
          >
            {competition.logoRef && (
              <Box
                flexShrink={0}
                width={{ base: "80px", md: "120px" }}
                height={{ base: "80px", md: "120px" }}
                display="flex"
                alignItems="center"
              >
                <img
                  src={competition.logoRef}
                  alt={`${competition.name} logo`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            )}
            <Box flex="1">
              <HStack
                justify="space-between"
                align="center"
                mb={{ base: 2, md: 4 }}
                spacing={{ base: 2, md: 4 }}
              >
                <Heading size={{ base: "md", md: "lg" }}>
                  {competition.name}
                </Heading>
                <Box flexShrink={0} ml={{ base: -1, md: 0 }}>
                  <FavoriteButton
                    type="competition"
                    name={competition.name}
                    params={{ year: year!, ijsId: ijsId! }}
                  />
                </Box>
              </HStack>
              <Box>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                  {dayjs
                    .utc(competition.startDate)
                    .format(DATE_FORMATS.DISPLAY)}{" "}
                  -{" "}
                  {dayjs.utc(competition.endDate).format(DATE_FORMATS.DISPLAY)}
                  {competition.timezone && ` (${competition.timezone})`}
                </Text>
                <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
                  {[competition.venue, competition.city, competition.state]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </Box>
            </Box>
          </HStack>
        </Container>
      </Box>

      <Container>
        <Box mt={2} mb={6}>
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
                          <Heading size="md" mb={2} fontWeight="medium">
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
                        <Heading size="md" mb={2} fontWeight="medium">
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
              <Text color="gray.600">
                No IJS events have been scheduled yet.
              </Text>
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
                      <Heading size="md" mb={2} fontWeight="medium">
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
    </>
  );
}
