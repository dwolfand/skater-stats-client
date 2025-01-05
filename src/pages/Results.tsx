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
  Collapse,
  Button,
  VStack,
  Text,
  Grid,
  GridItem,
  Stack,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { getEventResults } from "../api/client";
import { useState } from "react";

export default function Results() {
  const { id, resultsUrl } = useParams();
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["results", id, resultsUrl],
    queryFn: () => getEventResults(id!, resultsUrl!),
    enabled: !!(id && resultsUrl),
  });

  if (isLoading) return <Spinner />;

  return (
    <Box p={4}>
      <Heading size={{ base: "md", md: "lg" }} mb={6}>
        {data?.eventName}
      </Heading>
      <Table variant="simple" size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Place</Th>
            <Th>Start</Th>
            <Th>Name</Th>
            <Th display={{ base: "none", md: "table-cell" }}>Club</Th>
            <Th isNumeric>Score</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.results.map((result, index) => (
            <>
              <Tr
                key={`row-${index}`}
                onClick={() =>
                  setExpandedRow(expandedRow === index ? null : index)
                }
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
              >
                <Td>{result.place}</Td>
                <Td>{result.start}</Td>
                <Td>
                  <Text>{result.name}</Text>
                  <Text
                    display={{ base: "block", md: "none" }}
                    fontSize="sm"
                    color="gray.600"
                  >
                    {result.club}
                  </Text>
                </Td>
                <Td display={{ base: "none", md: "table-cell" }}>
                  {result.club}
                </Td>
                <Td isNumeric>{result.score}</Td>
              </Tr>
              <Tr key={`details-${index}`}>
                <Td colSpan={5} p={0}>
                  <Collapse in={expandedRow === index}>
                    <Stack
                      p={4}
                      bg="gray.50"
                      spacing={4}
                      direction={{ base: "column", lg: "row" }}
                    >
                      <Card flex="1">
                        <CardHeader>
                          <Text fontWeight="bold">Elements</Text>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start">
                            <Table size="sm" variant="simple">
                              <Thead>
                                <Tr>
                                  <Th>Planned</Th>
                                  <Th>Executed</Th>
                                  <Th
                                    display={{ base: "none", md: "table-cell" }}
                                  >
                                    Base
                                  </Th>
                                  <Th
                                    display={{ base: "none", md: "table-cell" }}
                                  >
                                    GOE
                                  </Th>
                                  <Th isNumeric>Score</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {result.details.elements.map((element, i) => (
                                  <Tr key={i}>
                                    <Td>{element.planned}</Td>
                                    <Td>{element.executed}</Td>
                                    <Td
                                      display={{
                                        base: "none",
                                        md: "table-cell",
                                      }}
                                    >
                                      {element.baseValue}
                                    </Td>
                                    <Td
                                      display={{
                                        base: "none",
                                        md: "table-cell",
                                      }}
                                    >
                                      {element.goe}
                                    </Td>
                                    <Td isNumeric>{element.score}</Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </VStack>
                        </CardBody>
                      </Card>
                      <Card flex="1">
                        <CardHeader>
                          <Text fontWeight="bold">Components</Text>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start">
                            <Table size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Component</Th>
                                  <Th isNumeric>Score</Th>
                                  <Th
                                    display={{ base: "none", md: "table-cell" }}
                                  >
                                    Factor
                                  </Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {result.details.components.map(
                                  (component, i) => (
                                    <Tr key={i}>
                                      <Td>{component.name}</Td>
                                      <Td isNumeric>{component.score}</Td>
                                      <Td
                                        display={{
                                          base: "none",
                                          md: "table-cell",
                                        }}
                                      >
                                        {component.factor}
                                      </Td>
                                    </Tr>
                                  )
                                )}
                              </Tbody>
                            </Table>
                          </VStack>
                        </CardBody>
                      </Card>
                      <Card flex="1">
                        <CardHeader>
                          <Text fontWeight="bold">Deductions</Text>
                        </CardHeader>
                        <CardBody>
                          <VStack align="start">
                            <Table size="sm">
                              <Thead>
                                <Tr>
                                  <Th>Type</Th>
                                  <Th isNumeric>Value</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {result.details.deductionDetails.map(
                                  (deduction, i) => (
                                    <Tr key={i}>
                                      <Td>{deduction.name}</Td>
                                      <Td isNumeric>{deduction.value}</Td>
                                    </Tr>
                                  )
                                )}
                              </Tbody>
                            </Table>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Stack>
                  </Collapse>
                </Td>
              </Tr>
            </>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}
