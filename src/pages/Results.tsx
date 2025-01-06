import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  Box,
  Heading,
  Spinner,
  VStack,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Grid,
  GridItem,
  Divider,
  List,
  ListItem,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { getEventResults } from "../api/client";
import { EventResults, Element, Component, Deduction } from "../types";

export default function Results() {
  const { id, resultsUrl } = useParams();

  const { data, isLoading } = useQuery<EventResults>({
    queryKey: ["results", id, resultsUrl],
    queryFn: () => getEventResults(id!, resultsUrl!),
    enabled: !!(id && resultsUrl),
  });

  if (isLoading) return <Spinner />;
  if (!data) return null;

  return (
    <Box p={4}>
      <Heading size={{ base: "md", md: "lg" }} mb={6}>
        {data.eventName}
      </Heading>
      <VStack spacing={4} align="stretch">
        {data.results.map((result, index: number) => (
          <Card key={index}>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {/* Summary Section */}
                <Grid templateColumns="repeat(12, 1fr)" gap={4}>
                  <GridItem colSpan={{ base: 12, md: 3 }}>
                    <Stat>
                      <StatLabel>Place</StatLabel>
                      <StatNumber fontSize="3xl">{result.place}</StatNumber>
                      <StatHelpText>Start: {result.start}</StatHelpText>
                    </Stat>
                  </GridItem>
                  <GridItem colSpan={{ base: 12, md: 6 }}>
                    <VStack align="start" spacing={1}>
                      <Text fontSize="xl" fontWeight="bold">
                        {result.name}
                      </Text>
                      <Text color="gray.600">{result.club}</Text>
                    </VStack>
                  </GridItem>
                  <GridItem colSpan={{ base: 12, md: 3 }}>
                    <Stat>
                      <StatLabel>Total Score</StatLabel>
                      <StatNumber color="blue.500">{result.score}</StatNumber>
                    </Stat>
                  </GridItem>
                </Grid>

                <Divider />

                {/* Details Accordion */}
                <Accordion allowMultiple>
                  {/* Elements Section */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">Elements</Text>
                        <Text fontSize="sm" color="gray.600">
                          Total: {result.details.executedElements}
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      <List spacing={2}>
                        {result.details.elements
                          .slice(0, -1)
                          .map((element: Element, i: number) => (
                            <ListItem key={i}>
                              <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                                <GridItem colSpan={{ base: 8, md: 6 }}>
                                  <Text fontWeight="medium">
                                    {element.executed || element.planned}
                                  </Text>
                                  {element.executed !== element.planned && (
                                    <Text fontSize="sm" color="gray.500">
                                      Planned: {element.planned}
                                    </Text>
                                  )}
                                </GridItem>
                                <GridItem colSpan={{ base: 4, md: 6 }}>
                                  <HStack justify="flex-end" spacing={4}>
                                    <Text fontSize="sm" color="gray.600">
                                      Base: {element.baseValue}
                                    </Text>
                                    {element.goe && (
                                      <Badge
                                        colorScheme={
                                          Number(element.goe) >= 0
                                            ? "green"
                                            : "red"
                                        }
                                      >
                                        {Number(element.goe) >= 0 ? "+" : ""}
                                        {element.goe}
                                      </Badge>
                                    )}
                                    <Text fontWeight="bold">
                                      {element.score}
                                    </Text>
                                  </HStack>
                                </GridItem>
                              </Grid>
                            </ListItem>
                          ))}
                      </List>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Components Section */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">Components</Text>
                        <Text fontSize="sm" color="gray.600">
                          Total: {result.details.programComponents}
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      <List spacing={2}>
                        {result.details.components
                          .slice(0, -1)
                          .map((component: Component, i: number) => (
                            <ListItem key={i}>
                              <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                                <GridItem colSpan={6}>
                                  <Text>{component.name}</Text>
                                </GridItem>
                                <GridItem colSpan={6}>
                                  <HStack justify="flex-end" spacing={4}>
                                    {component.factor && (
                                      <Text fontSize="sm" color="gray.600">
                                        Factor: {component.factor}
                                      </Text>
                                    )}
                                    <Text fontWeight="bold">
                                      {component.score}
                                    </Text>
                                  </HStack>
                                </GridItem>
                              </Grid>
                            </ListItem>
                          ))}
                      </List>
                    </AccordionPanel>
                  </AccordionItem>

                  {/* Deductions Section */}
                  <AccordionItem>
                    <AccordionButton>
                      <Box flex="1" textAlign="left">
                        <Text fontWeight="bold">Deductions</Text>
                        <Text fontSize="sm" color="gray.600">
                          Total: -{result.details.deductions}
                        </Text>
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel>
                      <List spacing={2}>
                        {result.details.deductionDetails
                          .slice(0, -1)
                          .map((deduction: Deduction, i: number) => (
                            <ListItem key={i}>
                              <Grid templateColumns="repeat(12, 1fr)" gap={2}>
                                <GridItem colSpan={8}>
                                  <Text>{deduction.name}</Text>
                                </GridItem>
                                <GridItem colSpan={4}>
                                  {Number(deduction.value) > 0 && (
                                    <Text
                                      fontWeight="bold"
                                      textAlign="right"
                                      color="red.500"
                                    >
                                      -{deduction.value}
                                    </Text>
                                  )}
                                </GridItem>
                              </Grid>
                            </ListItem>
                          ))}
                      </List>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </VStack>
    </Box>
  );
}
