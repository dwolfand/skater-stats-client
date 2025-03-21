import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Container,
  HStack,
  Button,
  Select,
  Grid,
} from "@chakra-ui/react";
import { getCompetitions } from "../api/competitions";
import { CompetitionCard } from "../components/CompetitionCard";

const PAGE_SIZES = [10, 25, 50, 100];

interface Competition {
  ijsId: string;
  year: string;
  name: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue: string;
  city: string;
  state: string;
  logoRef: string | null;
}

export default function CompetitionList() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    async function fetchCompetitions() {
      try {
        const data = await getCompetitions();
        setCompetitions(data);
      } catch (err) {
        setError("Failed to load competitions");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCompetitions();
  }, []);

  if (loading) {
    return (
      <Container py={8}>
        <Text>Loading competitions...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container py={8}>
        <Text color="red.500">Error: {error}</Text>
      </Container>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(competitions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCompetitions = competitions.slice(startIndex, endIndex);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading>Figure Skating Competitions</Heading>
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

        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
          {currentCompetitions.map((competition) => (
            <CompetitionCard
              key={`${competition.year}-${competition.ijsId}`}
              competition={competition}
            />
          ))}
        </Grid>

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
      </VStack>
    </Container>
  );
}
