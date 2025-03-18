import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  VStack,
  Text,
  Link,
  Card,
  Container,
  Badge,
  HStack,
  Button,
  Select,
} from "@chakra-ui/react";
import { getCompetitions } from "../api/competitions";
import dayjs from "dayjs";
import { DATE_FORMATS } from "../utils/date";
import FavoriteButton from "../components/FavoriteButton";

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

        <VStack align="stretch" spacing={4}>
          {currentCompetitions.map((competition) => (
            <Card
              key={`${competition.year}-${competition.ijsId}`}
              p={6}
              border="none"
            >
              <HStack justify="space-between" align="start" spacing={6}>
                {competition.logoRef && (
                  <Box flexShrink={0} width="100px" height="100px">
                    <img
                      src={competition.logoRef}
                      alt={`${competition.name} logo`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </Box>
                )}
                <Box flex="1">
                  <Link
                    as={RouterLink}
                    to={`/competition/${competition.year}/${competition.ijsId}`}
                    _hover={{ textDecoration: "none" }}
                  >
                    <Heading size="sm" mb={2}>
                      {competition.name}
                    </Heading>
                  </Link>
                  <Text color="gray.600" fontSize="sm">
                    {dayjs(competition.startDate).format(DATE_FORMATS.DISPLAY)}{" "}
                    - {dayjs(competition.endDate).format(DATE_FORMATS.DISPLAY)}
                    {competition.timezone && ` (${competition.timezone})`}
                  </Text>
                  <Text color="gray.600" fontSize="sm">
                    {[competition.venue, competition.city, competition.state]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>
                </Box>
                <FavoriteButton
                  type="competition"
                  name={competition.name}
                  params={{ year: competition.year, ijsId: competition.ijsId }}
                />
              </HStack>
            </Card>
          ))}
        </VStack>

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
