import React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "../utils/date";
import { getClubStats, type ClubCompetitionDetails } from "../api/client";

export default function ClubCompetition() {
  const { clubId, year, ijsId } = useParams<{
    clubId: string;
    year: string;
    ijsId: string;
  }>();

  const { data, isLoading } = useQuery({
    queryKey: ["club", clubId, "competition", year, ijsId],
    queryFn: async () => {
      if (!clubId || !year || !ijsId) throw new Error("Missing parameters");
      const data = await getClubStats(clubId, { year, ijsId });
      if (!("clubName" in data)) {
        throw new Error("Unexpected data type");
      }
      return data;
    },
    enabled: !!clubId && !!year && !!ijsId,
  });

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (!data) {
    return (
      <Container py={8}>
        <Text>Competition details not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Link
            as={RouterLink}
            to={`/club/${clubId}`}
            color="brand.500"
            fontWeight="medium"
            mb={4}
            display="inline-block"
          >
            {data.clubName}
          </Link>
          <Heading size="lg" mb={2}>
            {data.competitionName}
          </Heading>
          <Text color="gray.600">
            {dayjs(data.date).format("MMM D, YYYY")} · {data.skaters.length}{" "}
            club skaters
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Club Skaters and Events
          </Heading>
          <Accordion allowMultiple>
            {data.skaters.map((skater) => (
              <AccordionItem key={skater.id} border="none">
                <h2>
                  <AccordionButton
                    _hover={{ bg: "brand.50" }}
                    _expanded={{ bg: "brand.50", color: "brand.600" }}
                    borderRadius="md"
                  >
                    <AccordionIcon mr={2} />
                    <Box flex="1" textAlign="left">
                      <Link
                        as={RouterLink}
                        to={`/skater/id/${skater.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {skater.name}
                      </Link>
                    </Box>
                    <Text color="gray.600">{skater.events.length} events</Text>
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4} pt={4} bg="brand.50">
                  <Box overflowX="auto">
                    <Table
                      bg="white"
                      variant="simple"
                      size="sm"
                      sx={{
                        "th, td": {
                          px: { base: "2", md: "4" },
                        },
                      }}
                    >
                      <Thead>
                        <Tr>
                          <Th>Event</Th>
                          <Th>Segment</Th>
                          <Th>Pl.</Th>
                          <Th isNumeric>Score</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {skater.events.map((event, idx) => (
                          <Tr key={idx}>
                            <Td>
                              <Link
                                as={RouterLink}
                                to={`/competition/${year}/${ijsId}/${
                                  event.isSixEvent ? "six-event" : "event"
                                }/${encodeURIComponent(event.resultsUrl)}`}
                              >
                                {event.name}
                              </Link>
                            </Td>
                            <Td>{event.segment}</Td>
                            <Td>{event.placement}</Td>
                            <Td isNumeric>
                              {event.isSixEvent
                                ? event.majority || "-"
                                : event.score !== null
                                ? event.score.toFixed(2)
                                : "-"}
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      </VStack>
    </Container>
  );
}
