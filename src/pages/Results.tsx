import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { ChevronDownIcon, ChevronUpIcon, RepeatIcon } from "@chakra-ui/icons";
import { getEventResults, EventResults } from "../api/client";
import JudgeCard from "../components/JudgeCard";

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
  result: EventResults["results"][0];
}

interface Official {
  function: string;
  name: string;
  location: string;
}

function ExpandableRow({ result }: ExpandableRowProps) {
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
          {result.place}
        </Td>
        <Td padding={{ base: 1, md: 3 }}>
          <VStack align="start" spacing={0}>
            <Link
              as={RouterLink}
              to={`/skater/${encodeURIComponent(result.name)}`}
              onClick={(e) => e.stopPropagation()}
              color="blue.600"
              _hover={{ textDecoration: "none", color: "blue.700" }}
            >
              <Text fontWeight="medium">{result.name}</Text>
            </Link>
            <Text fontSize="sm" color="gray.600">
              {result.club}
            </Text>
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
      {isOpen && result.details && (
        <Tr>
          <Td colSpan={4} p={0}>
            <JudgeCard
              details={{
                baseElementsScore: 0,
                totalElementScore: Number(result.details.executedElements),
                totalComponentScore: Number(result.details.programComponents),
                totalDeductions: Number(result.details.deductions),
                elements: result.details.elements.map((element, index) => ({
                  number: index + 1,
                  elementCode: element.executed || element.planned,
                  baseValue: Number(element.baseValue),
                  credit: true,
                  goe: Number(element.goe),
                  judgesGoe: [],
                  value: Number(element.score),
                  plannedElement: element.planned,
                  executedElement: element.executed,
                })),
                components: result.details.components.map((component) => ({
                  name: component.name,
                  factor: Number(component.factor) || 1,
                  judgesScores: [],
                  value: Number(component.score),
                })),
                deductions: result.details.deductionDetails.map(
                  (deduction) => ({
                    name: deduction.name,
                    value: Number(deduction.value),
                  })
                ),
              }}
            />
          </Td>
        </Tr>
      )}
    </>
  );
}

export default function Results() {
  const { year, ijsId, eventId } = useParams();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [wakeLock, setWakeLock] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery<EventResults>({
    queryKey: ["results", year, ijsId, eventId],
    queryFn: () => getEventResults(year!, ijsId!, eventId!),
    enabled: !!(year && ijsId && eventId),
  });

  const segmentStatus = data?.segments.find((s) => s.isActive)?.status || "";
  const isUnofficialStatus =
    segmentStatus === "Live unofficial" || segmentStatus === "Unofficial";

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
      }, 10000);
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

  if (isLoading) return <Spinner />;
  if (!data) return null;

  return (
    <Box p={8}>
      <VStack align="stretch" spacing={4}>
        <Heading>{data.eventName}</Heading>
        <Link
          as={RouterLink}
          to={`/competition/${year}/${ijsId}`}
          color="blue.500"
          fontSize="lg"
        >
          {data.competitionTitle}
        </Link>
        <HStack spacing={4}>
          <Badge colorScheme={segmentStatus === "Final" ? "green" : "orange"}>
            {segmentStatus}
          </Badge>
          {isUnofficialStatus && (
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme={autoRefresh ? "red" : "blue"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? "Stop Auto-Refresh" : "Start Auto-Refresh"}
              </Button>
              {autoRefresh && (
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg="red.500"
                  animation={`${pulse} 2s infinite`}
                />
              )}
            </HStack>
          )}
        </HStack>
      </VStack>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th width="40px" padding={0}></Th>
            <Th
              width={{ base: "40px", md: "60px" }}
              padding={{ base: 1, md: 3 }}
              isNumeric
            >
              Place
            </Th>
            <Th padding={{ base: 1, md: 3 }}>Skater</Th>
            <Th
              width={{ base: "80px", md: "120px" }}
              padding={{ base: 1, md: 3 }}
              isNumeric
            >
              Score
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.results.map((result, index) => (
            <ExpandableRow key={index} result={result} />
          ))}
        </Tbody>
      </Table>

      {/* Officials Section */}
      {data.officials && data.officials.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>
            Officials
          </Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Function</Th>
                <Th>Name</Th>
                <Th>Location</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.officials.map((official) => (
                <Tr key={`${official.function}-${official.name}`}>
                  <Td>{official.function}</Td>
                  <Td>
                    <Link
                      as={RouterLink}
                      to={`/official/${encodeURIComponent(official.name)}`}
                      color="blue.500"
                    >
                      {official.name}
                    </Link>
                  </Td>
                  <Td>{official.location}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
