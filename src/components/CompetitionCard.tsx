import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Link,
  Card,
  Badge,
  HStack,
  GridItem,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { DATE_FORMATS } from "../utils/date";
import FavoriteButton from "./FavoriteButton";

interface CompetitionSummary {
  ijsId: string;
  year: string;
  name: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue: string;
  city: string;
  state: string;
  logoRef: string | null;
  type?: "in progress" | "upcoming" | "recent";
}

export function CompetitionCard({
  competition,
  showType = false,
}: {
  competition: CompetitionSummary;
  showType?: boolean;
}) {
  return (
    <GridItem>
      <Link
        as={RouterLink}
        to={`/competition/${competition.year}/${competition.ijsId}`}
        _hover={{ textDecoration: "none" }}
        display="block"
      >
        <Card border="none">
          <Box p={{ base: 2, md: 6 }}>
            <HStack
              justify="space-between"
              align="start"
              spacing={{ base: 2, md: 6 }}
            >
              {competition.logoRef && (
                <Box
                  flexShrink={0}
                  width={{ base: "60px", md: "80px" }}
                  height={{ base: "60px", md: "80px" }}
                >
                  <img
                    src={competition.logoRef}
                    alt={`${competition.name} logo`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              )}
              <Box flex="1" mr={{ base: 0, md: 2 }}>
                <Heading
                  size={{ base: "xs", md: "sm" }}
                  mb={{ base: 1, md: 2 }}
                >
                  {competition.name}
                </Heading>
                <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
                  {dayjs
                    .utc(competition.startDate)
                    .format(DATE_FORMATS.DISPLAY)}{" "}
                  -{" "}
                  {dayjs.utc(competition.endDate).format(DATE_FORMATS.DISPLAY)}
                  {competition.timezone && ` (${competition.timezone})`}
                </Text>
                <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
                  {[competition.venue, competition.city, competition.state]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
                {showType && competition.type && (
                  <Badge
                    mt={{ base: 1, md: 2 }}
                    colorScheme={
                      competition.type === "in progress"
                        ? "green"
                        : competition.type === "upcoming"
                        ? "brand"
                        : "accent"
                    }
                    fontSize={{ base: "2xs", md: "xs" }}
                  >
                    {competition.type}
                  </Badge>
                )}
              </Box>
              <Box
                onClick={(e) => e.preventDefault()}
                flexShrink={0}
                ml={{ base: -1, md: 0 }}
              >
                <FavoriteButton
                  type="competition"
                  name={competition.name}
                  params={{ year: competition.year, ijsId: competition.ijsId }}
                />
              </Box>
            </HStack>
          </Box>
        </Card>
      </Link>
    </GridItem>
  );
}
