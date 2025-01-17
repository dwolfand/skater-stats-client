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
} from "@chakra-ui/react";
import { getCompetitions } from "../api/competitions";
import dayjs from "dayjs";
import { DATE_FORMATS } from "../utils/date";
import FavoriteButton from "../components/FavoriteButton";

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
}

export default function CompetitionList() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Figure Skating Competitions</Heading>
      <VStack align="stretch" spacing={4}>
        {competitions.map((competition) => (
          <Card
            key={`${competition.year}-${competition.ijsId}`}
            p={6}
            border="none"
          >
            <HStack justify="space-between" align="start">
              <Box>
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
                  {dayjs(competition.startDate).format(DATE_FORMATS.DISPLAY)} -{" "}
                  {dayjs(competition.endDate).format(DATE_FORMATS.DISPLAY)}
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
    </Container>
  );
}
