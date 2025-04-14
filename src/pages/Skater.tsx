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
  SimpleGrid,
  AspectRatio,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Center,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon, CloseIcon } from "@chakra-ui/icons";
import { FiFilter } from "react-icons/fi";
import JudgeCard from "../components/JudgeCard";
import SixJudgeCard from "../components/SixJudgeCard";
import { useEffect, useState, useMemo } from "react";
import FavoriteButton from "../components/FavoriteButton";
import DownloadButton from "../components/DownloadButton";
import ShareButton from "../components/ShareButton";
import { trackPageView } from "../utils/analytics";
import TossieModal from "../components/TossieModal";
import SkaterTossieDisplay from "../components/SkaterTossieDisplay";
import {
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaYoutube,
  FaMusic,
  FaPlay,
} from "react-icons/fa";
import { Icon } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/markdown.css";
import { getImageUrl, getThumbnailUrl } from "../utils/images";
import ScoreHistoryChart from "../components/ScoreHistoryChart";
import SkaterMapDisplay from "../components/SkaterMapDisplay";
import { MapLocationType } from "../types/auth";
import StatsBar from "../components/StatsBar";
import { SkaterHistoryEntry } from "../types/skater";

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

// Helper function to get the effective score
function getEffectiveScore(result: SkaterHistoryEntry): number {
  if (result.isSixEvent) {
    // For 6.0 scoring, majority is in format "4/1" where 1 is the actual score
    if (result.majority) {
      try {
        const parts = result.majority.split("/");
        return parts.length > 1 ? parseFloat(parts[1]) : 0;
      } catch (error) {
        console.error("Error parsing majority score:", error);
        return 0;
      }
    }
    return 0;
  }
  return result.segmentScore && result.segmentScore > 0
    ? result.segmentScore
    : result.score;
}

// Function to find top scoring element across all judge details
function findTopScoringElement(history: SkaterHistoryEntry[]): {
  elementName: string;
  executedElement?: string;
  score: number;
  competitionName: string;
  date: string;
} | null {
  let topElement = null;
  let maxScore = -1;

  // Go through all history entries
  for (const entry of history) {
    // Skip 6.0 events or entries without judge details
    if (entry.isSixEvent || !entry.judgeDetails?.elements?.length) continue;

    // Check each element
    for (const element of entry.judgeDetails.elements) {
      // Support both property name conventions (value and score)
      const elementScore =
        element.value !== undefined ? element.value : element.score;
      if (elementScore !== undefined && elementScore > maxScore) {
        maxScore = elementScore;
        topElement = {
          // Support both property name conventions (elementCode and name)
          elementName:
            element.elementCode ||
            element.name ||
            element.plannedElement ||
            "Unknown Element",
          executedElement: element.executedElement,
          score: elementScore,
          competitionName: entry.competition,
          date: entry.date,
        };
      }
    }
  }

  return topElement;
}

// Function to find element with highest mean GOE
function findHighestMeanGOEElement(history: SkaterHistoryEntry[]): {
  elementName: string;
  executedElement?: string;
  meanGOE: number;
  competitionName: string;
  date: string;
} | null {
  let topElement = null;
  let maxMeanGOE = -100; // GOE can be negative

  // Go through all history entries
  for (const entry of history) {
    // Skip 6.0 events or entries without judge details
    if (entry.isSixEvent || !entry.judgeDetails?.elements?.length) continue;

    // Check each element
    for (const element of entry.judgeDetails.elements) {
      // Check if GOE exists and is valid
      if (element.goe !== undefined && element.goe > maxMeanGOE) {
        // Support both property name conventions for judges scores
        const hasJudgesScores =
          (element.judgesGoe && element.judgesGoe.length > 0) ||
          (element.judges && element.judges.length > 0);

        if (hasJudgesScores) {
          maxMeanGOE = element.goe;
          topElement = {
            // Support both property name conventions (elementCode and name)
            elementName:
              element.elementCode ||
              element.name ||
              element.plannedElement ||
              "Unknown Element",
            executedElement: element.executedElement,
            meanGOE: element.goe,
            competitionName: entry.competition,
            date: entry.date,
          };
        }
      }
    }
  }

  return topElement;
}

