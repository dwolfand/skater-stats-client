import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
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
} from "@chakra-ui/react";
import { getEventResults } from "../api/client";
import { EventResults } from "../types";

export default function EventDetail() {
  const { id, eventId } = useParams();
  const { data, isLoading } = useQuery<EventResults>({
    queryKey: ["event", id, eventId],
    queryFn: () => getEventResults(id!, eventId!),
  });

  if (isLoading) return <Spinner />;
  if (!data) return null;

  return (
    <Box p={8}>
      <Heading mb={6}>{data.eventName}</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Place</Th>
            <Th>Name</Th>
            <Th>Club</Th>
            <Th>Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.results.map((result, index: number) => (
            <Tr key={index}>
              <Td>{result.place}</Td>
              <Td>{result.name}</Td>
              <Td>{result.club}</Td>
              <Td>{result.score}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
