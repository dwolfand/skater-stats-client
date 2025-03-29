import React, { useEffect, useState } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Spinner,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useDisclosure,
  HStack,
  VStack,
  Badge,
  Link,
  Button,
  Center,
  useToast,
  Icon,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon } from "@chakra-ui/icons";
import { MdNotifications, MdNotificationsOff } from "react-icons/md";
import { getEventResults, EventResults, ScoreHistory } from "../api/client";
import JudgeCard from "../components/JudgeCard";
import FavoriteButton from "../components/FavoriteButton";
import TossieButton from "../components/TossieButton";
import { formatEventTime, convertToIANATimezone } from "../utils/timeFormat";
import dayjs, { DATE_FORMATS } from "../utils/date";
import { useAdmin } from "../hooks/useAdmin";
import { FiExternalLink } from "react-icons/fi";
import { trackPageView } from "../utils/analytics";

// Add WakeLock types
declare global {
  interface WakeLockSentinel {
    readonly released: boolean;
    readonly type: "screen";
    release(): Promise<void>;
    addEventListener(type: "release", listener: () => void): void;
    removeEventListener(type: "release", listener: () => void): void;
  }

  interface WakeLock {
    readonly wakeLock: WakeLock;
    request(type: "screen"): Promise<WakeLockSentinel>;
  }

  interface Navigator {
    readonly wakeLock: WakeLock;
  }
}

// Define the pulse animation
const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.5;
  }
