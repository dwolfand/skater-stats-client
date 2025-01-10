import { useState, useEffect } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Heading, Text, Grid, VStack, Link } from "@chakra-ui/react";
import { getCompetitionData } from "../api/client";
import { useQuery } from "@tanstack/react-query";

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
      <Box p={8}>
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (error || !competition) {
    return (
      <Box p={8}>
        <Text color="red.500">
          Error: {error ? String(error) : "Competition not found"}
        </Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={4}>{competition.name}</Heading>
      <Box mb={8}>
        <Text color="gray.600">
          {new Date(competition.startDate).toLocaleDateString()} -{" "}
          {new Date(competition.endDate).toLocaleDateString()} (
          {competition.timezone})
        </Text>
        <Text color="gray.600">
          {competition.venue}, {competition.city}, {competition.state}
        </Text>
      </Box>

      <Grid templateColumns={{ md: "repeat(2, 1fr)" }} gap={8}>
        {competition.events.length > 0 && (
          <Box>
            <Heading size="lg" mb={4}>
              Events
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
                  <Box
                    p={4}
                    borderWidth={1}
                    borderRadius="lg"
                    _hover={{ bg: "gray.50" }}
                  >
                    <Heading size="md" mb={2}>
                      {event.name}
                    </Heading>
                    <Text color="gray.600">
                      {new Date(event.date).toLocaleDateString()} at{" "}
                      {event.time}
                    </Text>
                    <Text color="gray.600">Status: {event.status}</Text>
                  </Box>
                </Link>
              ))}
            </VStack>
          </Box>
        )}

        {/* {competition.sixEvents.length > 0 && (
          <Box>
            <Heading size="lg" mb={4}>
              IJS Events
            </Heading>
            <VStack align="stretch" spacing={4}>
              {competition.sixEvents.map((event, index) => (
                <Link
                  key={index}
                  as={RouterLink}
                  to={`/competition/${competition.year}/${
                    competition.ijsId
                  }/event/${encodeURIComponent(event.resultsUrl)}`}
                  _hover={{ textDecoration: "none" }}
                >
                  <Box
                    p={4}
                    borderWidth={1}
                    borderRadius="lg"
                    _hover={{ bg: "gray.50" }}
                  >
                    <Heading size="md" mb={2}>
                      {event.name}
                    </Heading>
                    <Text color="gray.600">Segment: {event.segment}</Text>
                  </Box>
                </Link>
              ))}
            </VStack>
          </Box>
        )} */}
      </Grid>
    </Box>
  );
}
