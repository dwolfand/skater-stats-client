import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
  Link,
  Spinner,
  Center,
  Button,
  HStack,
  Select,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "../utils/date";
import { getClubStats, type ClubStats } from "../api/client";

const PAGE_SIZES = [10, 25, 50, 100];

export default function Club() {
  const { clubId } = useParams<{ clubId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const { data: clubStats, isLoading } = useQuery({
    queryKey: ["club", clubId],
    queryFn: async () => {
      const data = await getClubStats(clubId!);
      if ("clubName" in data) {
        throw new Error("Unexpected data type");
      }
      return data;
    },
    enabled: !!clubId,
  });

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (!clubStats) {
    return (
      <Container py={8}>
        <Text>Club not found</Text>
      </Container>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(clubStats.competitions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCompetitions = clubStats.competitions.slice(
    startIndex,
    endIndex
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            {clubStats.name}
          </Heading>
          <Text color="gray.600">
            {clubStats.totalSkaters} skaters · {clubStats.totalCompetitions}{" "}
            competitions
          </Text>
        </Box>

        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Competition History</Heading>
            <HStack spacing={4}>
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                width="auto"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </Select>
            </HStack>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Competition</Th>
                <Th>Date</Th>
                <Th isNumeric>Club Skaters</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentCompetitions.map((competition) => (
                <Tr key={`${competition.year}-${competition.ijsId}`}>
                  <Td>
                    <Link
                      as={RouterLink}
                      to={`/club/${clubId}/competition/${competition.year}/${competition.ijsId}`}
                      color="blue.500"
                    >
                      {competition.name}
                    </Link>
                  </Td>
                  <Td>{dayjs(competition.date).format("MMM D, YYYY")}</Td>
                  <Td isNumeric>{competition.skaterCount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {totalPages > 1 && (
            <HStack justify="center" mt={4} spacing={2}>
              <Button
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </HStack>
          )}
        </Box>
      </VStack>
    </Container>
  );
}
