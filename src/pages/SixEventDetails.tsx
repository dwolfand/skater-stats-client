import { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Link,
  Spinner,
  Center,
  Icon,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getCompetitionData, getSixEventDetails } from "../api/client";
import TossieButton from "../components/TossieButton";
import { FiExternalLink } from "react-icons/fi";
import { useAdmin } from "../hooks/useAdmin";

interface Official {
  function: string;
  name: string;
  location: string;
  id: number;
}

interface SixEventResult {
  id: number;
  name: string;
  club: string | null;
  club_id: number | null;
  place: string | null;
  judge_scores: string[] | null;
  majority: string | null;
  tie_breaker: string | null;
  start_number: string | null;
  status: string | null;
  skater_id: number;
  six_event_id: number;
  hasTossie: boolean;
}

interface SixEventDetails {
  id: number;
  name: string;
  segment: string;
  status: string | null;
  resultsUrl: string;
  type: string;
  results: SixEventResult[];
  officials: Official[];
  startDate: string;
}

export default function SixEventDetails() {
  const { year, ijsId, resultsUrl } = useParams<{
    year: string;
    ijsId: string;
    resultsUrl: string;
  }>();
  const isAdmin = useAdmin();

  const { data: competitionData, isLoading: isCompetitionLoading } = useQuery({
    queryKey: ["competition", year, ijsId],
    queryFn: () => getCompetitionData(year!, ijsId!),
    enabled: !!(year && ijsId),
  });

  const {
    data: eventDetails,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sixEventDetails", year, ijsId, resultsUrl],
    queryFn: () => getSixEventDetails(year!, ijsId!, resultsUrl!),
    enabled: !!(year && ijsId && resultsUrl),
  });

  if (isLoading || isCompetitionLoading) {
    return (
      <Center minH="calc(100vh - 64px)" p={4}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error || !eventDetails) {
    return (
      <Box p={4}>
        <Text color="red.500">
          Error: {error ? String(error) : "Event details not found"}
        </Text>
      </Box>
    );
  }

  // Get the number of judges from the first result that has judge scores
  const firstResultWithScores = eventDetails.results.find(
    (result: SixEventResult) => result.judge_scores
  );
  const numJudges = firstResultWithScores?.judge_scores?.length || 0;
  const judgeNumbers = Array.from({ length: numJudges }, (_, i) => i + 1);

  // Check if any result has a start number
  const hasStartNumbers = eventDetails.results.some(
    (result: SixEventResult) => result.start_number !== null
  );

  return (
    <Box p={4}>
      <VStack align="stretch" spacing={8} mb={4}>
        <HStack justify="space-between" align="flex-start">
          <VStack align="start" spacing={1}>
            <Heading fontSize={{ base: "xl", md: "2xl" }}>
              {eventDetails.name}
            </Heading>
            <Link
              as={RouterLink}
              to={`/competition/${year}/${ijsId}`}
              color="blue.500"
              fontSize="lg"
            >
              {competitionData?.name || "Competition"}
            </Link>
            <Text color="gray.600">
              Segment: {eventDetails.segment}
              {eventDetails.status && ` • Status: ${eventDetails.status}`}
            </Text>
            {isAdmin && (
              <Link
                href={`https://ijs.usfigureskating.org/leaderboard/${
                  eventDetails.type === "ijs_nonqual"
                    ? "nonqual_results"
                    : "results"
                }/${year}/${ijsId}/${eventDetails.resultsUrl}`}
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
        </HStack>
      </VStack>

      {eventDetails.results.length > 0 && (
        <Box mb={8} overflowX="auto">
          <Heading size="lg" mb={4}>
            Results
          </Heading>
          <Table variant="simple" size={{ base: "sm", md: "md" }}>
            <Thead>
              <Tr>
                <Th p={{ base: 2, md: 4 }}>Place</Th>
                <Th p={{ base: 2, md: 4 }}>Name</Th>
                {judgeNumbers.map((num) => (
                  <Th key={num} isNumeric p={{ base: 2, md: 4 }}>
                    {num}
                  </Th>
                ))}
                <Th isNumeric p={{ base: 2, md: 4 }}>
                  Maj.
                </Th>
                {eventDetails.results.find(
                  (result: SixEventResult) => result.tie_breaker
                ) && <Th p={{ base: 2, md: 4 }}>Tie Br.</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {eventDetails.results.map((result: SixEventResult) => (
                <Tr key={result.id}>
                  <Td p={{ base: 2, md: 4 }}>{result.place}.</Td>
                  <Td p={{ base: 2, md: 4 }}>
                    <Box>
                      <HStack spacing={2} align="center">
                        <Link
                          as={RouterLink}
                          to={
                            result.skater_id
                              ? `/skater/id/${result.skater_id}`
                              : `/skater/${encodeURIComponent(result.name)}`
                          }
                          color="blue.500"
                          display="block"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {result.name}
                        </Link>
                        {result.majority && (
                          <TossieButton
                            sixEventResultId={result.id}
                            skaterName={result.name}
                            initialHasTossie={result.hasTossie}
                            eventDate={eventDetails.startDate}
                          />
                        )}
                      </HStack>
                      {result.club && (
                        <Link
                          as={RouterLink}
                          to={`/club/${result.club_id}/competition/${year}/${ijsId}`}
                          onClick={(e) => e.stopPropagation()}
                          color="gray.600"
                          fontSize="sm"
                          mt={1}
                          display="block"
                        >
                          {result.club}
                        </Link>
                      )}
                    </Box>
                  </Td>
                  {judgeNumbers.map((num) => (
                    <Td
                      key={num}
                      isNumeric
                      p={{ base: 2, md: 4 }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {result.judge_scores?.[num - 1] || "-"}
                    </Td>
                  ))}
                  <Td
                    isNumeric
                    p={{ base: 2, md: 4 }}
                    fontSize={{ base: "sm", md: "md" }}
                  >
                    <VStack spacing={1} align="flex-end">
                      <Text>{result.majority || "-"}</Text>
                      {hasStartNumbers && (
                        <Text fontSize="xs" color="gray.500">
                          Start: {result.start_number || "-"}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  {result.tie_breaker && (
                    <Td
                      p={{ base: 2, md: 4 }}
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {result.tie_breaker}
                    </Td>
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {eventDetails.officials.length > 0 && (
        <Box>
          <Heading size="lg" mb={4}>
            Officials
          </Heading>
          <Table variant="simple" size={{ base: "sm", md: "md" }}>
            <Thead>
              <Tr>
                <Th p={{ base: 2, md: 4 }}>Function</Th>
                <Th p={{ base: 2, md: 4 }}>Name</Th>
                <Th p={{ base: 2, md: 4 }}>Location</Th>
              </Tr>
            </Thead>
            <Tbody>
              {eventDetails.officials.map(
                (official: Official, index: number) => (
                  <Tr key={index}>
                    <Td p={{ base: 2, md: 4 }}>{official.function}</Td>
                    <Td p={{ base: 2, md: 4 }}>
                      <Link
                        as={RouterLink}
                        to={`/official/id/${official.id}`}
                        color="blue.500"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        {official.name}
                      </Link>
                    </Td>
                    <Td p={{ base: 2, md: 4 }}>{official.location || "-"}</Td>
                  </Tr>
                )
              )}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
}
