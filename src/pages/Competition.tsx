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
} from "@chakra-ui/react";
import { getCompetitionData } from "../api/client";
import { useQuery } from "@tanstack/react-query";
import dayjs, { DATE_FORMATS } from "../utils/date";
import FavoriteButton from "../components/FavoriteButton";

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

function Card({ children }: { children: React.ReactNode }) {
  const styles = useStyleConfig("Box", { variant: "card" });
  return <Box __css={styles}>{children}</Box>;
}

export default function Competition() {
  const { year, ijsId } = useParams<{ year: string; ijsId: string }>();

  const {
    data: competition,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["competition", year, ijsId],
    queryFn: () => getCompetitionData(year!, ijsId!),
    enabled: !!(year && ijsId),
  });

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
            {dayjs(competition.startDate).format(DATE_FORMATS.DISPLAY)} -{" "}
            {dayjs(competition.endDate).format(DATE_FORMATS.DISPLAY)}
            {competition.timezone && ` (${competition.timezone})`}
          </Text>
          <Text color="gray.600">
            {[competition.venue, competition.city, competition.state]
              .filter(Boolean)
              .join(", ")}
          </Text>
        </Box>
      </Card>

      <Grid templateColumns={{ md: "repeat(2, 1fr)" }} gap={8} mt={8}>
        {competition.events.length > 0 ? (
          <Box>
            <Heading size="lg" mb={4}>
              IJS Events
            </Heading>
            <VStack align="stretch" spacing={4}>
              {competition.events.map((event: Event, index: number) => (
                <Link
                  key={index}
                  as={RouterLink}
                  to={`/competition/${competition.year}/${
                    competition.ijsId
                  }/event/${encodeURIComponent(event.resultsUrl || "")}`}
                  _hover={{ textDecoration: "none" }}
                >
                  <Card>
                    <Heading size="md" mb={2}>
                      {event.name}
                    </Heading>
                    <Text color="gray.600">
                      {dayjs(event.date).format(DATE_FORMATS.DISPLAY)} at{" "}
                      {dayjs(`2000-01-01 ${event.time}`).format("h:mm A")}
                    </Text>
                    <Text color="gray.600">Status: {event.status}</Text>
                  </Card>
                </Link>
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
              {competition.sixEvents.map((event: SixEvent, index: number) => (
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
