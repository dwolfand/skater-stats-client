import { useQuery } from "@tanstack/react-query";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  SkaterStats,
  getSkaterStats,
  getSkaterAIAnalysis,
} from "../api/client";
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
  Link,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  HStack,
  Select,
  Flex,
  Badge,
  ButtonGroup,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { FiFilter } from "react-icons/fi";
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
import JudgeCard from "../components/JudgeCard";
import { useEffect, useState, useMemo } from "react";
import FavoriteButton from "../components/FavoriteButton";

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

function getMostFrequentEventTypeAndBest(history: SkaterStats["history"]) {
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
      (h: SkaterStats["history"][0]) =>
        h.eventType === mostFrequentEventType && h.score != null
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
}

// Helper function to get the effective score
const getEffectiveScore = (result: SkaterStats["history"][0]) => {
  return result.segmentScore && result.segmentScore > 0
    ? result.segmentScore
    : result.score;
};

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
            <Link
              as={RouterLink}
              to={`/competition/${result.year}/${
                result.ijsId
              }/event/${encodeURIComponent(result.resultsUrl)}`}
              onClick={(e) => e.stopPropagation()}
              color="blue.600"
              _hover={{ textDecoration: "none", color: "blue.700" }}
            >
              <Text fontWeight="medium">{result.event}</Text>
            </Link>
            <Link
              as={RouterLink}
              to={`/competition/${result.year}/${result.ijsId}`}
              onClick={(e) => e.stopPropagation()}
              _hover={{ textDecoration: "none", color: "gray.700" }}
            >
              <Text fontSize="sm" color="gray.600">
                {result.competition}
              </Text>
            </Link>
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
          <Text>{Number(getEffectiveScore(result)).toFixed(2)}</Text>
          {result.segmentScore &&
            result.segmentScore > 0 &&
            result.score !== result.segmentScore && (
              <Text fontSize="sm" color="gray.600">
                ({Number(result.score).toFixed(2)} total)
              </Text>
            )}
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
      {isOpen && result.judgeDetails && (
        <Tr>
          <Td colSpan={5} p={0}>
            <JudgeCard details={result.judgeDetails} />
          </Td>
        </Tr>
      )}
    </>
  );
}

const LOADING_MESSAGES = [
  "Analyzing competition history...",
  "Evaluating technical elements...",
  "Reviewing program components...",
  "Identifying performance patterns...",
  "Assessing scoring trends...",
  "Comparing results across competitions...",
  "Analyzing progression over time...",
  "Evaluating consistency metrics...",
  "Identifying strengths and areas for improvement...",
  "Compiling comprehensive analysis...",
];

