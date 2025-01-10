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
  Select,
} from "@chakra-ui/react";
import { useState } from "react";
import { getOfficialStats } from "../api/client";

const ITEMS_PER_PAGE = 20;

export default function Official() {
  const { name } = useParams<{ name: string }>();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["official", name],
    queryFn: () => getOfficialStats(name!),
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
          <Badge colorScheme="purple" fontSize="md">
            Judge
          </Badge>
          <Text mt={2} color="gray.600">
            From {stats.mostRecentLocation}
          </Text>
        </Box>

        {/* Summary Statistics */}
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

        <Divider />

        {/* Component Scoring Analysis */}
        <Box>
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
            <HStack>
              <Select
                size="sm"
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                maxW="100px"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <option key={page} value={page}>
                      {page}
                    </option>
                  )
                )}
              </Select>
              <Text fontSize="sm" color="gray.600">
                of {totalPages}
              </Text>
            </HStack>
          </HStack>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Competition</Th>
                <Th>Event</Th>
                <Th>Role</Th>
                <Th>Location</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentHistory.map((entry, index) => (
                <Tr key={index}>
                  <Td>{new Date(entry.date).toLocaleDateString()}</Td>
                  <Td>
                    <Link
                      as={RouterLink}
                      to={`/competition/${entry.year}/${entry.ijsId}`}
                      color="blue.500"
                    >
                      {entry.competition}
                    </Link>
                  </Td>
                  <Td>
                    {entry.resultsUrl && (
                      <Link
                        as={RouterLink}
                        to={`/competition/${entry.year}/${
                          entry.ijsId
                        }/event/${encodeURIComponent(entry.resultsUrl)}`}
                        color="blue.500"
                      >
                        {entry.eventName}
                      </Link>
                    )}
                  </Td>
                  <Td>{entry.function}</Td>
                  <Td>{entry.location}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
}
