import { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Heading, VStack, Text, Link } from "@chakra-ui/react";
import { getCompetitions } from "../api/competitions";

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
      <Box p={8}>
        <Text>Loading competitions...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={6}>Figure Skating Competitions</Heading>
      <VStack align="stretch" spacing={4}>
        {competitions.map((competition) => (
          <Link
            key={`${competition.year}-${competition.ijsId}`}
            as={RouterLink}
            to={`/competition/${competition.year}/${competition.ijsId}`}
            _hover={{ textDecoration: "none" }}
          >
            <Box
              p={6}
              borderWidth={1}
              borderRadius="lg"
              _hover={{ bg: "gray.50" }}
            >
              <Heading size="md" mb={2}>
                {competition.name}
              </Heading>
              <Text color="gray.600">
                {new Date(competition.startDate).toLocaleDateString()} -{" "}
                {new Date(competition.endDate).toLocaleDateString()} (
                {competition.timezone})
              </Text>
              <Text color="gray.600">
                {competition.venue}, {competition.city}, {competition.state}
              </Text>
            </Box>
          </Link>
        ))}
      </VStack>
    </Box>
  );
}
