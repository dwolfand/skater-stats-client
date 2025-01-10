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
  Collapse,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
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
import JudgeCard from "../components/JudgeCard";

interface ExpandableRowProps {
  result: SkaterStats["history"][0];
}

function getOrdinalSuffix(placement: string): string {
  const num = parseInt(placement, 10);
  if (isNaN(num)) return "";
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return "th";
  switch (lastDigit) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

function ExpandableRow({ result }: ExpandableRowProps) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Tr cursor="pointer" onClick={onToggle} _hover={{ bg: "gray.50" }}>
        <Td>
          <IconButton
            aria-label="Expand row"
            icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          />
        </Td>
        <Td display={{ base: "none", md: "table-cell" }}>
          {dayjs(result.date).format("MMM D, YYYY")}
        </Td>
        <Td>
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium">{result.event}</Text>
            <Text fontSize="sm" color="gray.600">
              {result.competition}
            </Text>
            <Text
              display={{ base: "block", md: "none" }}
              fontSize="sm"
              color="gray.500"
            >
              {dayjs(result.date).format("MMM D, YYYY")}
            </Text>
          </VStack>
        </Td>
        <Td isNumeric>
          <Text>{Number(result.score).toFixed(2)}</Text>
          <Text
            fontSize="sm"
            color="gray.600"
            display={{ base: "block", md: "none" }}
          >
            {result.placement}
            {getOrdinalSuffix(result.placement)} Place
          </Text>
        </Td>
        <Td isNumeric display={{ base: "none", md: "table-cell" }}>
          {result.placement}
        </Td>
      </Tr>
      <Tr>
        <Td colSpan={5} p={0}>
          <Collapse in={isOpen} animateOpacity>
            {result.judgeDetails ? (
              <JudgeCard details={result.judgeDetails} />
            ) : (
              <Box p={4} bg="gray.50">
                <Text>
                  No detailed judging information available for this event.
                </Text>
              </Box>
            )}
          </Collapse>
        </Td>
      </Tr>
    </>
  );
}

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
                <Th width="40px"></Th>
                <Th display={{ base: "none", md: "table-cell" }}>Date</Th>
                <Th>Event</Th>
                <Th isNumeric>Score</Th>
                <Th isNumeric display={{ base: "none", md: "table-cell" }}>
                  Place
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {stats.history.map((result, index) => (
                <ExpandableRow key={index} result={result} />
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
}
