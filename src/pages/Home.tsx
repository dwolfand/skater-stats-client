import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import dayjs, { DATE_FORMATS } from "../utils/date";
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  VStack,
  Grid,
  GridItem,
  Link,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  Spinner,
  Center,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useStyleConfig,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { Search2Icon, InfoIcon, CloseIcon } from "@chakra-ui/icons";
import { useQuery } from "@tanstack/react-query";
import { searchEvents, getOverallStats } from "../api/client";
import type {
  SearchResult,
  CompetitionSummary,
  TopScore,
  TopElement,
  TopComponent,
} from "../api/client";
import FavoriteButton from "../components/FavoriteButton";
import { formatNumber } from "../utils/math";
import { CompetitionCard } from "../components/CompetitionCard";

type EventFilter = "all" | "upcoming" | "recent";

function Card({ children }: { children: React.ReactNode }) {
  const styles = useStyleConfig("Box", { variant: "card" });
  return <Box __css={{ ...styles, p: { base: 2, md: 6 } }}>{children}</Box>;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");

  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();

  // Add debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchEvents(debouncedQuery),
    enabled: debouncedQuery.length > 2,
  });

  const { data: overallStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["overallStats"],
    queryFn: getOverallStats,
  });

  // Function to render a search result
  const SearchResultCard = ({ result }: { result: SearchResult }) => (
    <Link
      as={RouterLink}
      to={
        result.type === "competition"
          ? `/competition/${result.year}/${result.ijsId}`
          : result.type === "skater"
          ? result.id
            ? `/skater/id/${result.id}`
            : `/skater/${encodeURIComponent(result.name)}`
          : result.type === "club"
          ? `/club/${result.id}`
          : `/official/${encodeURIComponent(result.name)}`
      }
      _hover={{ textDecoration: "none" }}
      display="block"
    >
      <Card>
        <Box display="flex" justifyContent="space-between" alignItems="start">
          <Box>
            <HStack spacing={2}>
              <Heading size="sm">{result.name}</Heading>
              {result.type === "competition" ? (
                <Box onClick={(e) => e.preventDefault()}>
                  <FavoriteButton
                    type="competition"
                    name={result.name}
                    params={{ year: result.year!, ijsId: result.ijsId! }}
                  />
                </Box>
              ) : result.type === "skater" ? (
                <Box onClick={(e) => e.preventDefault()}>
                  <FavoriteButton
                    type="skater"
                    name={result.name}
                    params={
                      result.id
                        ? { skaterId: result.id }
                        : { name: result.name }
                    }
                  />
                </Box>
              ) : null}
            </HStack>
            {result.type === "competition" ? (
              <>
                <Text color="gray.600" fontSize="sm">
                  {dayjs.utc(result.startDate!).format(DATE_FORMATS.DISPLAY)} -{" "}
                  {dayjs.utc(result.endDate!).format(DATE_FORMATS.DISPLAY)}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  {[result.venue, result.city, result.state]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              </>
            ) : result.type === "skater" ? (
              <>
                {result.competition && (
                  <Text color="gray.600" fontSize="sm">
                    {result.competition}
                  </Text>
                )}
                {result.date && (
                  <Text color="gray.500" fontSize="sm">
                    {dayjs.utc(result.date).format(DATE_FORMATS.DISPLAY)}
                  </Text>
                )}
              </>
            ) : result.type === "club" ? (
              <>
                <Text color="gray.600" fontSize="sm">
                  View club details
                </Text>
              </>
            ) : (
              <>
                {result.function && (
                  <Text color="gray.600" fontSize="sm">
                    {result.function}
                  </Text>
                )}
                {result.competition && (
                  <Text color="gray.600" fontSize="sm">
                    {result.competition}
                  </Text>
                )}
                {result.date && (
                  <Text color="gray.500" fontSize="sm">
                    {dayjs.utc(result.date).format(DATE_FORMATS.DISPLAY)}
                  </Text>
                )}
              </>
            )}
          </Box>
          <Badge
            colorScheme={
              result.type === "competition"
                ? "brand"
                : result.type === "skater"
                ? "accent"
                : result.type === "club"
                ? "green"
                : "purple"
            }
          >
            {result.type}
          </Badge>
        </Box>
      </Card>
    </Link>
  );

  // Filter competitions based on selected tab
  const filteredCompetitions = overallStats
    ? [
        ...(eventFilter === "all" ? overallStats.inProgress || [] : []),
        ...(eventFilter === "all" || eventFilter === "upcoming"
          ? overallStats.upcoming
          : []),
        ...(eventFilter === "all" || eventFilter === "recent"
          ? overallStats.recent
          : []),
      ]
    : [];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Search Section */}
        <Card>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="brand.500" />
            </InputLeftElement>
            <Input
              placeholder="Search for skaters, competitions, clubs, or officials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="filled"
              _focus={{
                bg: "white",
                borderColor: "brand.500",
              }}
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  icon={<CloseIcon />}
                  size="md"
                  variant="ghost"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </Card>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <Box>
            <Heading size="md" mb={4}>
              Search Results
            </Heading>
            <VStack align="stretch" spacing={4}>
              {isSearching ? (
                <Center p={8}>
                  <Spinner color="brand.500" />
                </Center>
              ) : !searchResults || searchResults.length === 0 ? (
                <Card>
                  <Text>No results found</Text>
                </Card>
              ) : (
                searchResults.map((result, index) => (
                  <SearchResultCard key={index} result={result} />
                ))
              )}
            </VStack>
          </Box>
        )}

        {/* Main Content */}
        {!searchQuery && isLoadingStats ? (
          <Center p={8}>
            <Spinner size="xl" color="brand.500" />
          </Center>
        ) : !searchQuery && overallStats ? (
          <>
            {/* Competitions Section */}
            <Box>
              <Card>
                <Tabs
                  onChange={(index) =>
                    setEventFilter(
                      ["all", "upcoming", "recent"][index] as EventFilter
                    )
                  }
                  colorScheme="brand"
                  variant="enclosed"
                >
                  <TabList>
                    <Tab>All Competitions</Tab>
                    <Tab>Upcoming</Tab>
                    <Tab>Recent</Tab>
                  </TabList>

                  <TabPanels>
                    <TabPanel px={{ base: 0, md: 4 }} py={4}>
                      <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                        gap={4}
                      >
                        {filteredCompetitions.map((competition, index) => (
                          <CompetitionCard
                            key={index}
                            competition={competition}
                            showType={true}
                          />
                        ))}
                      </Grid>
                    </TabPanel>

                    <TabPanel px={{ base: 0, md: 4 }} py={4}>
                      <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                        gap={4}
                      >
                        {filteredCompetitions.map((competition, index) => (
                          <CompetitionCard
                            key={index}
                            competition={competition}
                            showType={true}
                          />
                        ))}
                      </Grid>
                    </TabPanel>

                    <TabPanel px={{ base: 0, md: 4 }} py={4}>
                      <Grid
                        templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                        gap={4}
                      >
                        {filteredCompetitions.map((competition, index) => (
                          <CompetitionCard
                            key={index}
                            competition={competition}
                            showType={true}
                          />
                        ))}
                      </Grid>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Card>
            </Box>

            {/* Link to All Competitions */}
            <Box textAlign="center" py={2}>
              <Link as={RouterLink} to="/competitions">
                View All Competitions
              </Link>
            </Box>

            {/* Top Stats Section */}
            <Box mt={4}>
              <HStack spacing={2} mb={4}>
                <Heading size="md">🏆 G.O.A.T. Stats</Heading>
                <Tooltip
                  label="These stats showcase the highest scores, best executed elements, and top program components across all competitions. (G.O.A.T. stands for Greatest Of All Time)"
                  placement="top"
                  hasArrow
                  openDelay={0}
                  closeDelay={500}
                  isOpen={isOpen}
                >
                  <Box
                    as="button"
                    border="1px solid"
                    borderColor="gray.700"
                    borderRadius="full"
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    w="18px"
                    h="18px"
                    onClick={onToggle}
                    onMouseEnter={onOpen}
                    onMouseLeave={onClose}
                    _active={{ bg: "transparent" }}
                  >
                    <Text
                      fontSize="11px"
                      fontWeight="semibold"
                      color="gray.700"
                      pointerEvents="none"
                    >
                      i
                    </Text>
                  </Box>
                </Tooltip>
              </HStack>
              {overallStats.topStats ? (
                <Card>
                  <Accordion allowMultiple defaultIndex={[]}>
                    <AccordionItem border="none">
                      <h2>
                        <AccordionButton
                          _hover={{ bg: "brand.50" }}
                          _expanded={{ bg: "brand.50", color: "brand.600" }}
                          borderRadius="md"
                        >
                          <Box flex="1" textAlign="left">
                            <Heading size="sm">Best Overall Scores</Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        <Box overflowX="auto" maxW="100%">
                          <Table variant="simple" size="sm">
                            <Thead>
                              <Tr>
                                <Th width={{ base: "40%", md: "30%" }}>
                                  Skater
                                </Th>
                                <Th width="80px" isNumeric>
                                  Score
                                </Th>
                                <Th>Competition</Th>
                                <Th width="100px">Date</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {overallStats.topStats.bestScores.map(
                                (score, index) => (
                                  <Tr key={index}>
                                    <Td>
                                      <Link
                                        as={RouterLink}
                                        to={
                                          score.skaterId
                                            ? `/skater/id/${score.skaterId}`
                                            : `/skater/${encodeURIComponent(
                                                score.skaterName
                                              )}`
                                        }
                                      >
                                        {score.skaterName}
                                      </Link>
                                    </Td>
                                    <Td isNumeric whiteSpace="nowrap">
                                      {formatNumber(score.score)}
                                    </Td>
                                    <Td>
                                      <Link
                                        as={RouterLink}
                                        to={`/competition/${score.year}/${
                                          score.ijsId
                                        }/event/${encodeURIComponent(
                                          score.resultsUrl
                                        )}`}
                                      >
                                        {score.competition}
                                      </Link>
                                    </Td>
                                    <Td whiteSpace="nowrap">
                                      {new Date(
                                        score.date
                                      ).toLocaleDateString()}
                                    </Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem border="none" mt={2}>
                      <h2>
                        <AccordionButton
                          _hover={{ bg: "brand.50" }}
                          _expanded={{ bg: "brand.50", color: "brand.600" }}
                          borderRadius="md"
                        >
                          <Box flex="1" textAlign="left">
                            <Heading size="sm">
                              Best Grade of Execution (GOE)
                            </Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {Object.entries(overallStats.topStats.bestGOEs).map(
                          ([elementType, elements]) => (
                            <Box key={elementType} mb={4}>
                              <Heading size="xs" mb={2}>
                                {elementType}
                              </Heading>
                              <Box overflowX="auto" maxW="100%">
                                <Table variant="simple" size="sm">
                                  <Thead>
                                    <Tr>
                                      <Th width={{ base: "35%", md: "25%" }}>
                                        Skater
                                      </Th>
                                      <Th width={{ base: "35%", md: "30%" }}>
                                        Element
                                      </Th>
                                      <Th width="80px" isNumeric>
                                        GOE
                                      </Th>
                                      <Th>Competition</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {elements.map((element, index) => (
                                      <Tr key={index}>
                                        <Td>
                                          <Link
                                            as={RouterLink}
                                            to={
                                              element.skaterId
                                                ? `/skater/id/${element.skaterId}`
                                                : `/skater/${encodeURIComponent(
                                                    element.skaterName
                                                  )}`
                                            }
                                          >
                                            {element.skaterName}
                                          </Link>
                                        </Td>
                                        <Td>{element.elementName}</Td>
                                        <Td isNumeric whiteSpace="nowrap">
                                          {formatNumber(element.goe)}
                                        </Td>
                                        <Td>
                                          <Link
                                            as={RouterLink}
                                            to={`/competition/${element.year}/${
                                              element.ijsId
                                            }/event/${encodeURIComponent(
                                              element.resultsUrl
                                            )}`}
                                          >
                                            {element.competition}
                                          </Link>
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </Box>
                            </Box>
                          )
                        )}
                      </AccordionPanel>
                    </AccordionItem>

                    <AccordionItem border="none" mt={2}>
                      <h2>
                        <AccordionButton
                          _hover={{ bg: "brand.50" }}
                          _expanded={{ bg: "brand.50", color: "brand.600" }}
                          borderRadius="md"
                        >
                          <Box flex="1" textAlign="left">
                            <Heading size="sm">Best Program Components</Heading>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4}>
                        {Object.entries(
                          overallStats.topStats.bestComponents
                        ).map(([componentName, components]) => (
                          <Box key={componentName} mb={4}>
                            <Heading size="xs" mb={2}>
                              {componentName}
                            </Heading>
                            <Box overflowX="auto" maxW="100%">
                              <Table variant="simple" size="sm">
                                <Thead>
                                  <Tr>
                                    <Th width={{ base: "40%", md: "30%" }}>
                                      Skater
                                    </Th>
                                    <Th width="80px" isNumeric>
                                      Score
                                    </Th>
                                    <Th>Competition</Th>
                                    <Th width="100px">Date</Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {components.map((component, index) => (
                                    <Tr key={index}>
                                      <Td>
                                        <Link
                                          as={RouterLink}
                                          to={
                                            component.skaterId
                                              ? `/skater/id/${component.skaterId}`
                                              : `/skater/${encodeURIComponent(
                                                  component.skaterName
                                                )}`
                                          }
                                        >
                                          {component.skaterName}
                                        </Link>
                                      </Td>
                                      <Td isNumeric whiteSpace="nowrap">
                                        {formatNumber(component.score)}
                                      </Td>
                                      <Td>
                                        <Link
                                          as={RouterLink}
                                          to={`/competition/${component.year}/${
                                            component.ijsId
                                          }/event/${encodeURIComponent(
                                            component.resultsUrl
                                          )}`}
                                        >
                                          {component.competition}
                                        </Link>
                                      </Td>
                                      <Td whiteSpace="nowrap">
                                        {new Date(
                                          component.date
                                        ).toLocaleDateString()}
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>
                          </Box>
                        ))}
                      </AccordionPanel>
                    </AccordionItem>
                  </Accordion>
                </Card>
              ) : (
                <Card>
                  <Text>No top stats available</Text>
                </Card>
              )}
            </Box>
          </>
        ) : null}
      </VStack>
    </Container>
  );
}