// Helper function to truncate element code with ellipsis if it's too long
function truncateElementName(name: string, maxLength: number = 7): string {
  if (!name || name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
}

function ExpandableRow({ result, showScoringSystem }: ExpandableRowProps) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Tr
        onClick={onToggle}
        style={{ cursor: "pointer" }}
        _hover={{ bg: "gray.50" }}
      >
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
        <Td display={{ base: "none", md: "table-cell" }} color="gray.900">
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
                <Text color="gray.900">{result.event}</Text>
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
              <Text color="gray.900">{result.majority || "-"}</Text>
              {result.tieBreaker && (
                <Text fontSize="sm" color="gray.600">
                  {result.tieBreaker}
                </Text>
              )}
              {result.placement && (
                <Text
                  fontSize="sm"
                  color="gray.600"
                  display={{ base: "block", md: "none" }}
                >
                  {result.placement}
                  <Text as="sup" fontSize="xs" ml={0.5}>
                    {getOrdinalSuffix(result.placement)}
                  </Text>
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
              <Text color="gray.900">
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
              {result.placement && (
                <Text
                  fontSize="sm"
                  color="gray.600"
                  display={{ base: "block", md: "none" }}
                >
                  {result.placement}
                  <Text as="sup" fontSize="xs" ml={0.5}>
                    {getOrdinalSuffix(result.placement)}
                  </Text>
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
        <Td
          isNumeric
          display={{ base: "none", md: "table-cell" }}
          color="gray.900"
        >
          {result.placement && (
            <>
              {result.placement}
              <Text as="sup" fontSize="xs" ml={0.5} color="gray.900">
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

// Helper function to format video URLs for embedding
const getEmbedUrl = (url: string) => {
  // YouTube URL patterns
  const youtubePatterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];

  // Check for YouTube URLs
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=0`;
    }
  }

  // Return original URL if no patterns match
  return url;
};

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
  const [stats, setStats] = useState<SkaterStats | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { data: statsData, isLoading } = useQuery({
    queryKey: ["skater", name, skaterId],
    queryFn: () =>
      getSkaterStats({
        name: name,
        skaterId: skaterId ? parseInt(skaterId, 10) : undefined,
      }),
    enabled: !!(name || skaterId),
  });

  useEffect(() => {
    if (statsData) {
      trackPageView.skater(
        skaterId ? parseInt(skaterId, 10) : undefined,
        statsData.name || name
      );
      document.title = `${statsData.name} - Skater Stats`;
      setStats(statsData);
    }
  }, [statsData, skaterId, name]);

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
    if (!filteredHistory.length) return { series: [], categories: [] };

    // Get unique event types
    const eventTypes = Array.from(
      new Set(filteredHistory.map((h) => h.eventType))
    );

    // Group data by event type
    const series = eventTypes.map((eventType) => {
      const eventData = filteredHistory
        .filter((h) => h.eventType === eventType)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((h) => ({
          date: new Date(h.date).getTime(),
          y: getEffectiveScore(h),
          event: h.event,
          competition: h.competition,
        }));

      return {
        name: eventType,
        data: eventData,
      };
    });

    return {
      series,
      categories: filteredHistory
        .map((h) => h.date)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    };
  }, [filteredHistory]);

  // Memoize personal best calculation
  const personalBest = useMemo(() => {
    if (!stats?.history)
      return { eventType: "", score: null, event: null, date: null };

    // Check if all events are 6.0 events
    const isAllSixEvents =
      stats.history.length > 0 && stats.history.every((h) => h.isSixEvent);

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
      .filter(
        (score): score is number => score != null && !isNaN(score) && score > 0
      );

    // Find the highest/lowest score and its corresponding event
    const bestScore =
      scores.length > 0
        ? isAllSixEvents
          ? Math.min(...scores)
          : Math.max(...scores)
        : null;

    const bestEvent = stats.history.find(
      (h) =>
        h.eventType === mostFrequentEventType &&
        getEffectiveScore(h) === bestScore
    );

    return {
      eventType: mostFrequentEventType,
      score: bestScore,
      event: bestEvent?.event,
      date: bestEvent?.date,
      isAllSixEvents,
    };
  }, [stats?.history]);

  // Memoize top scoring element calculation
  const topScoringElement = useMemo(() => {
    if (!stats?.history) return null;
    return findTopScoringElement(stats.history);
  }, [stats?.history]);

  // Memoize highest mean GOE element calculation
  const highestMeanGOEElement = useMemo(() => {
    if (!stats?.history) return null;
    return findHighestMeanGOEElement(stats.history);
  }, [stats?.history]);

  // Memoize filtered top scoring element calculation
  const filteredTopScoringElement = useMemo(() => {
    if (!filteredHistory.length) return null;
    return findTopScoringElement(filteredHistory);
  }, [filteredHistory]);

  // Memoize filtered highest mean GOE element calculation
  const filteredHighestMeanGOEElement = useMemo(() => {
    if (!filteredHistory.length) return null;
    return findHighestMeanGOEElement(filteredHistory);
  }, [filteredHistory]);

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

  // Apply theme customization
  useEffect(() => {
    if (stats?.customization) {
      const { accentColor, fontFamily } = stats.customization;
      const root = document.documentElement;

      if (accentColor) {
        root.style.setProperty("--skater-accent-color", accentColor);
      }
      if (fontFamily) {
        root.style.setProperty("--skater-font-family", fontFamily);
      }

      // Cleanup when component unmounts
      return () => {
        root.style.removeProperty("--skater-accent-color");
        root.style.removeProperty("--skater-font-family");
      };
    }
  }, [stats?.customization]);

  // Function to generate CSS gradient string
  const generateGradientCSS = (gradient: any) => {
    if (!gradient?.colors?.length) return undefined;

    const gradientColors = gradient.colors
      .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 100))
      .map(
        (c: any) =>
          `${c.color} ${c.position !== undefined ? c.position + "%" : ""}`
      )
      .join(", ");

    return `linear-gradient(${
      gradient.direction || "to bottom"
    }, ${gradientColors})`;
  };

  // Get theme colors from customization - create compatible structure for child components
  const themeColors = useMemo(() => {
    const customization = stats?.customization;
    return {
      color: customization?.accentColor || undefined,
      fontFamily: customization?.fontFamily || undefined,
      backgroundColor: customization?.backgroundColor || undefined,
      backgroundImage: customization?.backgroundGradient
        ? generateGradientCSS(customization.backgroundGradient)
        : undefined,
    };
  }, [stats?.customization]);

  // Page background style
  const pageStyle = useMemo(() => {
    return {
      backgroundColor: themeColors.backgroundColor || "transparent",
      backgroundImage: themeColors.backgroundImage || "none",
      color: themeColors.color,
      fontFamily: themeColors.fontFamily,
    };
  }, [themeColors]);

  if (isLoading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Center>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
        </Center>
      </Box>
    );
  }

  if (!statsData) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>No data found for this skater.</Text>
      </Container>
    );
  }

  if (!stats) {
    return null;
  }

  const filename = stats.name?.replace(/\s+/g, "_") + "_stats";

  return (
    <Box minH="100vh" style={pageStyle} mt="-64px" pt="64px">
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <VStack align="stretch" spacing={4}>
              <HStack spacing={6} align="start">
                {stats.customization?.profileImage ? (
                  <Box
                    as="button"
                    onClick={() => {
                      const imageUrl = getImageUrl(
                        stats.customization?.profileImage
                      );
                      if (imageUrl) setSelectedImage(imageUrl);
                    }}
                    cursor="pointer"
                    transition="transform 0.2s"
                    _hover={{ transform: "scale(1.02)" }}
                  >
                    <Image
                      src={getThumbnailUrl(
                        stats.customization.profileImage,
                        "medium"
                      )}
                      alt={stats.name}
                      borderRadius="full"
                      boxSize="120px"
                      objectFit="cover"
                      style={{ imageOrientation: "from-image" }}
                    />
                  </Box>
                ) : (
                  <Avatar size="2xl" name={stats.name} />
                )}
                <VStack align="stretch" spacing={3}>
                  <Heading
                    size="lg"
                    color={themeColors.color}
                    fontFamily={themeColors.fontFamily}
                  >
                    {stats.name}
                  </Heading>
                  {stats.club && (
                    <Link
                      as={RouterLink}
                      to={`/club/${stats.club_id}`}
                      color={themeColors.color}
                      fontSize="md"
                      fontFamily={themeColors.fontFamily}
                    >
                      {stats.club}
                    </Link>
                  )}
                  <ButtonGroup spacing={2}>
                    <Button
                      leftIcon={
                        <Image
                          src="/images/tossie_filled.png"
                          alt="Tossie"
                          boxSize="20px"
                        />
                      }
                      variant="solid"
                      onClick={onTossieModalOpen}
                      isLoading={isTossiesLoading}
                      bg={themeColors.backgroundColor ? "white" : "transparent"}
                      color="gray.800"
                      _hover={{
                        bg: themeColors.backgroundColor
                          ? "gray.100"
                          : "gray.50",
                      }}
                    >
                      {tossies?.length || 0}
                    </Button>
                    <IconButton
                      aria-label="Filter options"
                      icon={<FiFilter />}
                      onClick={onOptionsToggle}
                      variant="solid"
                      bg={themeColors.backgroundColor ? "white" : "transparent"}
                      color="gray.800"
                      _hover={{
                        bg: themeColors.backgroundColor
                          ? "gray.100"
                          : "gray.50",
                      }}
                    />
                    <ShareButton
                      title={`${stats.name} - Skater Stats`}
                      text={`Check out ${stats.name}'s skater profile on Skater Stats!`}
                      url={window.location.href}
                      variant="solid"
                      bg={themeColors.backgroundColor ? "white" : "transparent"}
                      color="gray.800"
                      _hover={{
                        bg: themeColors.backgroundColor
                          ? "gray.100"
                          : "gray.50",
                      }}
                    />
                    <Box
                      bg={themeColors.backgroundColor ? "white" : "transparent"}
                      borderRadius="md"
                    >
                      <FavoriteButton
                        type="skater"
                        name={stats.name}
                        params={
                          skaterId
                            ? { skaterId: parseInt(skaterId, 10) }
                            : { name: stats.name }
                        }
                      />
                    </Box>
                  </ButtonGroup>
                </VStack>
              </HStack>
            </VStack>
            <Collapse in={isOptionsOpen} animateOpacity>
              <Box mb={4} mt={4}>
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
                  <DownloadButton data={stats} filename={filename} />
                </ButtonGroup>
                {isLoadingAnalysis && (
                  <Alert status="info" mb={4}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle color="initial">Analyzing Data</AlertTitle>
                      <AlertDescription color="initial">
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
                    <AlertTitle mb={2} color="initial">
                      AI Analysis
                    </AlertTitle>
                    <AlertDescription width="100%" color="initial">
                      <Box className="markdown-content" color="initial">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {aiAnalysis.analysis}
                        </ReactMarkdown>
                      </Box>
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
                        focusBorderColor="blue.500"
                        bg="white"
                        color="gray.800"
                        _placeholder={{ color: "gray.500" }}
                        boxShadow="md"
                        _hover={{ bg: "white" }}
                        _focus={{ bg: "white" }}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setSelectedEventTypes([]);
                          } else if (!selectedEventTypes.includes(value)) {
                            setSelectedEventTypes([
                              ...selectedEventTypes,
                              value,
                            ]);
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
                        focusBorderColor="blue.500"
                        bg="white"
                        color="gray.800"
                        _placeholder={{ color: "gray.500" }}
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

          {/* Customization */}
          {stats.customization &&
            (() => {
              // Check if there's any actual content to display
              const hasContent = !!(
                stats.customization.coverImage ||
                stats.customization.bio ||
                stats.customization.favoriteQuote ||
                (tossies && tossies.filter((t) => t.is_opened).length > 0) ||
                stats.customization.coach ||
                stats.customization.homeRink ||
                stats.customization.goals ||
                (stats.customization.achievements &&
                  stats.customization.achievements.length > 0) ||
                (stats.customization.galleryImages &&
                  stats.customization.galleryImages.length > 0) ||
                stats.customization.featuredVideo ||
                (stats.customization.socialLinks &&
                  Object.values(stats.customization.socialLinks).some(
                    Boolean
                  )) ||
                (stats.customization.profileSong &&
                  stats.customization.profileSong.title)
              );

              // Only render this section if there's actual content
              return hasContent ? (
                <Box>
                  <HStack mb={4} onClick={() => onToggle()} cursor="pointer">
                    <Heading
                      size="md"
                      color={themeColors.color}
                      fontFamily={themeColors.fontFamily}
                    >
                      Skater Information
                    </Heading>
                    <IconButton
                      aria-label="Toggle skater information"
                      icon={
                        isOpen ? (
                          <ChevronUpIcon
                            boxSize={6}
                            color={themeColors.color || undefined}
                          />
                        ) : (
                          <ChevronDownIcon
                            boxSize={6}
                            color={themeColors.color || undefined}
                          />
                        )
                      }
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                      }}
                    />
                  </HStack>

                  <Collapse in={isOpen} animateOpacity>
                    <Box>
                      {/* Cover Image */}
                      {stats.customization?.coverImage && (
                        <Box
                          as="button"
                          onClick={() => {
                            const imageUrl = getImageUrl(
                              stats.customization!.coverImage
                            );
                            if (imageUrl) setSelectedImage(imageUrl);
                          }}
                          cursor="pointer"
                          h="200px"
                          mb={6}
                          width="100%"
                          bgImage={`url(${getImageUrl(
                            stats.customization!.coverImage
                          )})`}
                          bgSize="cover"
                          bgPosition="center"
                          borderRadius="lg"
                          transition="transform 0.2s"
                          _hover={{ transform: "scale(1.01)" }}
                        />
                      )}

                      {/* Bio and Quote */}
                      {(stats.customization?.bio ||
                        stats.customization?.favoriteQuote) && (
                        <Card
                          p={6}
                          mb={6}
                          bg="white"
                          fontFamily={themeColors.fontFamily}
                          borderWidth="0"
                        >
                          <VStack spacing={4} align="stretch">
                            {stats.customization?.bio && (
                              <Box>
                                <Heading
                                  size="sm"
                                  mb={2}
                                  fontFamily={themeColors.fontFamily}
                                >
                                  About Me
                                </Heading>
                                <Text whiteSpace="pre-wrap">
                                  {stats.customization.bio}
                                </Text>
                              </Box>
                            )}

                            {stats.customization?.favoriteQuote && (
                              <Box>
                                <Text
                                  fontSize="lg"
                                  fontStyle="italic"
                                  fontFamily={themeColors.fontFamily}
                                >
                                  "{stats.customization.favoriteQuote}"
                                </Text>
                              </Box>
                            )}
                          </VStack>
                        </Card>
                      )}

                      {/* Tossie Collection - only show if there are tossies and not loading */}
                      {!isTossiesLoading &&
                        tossies &&
                        tossies.filter((t) => t.is_opened).length > 0 && (
                          <SkaterTossieDisplay
                            tossies={tossies}
                            isLoading={false}
                            themeColors={themeColors}
                          />
                        )}

                      {/* Skating Info */}
                      {(stats.customization?.coach ||
                        stats.customization?.homeRink ||
                        stats.customization?.goals) && (
                        <Card
                          p={6}
                          mb={6}
                          bg="white"
                          fontFamily={themeColors.fontFamily}
                          borderWidth="0"
                        >
                          <VStack spacing={4} align="stretch">
                            {stats.customization?.coach && (
                              <Box>
                                <Heading size="sm" mb={2}>
                                  Coach
                                </Heading>
                                <Text>{stats.customization.coach}</Text>
                              </Box>
                            )}

                            {stats.customization?.homeRink && (
                              <Box>
                                <Heading size="sm" mb={2}>
                                  Home Rink
                                </Heading>
                                <Text>{stats.customization.homeRink}</Text>
                              </Box>
                            )}

                            {stats.customization?.goals && (
                              <Box>
                                <Heading size="sm" mb={2}>
                                  Goals
                                </Heading>
                                <Text>{stats.customization.goals}</Text>
                              </Box>
                            )}
                          </VStack>
                        </Card>
                      )}

                      {/* Achievements */}
                      {stats.customization?.achievements &&
                        stats.customization.achievements.length > 0 && (
                          <Card
                            p={6}
                            mb={6}
                            bg="white"
                            fontFamily={themeColors.fontFamily}
                            borderWidth="0"
                          >
                            <Heading size="sm" mb={4}>
                              Achievements
                            </Heading>
                            <VStack spacing={2} align="stretch">
                              {stats.customization.achievements.map(
                                (achievement, index) => (
                                  <Text key={index}>{achievement}</Text>
                                )
                              )}
                            </VStack>
                          </Card>
                        )}

                      {/* Gallery */}
                      {stats.customization.galleryImages &&
                        stats.customization.galleryImages.length > 0 && (
                          <Card
                            p={6}
                            mb={6}
                            bg="white"
                            fontFamily={themeColors.fontFamily}
                            borderWidth="0"
                          >
                            <Heading size="sm" mb={4}>
                              Gallery
                            </Heading>
                            <SimpleGrid
                              columns={{ base: 2, md: 3, lg: 4 }}
                              spacing={4}
                            >
                              {stats.customization.galleryImages.map(
                                (image, index) => {
                                  const imageUrl = getImageUrl(image);
                                  return (
                                    <Box
                                      key={index}
                                      as="button"
                                      onClick={() =>
                                        imageUrl && setSelectedImage(imageUrl)
                                      }
                                      cursor="pointer"
                                      transition="transform 0.2s"
                                      _hover={{ transform: "scale(1.02)" }}
                                    >
                                      <Image
                                        src={getThumbnailUrl(image, "small")}
                                        alt={`Gallery ${index + 1}`}
                                        borderRadius="md"
                                        objectFit="cover"
                                        aspectRatio={1}
                                      />
                                    </Box>
                                  );
                                }
                              )}
                            </SimpleGrid>
                          </Card>
                        )}

                      {/* Insert the map display component after the customization section or where gallery ends */}
                      {((stats.customization?.mapLocations &&
                        stats.customization.mapLocations.length > 0) ||
                        (stats.competitionLocations &&
                          stats.competitionLocations.length > 0)) && (
                        <SkaterMapDisplay
                          locations={[
                            ...(stats.customization?.mapLocations || []),
                            ...(stats.competitionLocations
                              ? stats.competitionLocations.map((loc) => ({
                                  id: `competition-${loc.id}`,
                                  name: loc.name,
                                  lat: loc.lat,
                                  lng: loc.lng,
                                  address: loc.address,
                                  type: "competition" as MapLocationType,
                                  description: loc.description,
                                  readOnly: true,
                                }))
                              : []),
                          ]}
                          themeColors={themeColors}
                        />
                      )}

                      {/* Featured Video */}
                      {stats.customization.featuredVideo && (
                        <Card
                          p={6}
                          mb={6}
                          bg="white"
                          fontFamily={themeColors.fontFamily}
                          borderWidth="0"
                        >
                          <Heading size="sm" mb={4}>
                            Featured Video
                          </Heading>
                          <AspectRatio ratio={16 / 9}>
                            <iframe
                              src={getEmbedUrl(
                                stats.customization.featuredVideo
                              )}
                              title="Featured Video"
                              allowFullScreen
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              style={{ border: 0 }}
                            />
                          </AspectRatio>
                        </Card>
                      )}

                      {/* Social Links */}
                      {stats.customization.socialLinks &&
                        Object.values(stats.customization.socialLinks).some(
                          Boolean
                        ) && (
                          <Card
                            p={6}
                            mb={6}
                            bg="white"
                            fontFamily={themeColors.fontFamily}
                            borderWidth="0"
                          >
                            <Heading size="sm" mb={4}>
                              Connect With Me
                            </Heading>
                            <VStack spacing={3} align="start">
                              {stats.customization.socialLinks.instagram && (
                                <Link
                                  href={`https://instagram.com/${stats.customization.socialLinks.instagram}`}
                                  isExternal
                                  display="flex"
                                  alignItems="center"
                                >
                                  <Icon as={FaInstagram} boxSize={6} mr={2} />
                                  <Text>
                                    @{stats.customization.socialLinks.instagram}
                                  </Text>
                                </Link>
                              )}
                              {stats.customization.socialLinks.twitter && (
                                <Link
                                  href={`https://twitter.com/${stats.customization.socialLinks.twitter}`}
                                  isExternal
                                  display="flex"
                                  alignItems="center"
                                >
                                  <Icon as={FaTwitter} boxSize={6} mr={2} />
                                  <Text>
                                    @{stats.customization.socialLinks.twitter}
                                  </Text>
                                </Link>
                              )}
                              {stats.customization.socialLinks.tiktok && (
                                <Link
                                  href={`https://tiktok.com/@${stats.customization.socialLinks.tiktok}`}
                                  isExternal
                                  display="flex"
                                  alignItems="center"
                                >
                                  <Icon as={FaTiktok} boxSize={6} mr={2} />
                                  <Text>
                                    @{stats.customization.socialLinks.tiktok}
                                  </Text>
                                </Link>
                              )}
                              {stats.customization.socialLinks.youtube && (
                                <Link
                                  href={stats.customization.socialLinks.youtube}
                                  isExternal
                                  display="flex"
                                  alignItems="center"
                                >
                                  <Icon as={FaYoutube} boxSize={6} mr={2} />
                                  <Text>YouTube</Text>
                                </Link>
                              )}
                            </VStack>
                          </Card>
                        )}

                      {/* Profile Song */}
                      {stats.customization?.profileSong?.title && (
                        <Card
                          p={6}
                          mb={0}
                          bg="white"
                          fontFamily={themeColors.fontFamily}
                          borderWidth="0"
                        >
                          <Heading size="sm" mb={4}>
                            My Song
                          </Heading>
                          <HStack spacing={4}>
                            <Icon as={FaMusic} boxSize={6} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">
                                {stats.customization.profileSong.title}
                              </Text>
                              <Text color="gray.600">
                                {stats.customization.profileSong.artist}
                              </Text>
                            </VStack>
                            {stats.customization?.profileSong?.url && (
                              <IconButton
                                aria-label="Play song"
                                icon={<FaPlay />}
                                onClick={() =>
                                  window.open(
                                    stats.customization?.profileSong?.url || "",
                                    "_blank"
                                  )
                                }
                                ml="auto"
                              />
                            )}
                          </HStack>
                        </Card>
                      )}
                    </Box>
                  </Collapse>
                </Box>
              ) : null;
            })()}

          {/* Score History Header */}
          <Heading
            size="md"
            mb={4}
            color={themeColors.color}
            fontFamily={themeColors.fontFamily}
          >
            Score History
          </Heading>

          {/* Key Statistics */}
          <StatsBar
            filteredHistory={filteredHistory}
            fullHistory={stats.history}
            totalCompetitions={stats.totalCompetitions}
            totalEvents={stats.totalEvents}
            personalBest={personalBest}
            topScoringElement={topScoringElement}
            highestMeanGOEElement={highestMeanGOEElement}
            filteredTopScoringElement={filteredTopScoringElement}
            filteredHighestMeanGOEElement={filteredHighestMeanGOEElement}
            getEffectiveScore={getEffectiveScore}
            truncateElementName={truncateElementName}
            themeColors={themeColors}
          />

          {/* Score History Chart */}
          {filteredHistory.length > 0 && (
            <ScoreHistoryChart
              filteredHistory={filteredHistory}
              themeColors={themeColors}
              isMobile={isMobile}
            />
          )}

          {/* All Results */}
          <Box>
            <Heading
              size="md"
              mb={4}
              color={themeColors.color}
              fontFamily={themeColors.fontFamily}
            >
              All Results{" "}
              {filteredHistory.length !== stats?.history.length &&
                `(Showing ${filteredHistory.length} of ${stats?.history.length})`}
            </Heading>
            <Table
              variant="simple"
              bg="white"
              fontFamily={themeColors.fontFamily}
            >
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

        {/* Image Modal */}
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          size="6xl"
          isCentered
        >
          <ModalOverlay />
          <ModalContent bg="transparent" boxShadow="none">
            <ModalCloseButton
              color="white"
              bg="blackAlpha.600"
              _hover={{ bg: "blackAlpha.700" }}
            />
            <ModalBody p={0}>
              <Image
                src={selectedImage || ""}
                alt="Full size"
                w="100%"
                h="auto"
                maxH="90vh"
                objectFit="contain"
                style={{ imageOrientation: "from-image" }}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}
