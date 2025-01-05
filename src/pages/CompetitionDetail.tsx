import { useQuery } from "@tanstack/react-query";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  VStack,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { getCompetitionData } from "../api/client";

export default function CompetitionDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["competition", id],
    queryFn: () => getCompetitionData(id!),
  });

  if (isLoading) return <Spinner />;

  return (
    <VStack p={8} spacing={8} align="stretch">
      <Heading mb={6}>Competition Schedule</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Time</Th>
            <Th>Event</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.events.map((event, index) => (
            <Tr key={index}>
              <Td>{event.date}</Td>
              <Td>{event.time}</Td>
              <Td>{event.event}</Td>
              <Td>
                {event.resultsUrl ? (
                  <ChakraLink
                    as={RouterLink}
                    to={`/competition/${id}/results/${encodeURIComponent(
                      event.resultsUrl
                    )}`}
                    color="blue.500"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {event.status}
                  </ChakraLink>
                ) : (
                  event.status
                )}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {data?.sixEvents && data.sixEvents.length > 0 && (
        <>
          <Heading size="lg" mt={8}>
            6.0 System Events
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Event</Th>
                <Th>Segment</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.sixEvents.map((event, index) => (
                <Tr key={index}>
                  <Td>{event.event}</Td>
                  <Td>
                    <ChakraLink
                      as={RouterLink}
                      to={`/competition/${id}/results/${encodeURIComponent(
                        event.resultsUrl
                      )}`}
                      color="blue.500"
                      _hover={{ textDecoration: "underline" }}
                    >
                      {event.segment}
                    </ChakraLink>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </VStack>
  );
}
