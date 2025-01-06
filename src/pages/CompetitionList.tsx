import { Box, Heading, VStack, Text, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCompetitions } from "../api/client";
import { Competition } from "../types";

export default function CompetitionList() {
  const { data: competitions = [], isLoading } = useQuery<Competition[]>({
    queryKey: ["competitions"],
    queryFn: getCompetitions,
  });

  return (
    <Box p={8}>
      <Heading mb={6}>Figure Skating Competitions</Heading>
      {isLoading ? (
        <Text>Loading competitions...</Text>
      ) : (
        <VStack align="stretch" spacing={4}>
          {competitions.map((competition) => (
            <Link
              key={competition.id}
              as={RouterLink}
              to={`/competition/${competition.id}`}
              p={4}
              borderWidth={1}
              borderRadius="md"
              _hover={{ bg: "gray.50" }}
            >
              <Text fontSize="lg" fontWeight="bold">
                {competition.name}
              </Text>
              <Text color="gray.600">{competition.date}</Text>
            </Link>
          ))}
        </VStack>
      )}
    </Box>
  );
}
