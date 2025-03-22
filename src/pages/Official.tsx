import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Divider,
  Link,
  HStack,
  Card,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  PaginationRoot,
  PaginationPrevTrigger,
  PaginationNextTrigger,
  PaginationItems,
} from "../components/ui/pagination";
import { getOfficialStats, getOfficialStatsById } from "../api/client";
import { trackPageView } from "../utils/analytics";

const ITEMS_PER_PAGE = 20;

function calculateExperienceText(firstEventDate: string): string {
  const firstEvent = dayjs(firstEventDate);
  const now = dayjs();
  const years = now.diff(firstEvent, "year");

  if (years > 6) {
    return "Over 6 years experience";
  }

  if (years > 0) {
    return `${years} ${years === 1 ? "year" : "years"} experience`;
  }

  const months = now.diff(firstEvent, "month");
  return `${months} ${months === 1 ? "month" : "months"} experience`;
}

export default function Official() {
  const { name, id } = useParams<{ name?: string; id?: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["officialStats", name || id],
    queryFn: () => {
      if (id) {
        return getOfficialStatsById(parseInt(id));
      }
      if (name) {
        return getOfficialStats(name);
      }
      throw new Error("Either name or id must be provided");
    },
  });

  useEffect(() => {
    if (name) {
      trackPageView.official(name);
    }
  }, [name]);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4} align="stretch">
          <Heading size="lg">No competition history found</Heading>
          <Text>We couldn't find any competitions judged by "{name}".</Text>
          <Text>
            Please try again, or{" "}
            <Link
              as="button"
              onClick={() => window.history.back()}
              color="blue.500"
            >
              go back
            </Link>
            .
          </Text>
        </VStack>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>No data found for this official.</Text>
      </Container>
    );
  }

  // Sort history by date descending and calculate pagination
  const sortedHistory = [...stats.history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const totalPages = Math.ceil(sortedHistory.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentHistory = sortedHistory.slice(startIndex, endIndex);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>
            {stats.name}
          </Heading>
          <HStack spacing={2}>
            <Badge colorScheme="purple" fontSize="md">
              Judge
            </Badge>
            <Badge colorScheme="blue" fontSize="md">
              {calculateExperienceText(stats.firstEventDate)}
            </Badge>
          </HStack>
          <Text mt={2} color="gray.600">
            From {stats.mostRecentLocation}
          </Text>
        </Box>

        {/* Summary Statistics */}
        <Card mb={8} p={6} border="none">
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Total Events</StatLabel>
              <StatNumber>{stats.totalEvents}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Total Competitions</StatLabel>
              <StatNumber>{stats.totalCompetitions}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Elements Judged</StatLabel>
              <StatNumber>{stats.elementStats.totalElements}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Average GOE</StatLabel>
              <StatNumber>
                {stats.averageGOE != null
                  ? Number(stats.averageGOE).toFixed(2)
                  : "N/A"}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        </Card>

        <Divider />

        {/* Component Scoring Analysis */}
        <Box mb={8}>
          <Heading size="md" mb={4}>
            Program Component Scoring
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Component</Th>
                <Th isNumeric>Average Score</Th>
                <Th isNumeric>Times Scored</Th>
              </Tr>
            </Thead>
            <Tbody>
              {[...stats.componentAverages]
                .sort((a, b) => b.count - a.count)
                .map((comp) => (
                  <Tr key={comp.name}>
                    <Td>{comp.name}</Td>
                    <Td isNumeric>
                      {comp.average != null
                        ? Number(comp.average).toFixed(2)
                        : "N/A"}
                    </Td>
                    <Td isNumeric>{comp.count}</Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>

        <Divider />

        {/* Competition History */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Competition History</Heading>
            <PaginationRoot
              count={sortedHistory.length}
              pageSize={ITEMS_PER_PAGE}
              page={currentPage}
              onPageChange={(e) => setCurrentPage(e.page)}
              size="sm"
            >
              <HStack>
                <PaginationPrevTrigger />
                <PaginationItems />
                <PaginationNextTrigger />
              </HStack>
            </PaginationRoot>
          </HStack>
          <Box overflowX="auto" maxW="100%">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th width="100px">Date</Th>
                  <Th display={{ base: "none", md: "table-cell" }} width="30%">
                    Competition
                  </Th>
                  <Th width={{ base: "60%", md: "30%" }}>Event</Th>
                  <Th width="100px">Role</Th>
                  <Th width="20%">Location</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentHistory.map((entry, index) => (
                  <Tr key={index}>
                    <Td whiteSpace="nowrap">
                      {new Date(entry.date).toLocaleDateString()}
                    </Td>
                    <Td display={{ base: "none", md: "table-cell" }}>
                      <Link
                        as={RouterLink}
                        to={`/competition/${entry.year}/${entry.ijsId}`}
                        color="blue.500"
                      >
                        {entry.competition}
                      </Link>
                    </Td>
                    <Td>
                      {entry.resultsUrl ? (
                        <Link
                          as={RouterLink}
                          to={
                            entry.isSixEvent
                              ? `/competition/${entry.year}/${
                                  entry.ijsId
                                }/six-event/${encodeURIComponent(
                                  entry.resultsUrl
                                )}`
                              : `/competition/${entry.year}/${
                                  entry.ijsId
                                }/event/${encodeURIComponent(entry.resultsUrl)}`
                          }
                          color="blue.500"
                        >
                          {entry.eventName}
                        </Link>
                      ) : (
                        <Text>{entry.eventName}</Text>
                      )}
                      <Text
                        display={{ base: "block", md: "none" }}
                        fontSize="sm"
                        color="gray.600"
                        mt={1}
                      >
                        {entry.competition}
                      </Text>
                    </Td>
                    <Td>{entry.function}</Td>
                    <Td>{entry.location}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    </Container>
  );
}
