import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { SkaterStats } from "../api/client";
import dayjs from "../utils/date";
import math from "../utils/math";
import {
  Box,
  Container,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getSkaterStats } from "../api/client";

export default function Skater() {
  const { name } = useParams<{ name: string }>();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["skater", name],
    queryFn: () => getSkaterStats(name!),
    enabled: !!name,
  });

  const getMostFrequentEventTypeAndBest = (history: SkaterStats["history"]) => {
    // Count occurrences of each event type
    const eventTypeCounts = history.reduce<Record<string, number>>(
      (acc: Record<string, number>, curr: SkaterStats["history"][0]) => {
        acc[curr.eventType] = (acc[curr.eventType] || 0) + 1;
        return acc;
      },
      {}
    );

    // Find the event type with most occurrences
    const mostFrequentEventType = Object.entries(eventTypeCounts).reduce<
      [string, number]
    >(
      (max, [eventType, count]) => (count > max[1] ? [eventType, count] : max),
      ["", 0]
    )[0];

    // Get all scores for the most frequent event type
    const scores = history
      .filter(
        (h: SkaterStats["history"][0]) => h.eventType === mostFrequentEventType
      )
      .map((h: SkaterStats["history"][0]) => h.score);

    // Find the highest score and its corresponding event
    const maxScore = scores.length > 0 ? math.max(scores) : null;
    const bestEvent = history.find(
      (h: SkaterStats["history"][0]) =>
        h.eventType === mostFrequentEventType && h.score === maxScore
    );

    return {
      eventType: mostFrequentEventType,
      score: maxScore,
      event: bestEvent?.event,
      date: bestEvent?.date,
    };
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>No data found for this skater.</Text>
      </Container>
    );
  }

  const personalBest = getMostFrequentEventTypeAndBest(stats?.history || []);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Results for {decodeURIComponent(name!)}
          </Heading>
        </Box>

        {/* Key Statistics */}
        <StatGroup>
          <Stat>
            <StatLabel>Total Events</StatLabel>
            <StatNumber>{Number(stats.totalEvents)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Competitions</StatLabel>
            <StatNumber>{Number(stats.totalCompetitions)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Personal Best</StatLabel>
            <StatNumber>
              {personalBest.score
                ? Number(personalBest.score).toFixed(2)
                : "N/A"}
            </StatNumber>
            {personalBest.event && personalBest.date && (
              <Text fontSize="sm" color="gray.600">
                {personalBest.eventType} (
                {dayjs(personalBest.date).format("MMM D, YYYY")})
              </Text>
            )}
          </Stat>
        </StatGroup>

        {/* Score History Chart */}
        <Box>
          <Heading size="md" mb={4}>
            Score History
          </Heading>
          <Box h="400px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(timestamp) =>
                    dayjs(timestamp).format("MMM D, YYYY")
                  }
                  scale="time"
                />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip
                  labelFormatter={(timestamp) =>
                    dayjs(timestamp).format("MMM D, YYYY")
                  }
                  formatter={(value: any, name: string) => [
                    Number(value).toFixed(2),
                    name,
                  ]}
                  itemSorter={(item: any) => -item.value}
                />
                <Legend />
                {Array.from(new Set(stats.history.map((h) => h.eventType))).map(
                  (eventType, index) => {
                    const eventData = stats.history
                      .filter((h) => h.eventType === eventType)
                      .map((h) => ({
                        date: new Date(h.date).getTime(),
                        [eventType]: h.score,
                      }));

                    return (
                      <Line
                        key={eventType}
                        type="monotone"
                        data={eventData}
                        dataKey={eventType}
                        name={eventType}
                        stroke={`hsl(${index * 60}, 70%, 50%)`}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls
                      />
                    );
                  }
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* All Results */}
        <Box>
          <Heading size="md" mb={4}>
            All Results
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Event</Th>
                <Th isNumeric>Score</Th>
                <Th isNumeric>Placement</Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.history.map((result, index) => (
                <Tr key={index}>
                  <Td>{dayjs(result.date).format("MMM D, YYYY")}</Td>
                  <Td>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium">{result.event}</Text>
                      <Text fontSize="sm" color="gray.600">
                        {result.competition}
                      </Text>
                    </VStack>
                  </Td>
                  <Td isNumeric>{Number(result.score).toFixed(2)}</Td>
                  <Td isNumeric>{result.placement}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
}
