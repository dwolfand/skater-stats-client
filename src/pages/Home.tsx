import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  Text,
  Link,
  Grid,
  GridItem,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";
import {
  searchEvents,
  getDefaultEvents,
  SearchResult,
  DefaultEvents,
  CompetitionSummary,
} from "../api/client";

type EventFilter = "all" | "upcoming" | "recent";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchType, setSearchType] = useState<
    "all" | "competition" | "skater"
  >("all");
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");

  // Add debouncing effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ["search", debouncedQuery, searchType],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      return searchEvents(
        debouncedQuery,
        searchType === "all" ? undefined : searchType
      );
    },
    enabled: debouncedQuery.length > 2,
  });

  const { data: defaultEvents } = useQuery({
    queryKey: ["defaultEvents"],
    queryFn: getDefaultEvents,
  });

  // Function to render a single competition card
  const CompetitionCard = ({
    competition,
  }: {
    competition: CompetitionSummary;
  }) => (
    <GridItem>
      <Link
        as={RouterLink}
        to={`/competition/${competition.year}/${competition.ijsId}`}
        _hover={{ textDecoration: "none" }}
      >
        <Box p={4} borderWidth={1} borderRadius="lg" _hover={{ bg: "gray.50" }}>
          <Heading size="sm" mb={2}>
            {competition.name}
          </Heading>
          <Text color="gray.600" fontSize="sm">
            {new Date(competition.startDate).toLocaleDateString()} -{" "}
            {new Date(competition.endDate).toLocaleDateString()}
            {competition.timezone && ` (${competition.timezone})`}
          </Text>
          <Text color="gray.600" fontSize="sm">
            {competition.venue}, {competition.city}, {competition.state}
          </Text>
          <Badge
            mt={2}
            colorScheme={competition.type === "upcoming" ? "blue" : "green"}
          >
            {competition.type}
          </Badge>
        </Box>
      </Link>
    </GridItem>
  );

  // Function to render a search result
  const SearchResultCard = ({ result }: { result: SearchResult }) => (
    <Link
      as={RouterLink}
      to={
        result.type === "competition"
          ? `/competition/${result.year}/${result.ijsId}`
          : `/skater/${encodeURIComponent(result.name)}`
      }
      _hover={{ textDecoration: "none" }}
    >
      <Box p={4} borderWidth={1} borderRadius="lg" _hover={{ bg: "gray.50" }}>
        <Flex justify="space-between" align="center">
          <Box>
            <Heading size="sm">{result.name}</Heading>
            {result.type === "competition" ? (
              <>
                <Text color="gray.600" fontSize="sm">
                  {new Date(result.startDate!).toLocaleDateString()} -{" "}
                  {new Date(result.endDate!).toLocaleDateString()}
                </Text>
                <Text color="gray.600" fontSize="sm">
                  {result.venue}, {result.city}, {result.state}
                </Text>
              </>
            ) : (
              <>
                {result.competition && (
                  <Text color="gray.600" fontSize="sm">
                    {result.competition}
                  </Text>
                )}
                {result.date && (
                  <Text color="gray.500" fontSize="sm">
                    {new Date(result.date).toLocaleDateString()}
                  </Text>
                )}
              </>
            )}
          </Box>
          <Badge colorScheme={result.type === "competition" ? "blue" : "green"}>
            {result.type}
          </Badge>
        </Flex>
      </Box>
    </Link>
  );

  // Filter competitions based on selected tab
  const filteredCompetitions = defaultEvents
    ? [
        ...(eventFilter === "all" || eventFilter === "upcoming"
          ? defaultEvents.upcoming
          : []),
        ...(eventFilter === "all" || eventFilter === "recent"
          ? defaultEvents.recent
          : []),
      ]
    : [];

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Search Section */}
        <Box>
          <Heading mb={6}>Figure Skating Stats</Heading>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <Search2Icon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search for competitions or skaters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Flex mt={2} gap={2}>
            <Badge
              cursor="pointer"
              colorScheme={searchType === "all" ? "blue" : "gray"}
              onClick={() => setSearchType("all")}
            >
              All
            </Badge>
            <Badge
              cursor="pointer"
              colorScheme={searchType === "competition" ? "blue" : "gray"}
              onClick={() => setSearchType("competition")}
            >
              Competitions
            </Badge>
            <Badge
              cursor="pointer"
              colorScheme={searchType === "skater" ? "blue" : "gray"}
              onClick={() => setSearchType("skater")}
            >
              Skaters
            </Badge>
          </Flex>
        </Box>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <Box>
            <Heading size="md" mb={4}>
              Search Results
            </Heading>
            <VStack align="stretch" spacing={4}>
              {isSearching ? (
                <Text>Searching...</Text>
              ) : !searchResults || searchResults.length === 0 ? (
                <Text>No results found</Text>
              ) : (
                searchResults.map((result, index) => (
                  <SearchResultCard key={index} result={result} />
                ))
              )}
            </VStack>
          </Box>
        )}

        {/* Competitions Section */}
        {!searchQuery && defaultEvents && (
          <Box>
            <Tabs
              onChange={(index) =>
                setEventFilter(
                  ["all", "upcoming", "recent"][index] as EventFilter
                )
              }
            >
              <TabList>
                <Tab>All Competitions</Tab>
                <Tab>Upcoming</Tab>
                <Tab>Recent</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    {filteredCompetitions.map((competition, index) => (
                      <CompetitionCard key={index} competition={competition} />
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    {defaultEvents.upcoming.map((competition, index) => (
                      <CompetitionCard key={index} competition={competition} />
                    ))}
                  </Grid>
                </TabPanel>

                <TabPanel>
                  <Grid
                    templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                    gap={4}
                  >
                    {defaultEvents.recent.map((competition, index) => (
                      <CompetitionCard key={index} competition={competition} />
                    ))}
                  </Grid>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        )}

        {/* Link to All Competitions */}
        <Box textAlign="center" py={4}>
          <Link as={RouterLink} to="/competitions" color="blue.500">
            View All Competitions
          </Link>
        </Box>
      </VStack>
    </Container>
  );
}