`;

interface ExpandableRowProps {
  result: ScoreHistory;
  year: string;
  ijsId: string;
}

function ExpandableRow({ result, year, ijsId }: ExpandableRowProps) {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <>
      <Tr cursor="pointer" onClick={onToggle} _hover={{ bg: "gray.50" }}>
        <Td padding={0} textAlign="center">
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
        <Td
          width={{ base: "40px", md: "60px" }}
          padding={{ base: 1, md: 3 }}
          isNumeric
        >
          {result.placement}
        </Td>
        <Td padding={{ base: 1, md: 3 }}>
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Link
                as={RouterLink}
                to={
                  result.skaterId
                    ? `/skater/id/${result.skaterId}`
                    : `/skater/${encodeURIComponent(result.name || "")}`
                }
                onClick={(e) => e.stopPropagation()}
                color="blue.500"
              >
                <Text fontWeight="medium">{result.name}</Text>
              </Link>
              <FavoriteButton
                type="skater"
                name={result.name || ""}
                params={
                  result.skaterId
                    ? { skaterId: result.skaterId }
                    : { name: result.name }
                }
              />
              {result.score && (
                <TossieButton
                  eventResultId={result.id}
                  skaterName={result.name || ""}
                  initialHasTossie={result.hasTossie}
                  eventDate={result.date}
                />
              )}
            </HStack>
            {result.club && (
              <Link
                as={RouterLink}
                to={`/club/${result.clubId}/competition/${year}/${ijsId}`}
                onClick={(e) => e.stopPropagation()}
                color="grey.600"
                fontSize="sm"
              >
                {result.club}
              </Link>
            )}
          </VStack>
        </Td>
        <Td
          width={{ base: "80px", md: "120px" }}
          padding={{ base: 1, md: 3 }}
          isNumeric
        >
          <Text fontWeight="medium">{Number(result.score).toFixed(2)}</Text>
          <Text fontSize="sm" color="gray.600">
            Start: {result.start}
          </Text>
        </Td>
      </Tr>
      {isOpen && result.judgeDetails && (
        <Tr>
          <Td colSpan={4} p={0}>
            <JudgeCard details={result.judgeDetails} />
          </Td>
        </Tr>
      )}
    </>
  );
}

function hasScoresChanged(
  prevResults: EventResults | undefined,
  newResults: EventResults
) {
  if (!prevResults) return false;

  return (
    prevResults.results.some((prevResult, index) => {
      const newResult = newResults.results[index];
      return (
        prevResult.score !== newResult.score ||
        prevResult.placement !== newResult.placement
      );
    }) || prevResults.status !== newResults.status
  );
}

export default function Results() {
  const { year, ijsId, eventId } = useParams();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const toast = useToast();
  const prevDataRef = React.useRef<EventResults>();
  const isAdmin = useAdmin();

  const { data, isLoading, refetch } = useQuery<EventResults>({
    queryKey: ["results", year, ijsId, eventId],
    queryFn: () => getEventResults(year!, ijsId!, eventId!),
    enabled: !!(year && ijsId && eventId),
  });

  const segmentStatus =
    data?.segments?.find((s) => s.isActive)?.status || data?.status || "";
  const isUnofficialStatus =
    segmentStatus === "Live unofficial" || segmentStatus === "Unofficial";

  const isWithinOneHourOfEvent = () => {
    if (!data?.date || !data?.time || !data?.timezone) return false;

    // Convert timezone if needed
    const ianaTimezone = convertToIANATimezone(data.timezone);

    // Create the event time in the competition's timezone
    const eventDateTime = dayjs.tz(
      `${data.date} ${data.time}`,
      "YYYY-MM-DD HH:mm:ss",
      ianaTimezone
    );

    const thirtyMinsBefore = eventDateTime.subtract(30, "minutes");
    return dayjs().isAfter(thirtyMinsBefore);
  };

  const shouldShowAutoRefresh =
    isUnofficialStatus ||
    (data?.status === "Start order" && isWithinOneHourOfEvent());

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio("/notification-new.mp3");
    audioRef.current.volume = 1.0; // Set volume to 100%
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current && !isMuted) {
      audioRef.current.play().catch((error) => {
        console.log("Audio playback failed:", error);
      });
    }
  };

  // Request wake lock when auto-refresh is enabled
  useEffect(() => {
    async function requestWakeLock() {
      if (autoRefresh && isUnofficialStatus) {
        try {
          // @ts-ignore
          if ("wakeLock" in navigator && navigator.wakeLock) {
            // @ts-ignore
            const lock = await navigator.wakeLock.request("screen");
            setWakeLock(lock);
          }
        } catch (err) {
          console.log("Wake Lock error:", err);
        }
      } else if (wakeLock) {
        await wakeLock.release();
        setWakeLock(null);
      }
    }
    requestWakeLock();
  }, [autoRefresh, isUnofficialStatus, wakeLock]);

  // Release wake lock when component unmounts
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
    };
  }, [wakeLock]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh && isUnofficialStatus) {
      interval = setInterval(() => {
        refetch();
      }, 9000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh, isUnofficialStatus, refetch]);

  useEffect(() => {
    if (segmentStatus === "Final") {
      setAutoRefresh(false);
    }
  }, [segmentStatus]);

  const vibrate = () => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([200, 100, 200]); // Vibrate-pause-vibrate pattern
    }
  };

  const notifyChanges = (newData: EventResults) => {
    if (!prevDataRef.current) {
      prevDataRef.current = newData;
      return;
    }

    if (hasScoresChanged(prevDataRef.current, newData)) {
      // Play sound
      playNotificationSound();

      // Vibrate the device
      vibrate();

      // Show toast notification
      toast({
        title: "Scores Updated",
        description: "New results have been received",
        status: "info",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }

    // Update the previous data reference
    prevDataRef.current = newData;
  };

  // Watch for data changes and notify if needed
  useEffect(() => {
    if (data && autoRefresh && shouldShowAutoRefresh) {
      notifyChanges(data);
    }
  }, [data, autoRefresh, isUnofficialStatus]);

  useEffect(() => {
    if (data) {
      trackPageView.event(
        year!,
        ijsId!,
        data.results[0].resultsUrl,
        data.eventName
      );
      document.title = `${data.eventName} - ${data.competitionTitle} - Skater Stats`;
    }
  }, [data, year, ijsId, eventId]);

  if (isLoading)
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );

  if (!data) return null;

  return (
    <Box p={{ base: 2, md: 8 }}>
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Heading>{data.eventName}</Heading>
            <VStack align="start" spacing={0}>
              <Link
                as={RouterLink}
                to={`/competition/${year}/${ijsId}`}
                color="blue.500"
                fontSize="lg"
              >
                {data.competitionTitle}
              </Link>
              {data.date && data.time && (
                <Text color="gray.600" fontSize="md">
                  {dayjs(data.date).format(DATE_FORMATS.DISPLAY)} at{" "}
                  {formatEventTime(data.date, data.time, data.timezone)}
                </Text>
              )}
              {isAdmin && data?.results?.[0]?.resultsUrl && (
                <Link
                  href={`https://ijs.usfigureskating.org/leaderboard/${
                    data.results[0].competitionType === "ijs_nonqual"
                      ? "nonqual_results"
                      : "results"
                  }/${year}/${ijsId}/${data.results[0].resultsUrl}`}
                  isExternal
                  color="gray.500"
                  fontSize="sm"
                  display="flex"
                  alignItems="center"
                >
                  <Text>View on IJS*</Text>
                  <Icon as={FiExternalLink} ml={1} />
                </Link>
              )}
            </VStack>
          </VStack>
          <FavoriteButton
            type="event"
            name={data.eventName}
            params={{ year: year!, ijsId: ijsId!, eventId: eventId! }}
          />
        </HStack>
        <HStack spacing={4}>
          <Badge colorScheme={segmentStatus === "Final" ? "green" : "orange"}>
            {segmentStatus}
          </Badge>
          {shouldShowAutoRefresh && (
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme={autoRefresh ? "red" : "blue"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "Stop Auto-Refresh" : "Start Auto-Refresh"}
              </Button>
              {autoRefresh && (
                <HStack spacing={2}>
                  <Box
                    w="8px"
                    h="8px"
                    borderRadius="full"
                    bg="red.500"
                    animation={`${pulse} 2s infinite`}
                  />
                  <IconButton
                    aria-label={
                      isMuted ? "Unmute notifications" : "Mute notifications"
                    }
                    icon={
                      isMuted ? <MdNotificationsOff /> : <MdNotifications />
                    }
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                  />
                </HStack>
              )}
            </HStack>
          )}
        </HStack>
      </VStack>
      <Box overflowX="auto" maxW="100%" mt={4}>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th width="40px" p={{ base: 1, md: 2 }}></Th>
              <Th
                width={{ base: "40px", md: "60px" }}
                p={{ base: 2, md: 3 }}
                isNumeric
              >
                Place
              </Th>
              <Th p={{ base: 2, md: 3 }}>Skater</Th>
              <Th
                width={{ base: "80px", md: "120px" }}
                p={{ base: 2, md: 3 }}
                isNumeric
              >
                Score
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.results.map((result, index) => (
              <ExpandableRow
                key={index}
                result={result}
                year={year!}
                ijsId={ijsId!}
              />
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Officials Section */}
      {data.officials && data.officials.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>
            Officials
          </Heading>
          <Box overflowX="auto" maxW="100%">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th p={{ base: 2, md: 3 }}>Function</Th>
                  <Th p={{ base: 2, md: 3 }}>Name</Th>
                  <Th p={{ base: 2, md: 3 }}>Location</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.officials.map((official) => (
                  <Tr key={`${official.function}-${official.name}`}>
                    <Td p={{ base: 2, md: 3 }}>{official.function}</Td>
                    <Td p={{ base: 2, md: 3 }}>
                      <Link
                        as={RouterLink}
                        to={`/official/id/${official.id}`}
                        color="blue.500"
                      >
                        {official.name}
                      </Link>
                    </Td>
                    <Td p={{ base: 2, md: 3 }}>{official.location}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
}
