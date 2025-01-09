import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  Box,
  Container,
  Heading,
  Text,
  Grid,
  GridItem,
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
  BarChart,
  Bar,
  Legend,
  ScatterChart,
  Scatter,
} from "recharts";
import { getSkaterStats } from "../api/client";

export default function Skater() {
  const { name } = useParams<{ name: string }>();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["skater", name],
    queryFn: () => getSkaterStats(name!),
    enabled: !!name,
  });

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

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="xl" mb={2}>
            Results for {decodeURIComponent(name!)}
          </Heading>
          {stats.name !== decodeURIComponent(name!) && (
            <Text color="gray.600" mb={2}>
              Showing results for "{stats.name}"
            </Text>
          )}
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
            <StatLabel>Average Score</StatLabel>
            <StatNumber>{Number(stats.averageScore).toFixed(2)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Personal Best</StatLabel>
            <StatNumber>{Number(stats.personalBest).toFixed(2)}</StatNumber>
            {stats.personalBestEvent && (
              <Text fontSize="sm" color="gray.600">
                {stats.personalBestEvent.competition} (
                {dayjs(stats.personalBestEvent.date).format("MMM D, YYYY")})
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

        {/* Placement Distribution Chart */}
        <Box>
          <Heading size="md" mb={4}>
            Placement Distribution
          </Heading>
          <Box h="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.placementDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Number of Times" />
              </BarChart>
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