export default function Skater() {
  const { name, skaterId } = useParams<{ name?: string; skaterId?: string }>();
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedEventLevels, setSelectedEventLevels] = useState<string[]>([]);
  const { isOpen: isOptionsOpen, onToggle: onOptionsToggle } = useDisclosure();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["skater", name, skaterId],
    queryFn: () =>
      getSkaterStats({
        name: name,
        skaterId: skaterId ? parseInt(skaterId, 10) : undefined,
      }),
    enabled: !!(name || skaterId),
  });

  // Memoize filtered history
  const filteredHistory = useMemo(() => {
    if (!stats?.history) return [];
    return stats.history.filter((h) => {
      const matchesType =
        selectedEventTypes.length === 0 ||
        selectedEventTypes.includes(h.eventType);
      const matchesLevel =
        selectedEventLevels.length === 0 ||
        selectedEventLevels.includes(h.eventLevel);
      return matchesType && matchesLevel;
    });
  }, [stats?.history, selectedEventTypes, selectedEventLevels]);

  // Memoize unique values for filters
  const uniqueValues = useMemo(() => {
    if (!stats?.history) return { eventTypes: [], eventLevels: [] };
    return {
      eventTypes: Array.from(
        new Set(stats.history.map((h) => h.eventType))
      ).sort(),
      eventLevels: Array.from(
        new Set(stats.history.map((h) => h.eventLevel))
      ).sort(),
    };
  }, [stats?.history]);

  // Memoize chart data
  const chartData = useMemo(() => {
    const eventTypes = Array.from(
      new Set(filteredHistory.map((h) => h.eventType))
    );
    return eventTypes.map((eventType) => {
      const eventData = filteredHistory
        .filter((h) => h.eventType === eventType)
        .map((h) => ({
          date: new Date(h.date).getTime(),
          [eventType]: getEffectiveScore(h),
        }));
      return {
        eventType,
        data: eventData,
      };
    });
  }, [filteredHistory]);

  // Memoize personal best calculation
  const personalBest = useMemo(() => {
    if (!stats?.history)
      return { eventType: "", score: null, event: null, date: null };

    // Count occurrences of each event type
    const eventTypeCounts = stats.history.reduce<Record<string, number>>(
      (acc, curr) => {
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
    const scores = stats.history
      .filter((h) => h.eventType === mostFrequentEventType)
      .map(getEffectiveScore)
      .filter((score): score is number => score != null);

    // Find the highest score and its corresponding event
    const maxScore = scores.length > 0 ? Math.max(...scores) : null;
    const bestEvent = stats.history.find(
      (h) =>
        h.eventType === mostFrequentEventType &&
        getEffectiveScore(h) === maxScore
    );

    return {
      eventType: mostFrequentEventType,
      score: maxScore,
      event: bestEvent?.event,
      date: bestEvent?.date,
    };
  }, [stats?.history]);

  const {
    data: aiAnalysis,
    isLoading: isLoadingAnalysis,
    isError: isAnalysisError,
    error: analysisError,
    refetch: refetchAnalysis,
  } = useQuery({
    queryKey: ["skaterAnalysis", skaterId || stats?.name],
    queryFn: () =>
      getSkaterAIAnalysis(
        skaterId ? { skaterId: parseInt(skaterId, 10) } : { name: stats!.name }
      ),
    enabled: false, // Don't fetch automatically
  });

  // Rotate loading messages
  useEffect(() => {
    if (isLoadingAnalysis) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoadingAnalysis]);

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
          <HStack justify="space-between" align="center" mb={2}>
            <Heading size="xl">Results for {stats.name}</Heading>
            <ButtonGroup>
              <IconButton
                aria-label="Filter options"
                icon={<FiFilter />}
                onClick={onOptionsToggle}
                variant="ghost"
              />
              <FavoriteButton
                type="skater"
                name={stats.name}
                params={
                  skaterId
                    ? { skaterId: parseInt(skaterId, 10) }
                    : { name: stats.name }
                }
              />
            </ButtonGroup>
          </HStack>
          <Collapse in={isOptionsOpen} animateOpacity>
            <Box mb={4}>
              {!aiAnalysis && (
                <Button
                  colorScheme="blue"
                  isLoading={isLoadingAnalysis}
                  onClick={() => refetchAnalysis()}
                  mb={4}
                  leftIcon={
                    isLoadingAnalysis ? <Spinner size="sm" /> : undefined
                  }
                >
                  Get AI Analysis
                </Button>
              )}
              {isLoadingAnalysis && (
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Analyzing Data</AlertTitle>
                    <AlertDescription>
                      {LOADING_MESSAGES[loadingMessageIndex]}
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              {aiAnalysis && (
                <Alert
                  status="info"
                  variant="left-accent"
                  flexDirection="column"
                  alignItems="flex-start"
                  mb={4}
                >
                  <AlertTitle mb={2}>AI Analysis</AlertTitle>
                  <AlertDescription whiteSpace="pre-wrap">
                    {aiAnalysis.analysis}
                  </AlertDescription>
                </Alert>
              )}
              {isAnalysisError && (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  <AlertDescription>
                    Failed to get AI analysis. Please try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Filter Controls */}
              <Box>
                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                  <Box flex={1}>
                    <Select
                      placeholder="Event Types"
                      value=""
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setSelectedEventTypes([]);
                        } else if (!selectedEventTypes.includes(value)) {
                          setSelectedEventTypes([...selectedEventTypes, value]);
                        }
                      }}
                      mb={2}
                    >
                      {uniqueValues.eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </Select>
                    <Flex gap={2} flexWrap="wrap">
                      {selectedEventTypes.map((type) => (
                        <Badge
                          key={type}
                          colorScheme="blue"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          p={1}
                        >
                          {type}
                          <IconButton
                            aria-label="Remove filter"
                            icon={<ChevronUpIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              setSelectedEventTypes(
                                selectedEventTypes.filter((t) => t !== type)
                              )
                            }
                          />
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                  <Box flex={1}>
                    <Select
                      placeholder="Event Levels"
                      value=""
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "") {
                          setSelectedEventLevels([]);
                        } else if (!selectedEventLevels.includes(value)) {
                          setSelectedEventLevels([
                            ...selectedEventLevels,
                            value,
                          ]);
                        }
                      }}
                      mb={2}
                    >
                      {uniqueValues.eventLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </Select>
                    <Flex gap={2} flexWrap="wrap">
                      {selectedEventLevels.map((level) => (
                        <Badge
                          key={level}
                          colorScheme="green"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          p={1}
                        >
                          {level}
                          <IconButton
                            aria-label="Remove filter"
                            icon={<ChevronUpIcon />}
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              setSelectedEventLevels(
                                selectedEventLevels.filter((l) => l !== level)
                              )
                            }
                          />
                        </Badge>
                      ))}
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Key Statistics */}
        <StatGroup>
          <Stat>
            <StatLabel>
              Events
              {filteredHistory.length !== stats.history.length && ` (Filtered)`}
            </StatLabel>
            <StatNumber>{filteredHistory.length}</StatNumber>
            {filteredHistory.length !== stats.history.length && (
              <Text fontSize="sm" color="gray.600">
                of {stats.totalEvents} total
              </Text>
            )}
          </Stat>
          <Stat>
            <StatLabel>
              Competitions
              {filteredHistory.length !== stats.history.length && ` (Filtered)`}
            </StatLabel>
            <StatNumber>
              {new Set(filteredHistory.map((h) => h.competition)).size}
            </StatNumber>
            {filteredHistory.length !== stats.history.length && (
              <Text fontSize="sm" color="gray.600">
                of {stats.totalCompetitions} total
              </Text>
            )}
          </Stat>
          <Stat>
            <StatLabel>
              Personal Best
              {filteredHistory.length !== stats.history.length && ` (Filtered)`}
            </StatLabel>
            <StatNumber>
              {(() => {
                const scores = filteredHistory.map(getEffectiveScore);
                const filteredBest =
                  scores.length > 0 ? Math.max(...scores) : 0;
                return filteredBest > 0 ? filteredBest.toFixed(2) : "N/A";
              })()}
            </StatNumber>
            {filteredHistory.length !== stats.history.length &&
              personalBest.score && (
                <Text fontSize="sm" color="gray.600">
                  Overall: {Number(personalBest.score).toFixed(2)}
                </Text>
              )}
            {(() => {
              const scores = filteredHistory.map(getEffectiveScore);
              const maxScore = Math.max(...scores);
              const bestResult = filteredHistory.find(
                (h) => getEffectiveScore(h) === maxScore
              );
              if (bestResult) {
                return (
                  <Text fontSize="sm" color="gray.600">
                    {bestResult.eventType} (
                    {dayjs(bestResult.date).format("MMM D, YYYY")})
                  </Text>
                );
              }
              return null;
            })()}
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
                {chartData.map(({ eventType, data }, index) => (
                  <Line
                    key={eventType}
                    type="monotone"
                    data={data}
                    dataKey={eventType}
                    name={eventType}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* All Results */}
        <Box>
          <Heading size="md" mb={4}>
            All Results{" "}
            {filteredHistory.length !== stats?.history.length &&
              `(Showing ${filteredHistory.length} of ${stats?.history.length})`}
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
              {filteredHistory.map((result, index) => (
                <ExpandableRow key={index} result={result} />
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
}
