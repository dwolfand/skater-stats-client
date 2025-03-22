import { useQuery } from "@tanstack/react-query";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  getSkaterStats,
  getSkaterAIAnalysis,
  SkaterStats,
  getTossieReceipts,
} from "../api/client";
import dayjs from "../utils/date";
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
  Card,
  Image,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "@chakra-ui/icons";
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
import SixJudgeCard from "../components/SixJudgeCard";
import { useEffect, useState, useMemo } from "react";
import FavoriteButton from "../components/FavoriteButton";
import DownloadButton from "../components/DownloadButton";
import { trackPageView } from "../utils/analytics";
import TossieModal from "../components/TossieModal";

type SkaterHistoryEntry = SkaterStats["history"][0];

interface ExpandableRowProps {
  result: SkaterHistoryEntry;
  showScoringSystem: boolean;
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

function getMostFrequentEventTypeAndBest(history: SkaterHistoryEntry[]) {
  // Count occurrences of each event type
  const eventTypeCounts = history.reduce<Record<string, number>>(
    (acc: Record<string, number>, curr: SkaterHistoryEntry) => {
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
      (h: SkaterHistoryEntry) =>
        h.eventType === mostFrequentEventType && h.score != null
    )
    .map((h: SkaterHistoryEntry) => h.score);

  // Find the highest score and its corresponding event
  const maxScore = scores.length > 0 ? Math.max(...scores) : null;
  const bestEvent = history.find(
    (h: SkaterHistoryEntry) =>
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
function getEffectiveScore(result: SkaterHistoryEntry): number {
  if (result.isSixEvent) {
    return result.majority ? parseFloat(result.majority) : 0;
  }
  return result.segmentScore && result.segmentScore > 0
    ? result.segmentScore
    : result.score;
}

function ExpandableRow({ result, showScoringSystem }: ExpandableRowProps) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Tr onClick={onToggle} style={{ cursor: "pointer" }}>
        <Td width={{ base: "48px", md: "40px" }} p="0" textAlign="center">
          <IconButton
            aria-label="Expand row"
            icon={
              isOpen ? (
                <ChevronUpIcon boxSize={6} />
              ) : (
                <ChevronDownIcon boxSize={6} />
              )
            }
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            variant="ghost"
            size="md"
            width="48px"
            height="48px"
            p="0"
            borderRadius={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          />
        </Td>
        <Td display={{ base: "none", md: "table-cell" }}>
          {dayjs(result.date).format("MMM D, YYYY")}
        </Td>
        <Td p={{ base: 2, md: 6 }}>
          <VStack align="start" spacing={0}>
            <Link
              as={RouterLink}
              to={
                result.isSixEvent
                  ? `/competition/${result.year}/${
                      result.ijsId
                    }/six-event/${encodeURIComponent(result.resultsUrl)}`
                  : `/competition/${result.year}/${
                      result.ijsId
                    }/event/${encodeURIComponent(result.resultsUrl)}`
              }
              color="blue.500"
              onClick={(e) => e.stopPropagation()}
            >
              <HStack spacing={2}>
                <Text>{result.event}</Text>
                {showScoringSystem && (
                  <Badge
                    colorScheme={result.isSixEvent ? "purple" : "blue"}
                    rounded="full"
                    px={2}
                    fontSize="xs"
                    fontWeight="semibold"
                    display={{ base: "none", md: "block" }}
                  >
                    {result.isSixEvent ? "6.0" : "IJS"}
                  </Badge>
                )}
              </HStack>
            </Link>
            <Text
              fontSize="sm"
              color="gray.600"
              display={{ base: "block", md: "none" }}
            >
              {dayjs(result.date).format("MMM D, YYYY")}
            </Text>
            <Link
              as={RouterLink}
              to={`/competition/${result.year}/${result.ijsId}`}
              color="gray.600"
              fontSize="sm"
              onClick={(e) => e.stopPropagation()}
            >
              {result.competition}
            </Link>
          </VStack>
        </Td>
        <Td isNumeric p={{ base: 2, md: 6 }}>
          {result.isSixEvent ? (
            <VStack align="flex-end" spacing={0}>
              <Text>{result.majority || "-"}</Text>
              {result.tieBreaker && (
                <Text fontSize="sm" color="gray.600">
                  {result.tieBreaker}
                </Text>
              )}
              {showScoringSystem && (
                <Badge
                  colorScheme={result.isSixEvent ? "purple" : "blue"}
                  rounded="full"
                  px={2}
                  fontSize="xs"
                  fontWeight="semibold"
                  display={{ base: "block", md: "none" }}
                >
                  {result.isSixEvent ? "6.0" : "IJS"}
                </Badge>
              )}
            </VStack>
          ) : (
            <VStack align="flex-end" spacing={0}>
              <Text>
                {result.segmentScore && result.segmentScore > 0
                  ? result.segmentScore.toFixed(2)
                  : result.score?.toFixed(2) || "-"}
              </Text>
              {result.segmentScore &&
                result.segmentScore > 0 &&
                result.score &&
                result.segmentScore !== result.score && (
                  <Text fontSize="sm" color="gray.600">
                    {result.score.toFixed(2)}
                  </Text>
                )}
              {showScoringSystem && (
                <Badge
                  colorScheme={result.isSixEvent ? "purple" : "blue"}
                  rounded="full"
                  px={2}
                  fontSize="xs"
                  fontWeight="semibold"
                  display={{ base: "block", md: "none" }}
                >
                  {result.isSixEvent ? "6.0" : "IJS"}
                </Badge>
              )}
            </VStack>
          )}
        </Td>
        <Td isNumeric display={{ base: "none", md: "table-cell" }}>
          {result.placement && (
            <>
              {result.placement}
              <Text as="sup" fontSize="xs" ml={0.5}>
                {getOrdinalSuffix(result.placement)}
              </Text>
            </>
          )}
        </Td>
      </Tr>
      {isOpen && (
        <Tr>
          <Td colSpan={5} p={0}>
            {result.isSixEvent ? (
              <SixJudgeCard
                judgeScores={result.judgeScores}
                club={result.club}
                majority={result.majority}
                tieBreaker={result.tieBreaker}
              />
            ) : (
              result.judgeDetails && <JudgeCard details={result.judgeDetails} />
            )}
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
  const {
    isOpen: isTossieModalOpen,
    onOpen: onTossieModalOpen,
    onClose: onTossieModalClose,
  } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["skater", name, skaterId],
    queryFn: () =>
      getSkaterStats({
        name: name,
        skaterId: skaterId ? parseInt(skaterId, 10) : undefined,
      }),
    enabled: !!(name || skaterId),
  });

  useEffect(() => {
    if (stats) {
      trackPageView.skater(
        skaterId ? parseInt(skaterId, 10) : undefined,
        stats.name || name
      );
      document.title = `${stats.name} - Skater Stats`;
    }
  }, [stats, skaterId, name]);

  // Check if there are any 6.0 events
  const hasSixPointOEvents = useMemo(() => {
    return stats?.history?.some((result) => result.isSixEvent) ?? false;
  }, [stats?.history]);

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

  const { data: tossies, isLoading: isTossiesLoading } = useQuery({
    queryKey: ["skaterTossies", name, skaterId],
    queryFn: () =>
      getTossieReceipts({
        skaterId: skaterId ? parseInt(skaterId, 10) : undefined,
        name: name,
      }),
    enabled: !!(name || skaterId),
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
            <VStack align="start" spacing={1}>
              <Heading size="xl">Results for {stats.name}</Heading>
              {stats.club && (
                <Link
                  as={RouterLink}
                  to={`/club/${stats.club_id}`}
                  color="gray.600"
                  fontSize="md"
                >
                  {stats.club}
                </Link>
              )}
            </VStack>
            <ButtonGroup>
              <Button
                leftIcon={
                  <Image
                    src="/images/tossie_filled.png"
                    alt="Tossie"
                    boxSize="20px"
                  />
                }
                variant="ghost"
                onClick={onTossieModalOpen}
                isLoading={isTossiesLoading}
              >
                {tossies?.length || 0}
              </Button>
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
              <ButtonGroup mb={4} spacing={2}>
                <Button
                  colorScheme="blue"
                  isLoading={isLoadingAnalysis}
                  onClick={() => refetchAnalysis()}
                  leftIcon={
                    isLoadingAnalysis ? <Spinner size="sm" /> : undefined
                  }
                  isDisabled={!!aiAnalysis}
                >
                  {aiAnalysis ? "Analysis Complete" : "Get AI Analysis"}
                </Button>
                <DownloadButton
                  data={stats}
                  filename={stats.name.replace(/\s+/g, "_") + "_stats"}
                />
              </ButtonGroup>
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
                      variant="filled"
                      focusBorderColor="brand.500"
                      bg="white"
                      boxShadow="md"
                      _hover={{ bg: "white" }}
                      _focus={{ bg: "white" }}
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
                          colorScheme="brand"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          p={1}
                        >
                          {type}
                          <IconButton
                            aria-label="Remove filter"
                            icon={<CloseIcon boxSize={2} />}
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
                      variant="filled"
                      focusBorderColor="brand.500"
                      bg="white"
                      boxShadow="md"
                      _hover={{ bg: "white" }}
                      _focus={{ bg: "white" }}
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
                          colorScheme="brand"
                          display="flex"
                          alignItems="center"
                          gap={1}
                          p={1}
                        >
                          {level}
                          <IconButton
                            aria-label="Remove filter"
                            icon={<CloseIcon boxSize={2} />}
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
        <Card p={6} mb={8} border="none">
          <StatGroup>
            <Stat>
              <StatLabel>
                Events
                {filteredHistory.length !== stats.history.length &&
                  ` (Filtered)`}
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
                {filteredHistory.length !== stats.history.length &&
                  ` (Filtered)`}
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
                {filteredHistory.length !== stats.history.length &&
                  ` (Filtered)`}
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
        </Card>

        {/* Score History Chart */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Score History
          </Heading>
          <Card p={6} border="none">
            <Box h="400px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{
                    top: 5,
                    right: 5,
                    left: isMobile ? 0 : 20,
                    bottom: 5,
                  }}
                >
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
                  <YAxis domain={["auto", "auto"]} width={isMobile ? 30 : 45} />
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
                      stroke={
                        [
                          "#319795", // teal.500
                          "#4299E1", // blue.400
                          "#9F7AEA", // purple.400
                          "#00B5D8", // cyan.500
                          "#667EEA", // indigo.400
                          "#B794F4", // purple.300
                        ][index % 6]
                      }
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Card>
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
                <Th width="40px" p={{ base: 1, md: 6 }}></Th>
                <Th display={{ base: "none", md: "table-cell" }}>Date</Th>
                <Th p={{ base: 2, md: 6 }}>Event</Th>
                <Th isNumeric p={{ base: 2, md: 6 }}>
                  Score
                </Th>
                <Th isNumeric display={{ base: "none", md: "table-cell" }}>
                  Place
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredHistory.map((result, index) => (
                <ExpandableRow
                  key={index}
                  result={result}
                  showScoringSystem={hasSixPointOEvents}
                />
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      <TossieModal
        isOpen={isTossieModalOpen}
        onClose={onTossieModalClose}
        tossies={tossies}
        isLoading={isTossiesLoading}
      />
    </Container>
  );
}
