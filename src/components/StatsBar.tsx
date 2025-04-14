import {
  Box,
  Card,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import dayjs from "../utils/date";
import HoverTooltip from "./shared/HoverTooltip";
import { SkaterHistoryEntry } from "../types/skater";

interface StatsBarProps {
  filteredHistory: SkaterHistoryEntry[];
  fullHistory: SkaterHistoryEntry[];
  totalCompetitions: number;
  totalEvents: number;
  personalBest: {
    eventType: string;
    score: number | null;
    event: string | null;
    date: string | null;
    isAllSixEvents?: boolean;
  };
  topScoringElement: {
    elementName: string;
    executedElement?: string;
    score: number;
    competitionName: string;
    date: string;
  } | null;
  highestMeanGOEElement: {
    elementName: string;
    executedElement?: string;
    meanGOE: number;
    competitionName: string;
    date: string;
  } | null;
  filteredTopScoringElement: {
    elementName: string;
    executedElement?: string;
    score: number;
    competitionName: string;
    date: string;
  } | null;
  filteredHighestMeanGOEElement: {
    elementName: string;
    executedElement?: string;
    meanGOE: number;
    competitionName: string;
    date: string;
  } | null;
  getEffectiveScore: (result: SkaterHistoryEntry) => number;
  truncateElementName: (name: string, maxLength?: number) => string;
  themeColors: {
    color?: string;
    fontFamily?: string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
}

export default function StatsBar({
  filteredHistory,
  fullHistory,
  totalCompetitions,
  totalEvents,
  personalBest,
  topScoringElement,
  highestMeanGOEElement,
  filteredTopScoringElement,
  filteredHighestMeanGOEElement,
  getEffectiveScore,
  truncateElementName,
  themeColors,
}: StatsBarProps) {
  return (
    <Card
      p={6}
      mb={6}
      bg="white"
      fontFamily={themeColors.fontFamily}
      borderWidth="0"
    >
      {/* Mobile layout - two rows */}
      <Box display={{ base: "block", md: "none" }}>
        <VStack spacing={6} align="stretch">
          {/* First row - original stats */}
          <StatGroup>
            <Stat>
              <StatLabel>
                Competitions
                {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
              </StatLabel>
              <StatNumber>
                {new Set(filteredHistory.map((h) => h.competition)).size}
              </StatNumber>
              {filteredHistory.length !== fullHistory.length && (
                <Text fontSize="sm" color="gray.600">
                  of {totalCompetitions} total
                </Text>
              )}
            </Stat>
            <Stat>
              <StatLabel>
                Events
                {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
              </StatLabel>
              <StatNumber>{filteredHistory.length}</StatNumber>
              {filteredHistory.length !== fullHistory.length && (
                <Text fontSize="sm" color="gray.600">
                  of {totalEvents} total
                </Text>
              )}
            </Stat>
            <Stat>
              <StatLabel>
                Personal Best
                {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
              </StatLabel>
              <StatNumber>
                {(() => {
                  // Check if all filtered events are 6.0 events
                  const isFilteredAllSixEvents =
                    filteredHistory.length > 0 &&
                    filteredHistory.every((h) => h.isSixEvent);

                  const scores = filteredHistory
                    .map(getEffectiveScore)
                    .filter(
                      (score) => score != null && !isNaN(score) && score > 0
                    );

                  const filteredBest =
                    scores.length > 0
                      ? isFilteredAllSixEvents
                        ? Math.min(...scores)
                        : Math.max(...scores)
                      : 0;

                  return filteredBest > 0 ? filteredBest.toFixed(2) : "N/A";
                })()}
              </StatNumber>
              {filteredHistory.length !== fullHistory.length &&
                personalBest.score && (
                  <Text fontSize="sm" color="gray.600">
                    Overall: {Number(personalBest.score).toFixed(2)}
                  </Text>
                )}
              {(() => {
                const isFilteredAllSixEvents =
                  filteredHistory.length > 0 &&
                  filteredHistory.every((h) => h.isSixEvent);

                const scores = filteredHistory
                  .map(getEffectiveScore)
                  .filter(
                    (score) => score != null && !isNaN(score) && score > 0
                  );

                const bestScore =
                  scores.length > 0
                    ? isFilteredAllSixEvents
                      ? Math.min(...scores)
                      : Math.max(...scores)
                    : null;

                const bestResult = filteredHistory.find(
                  (h) => getEffectiveScore(h) === bestScore
                );
                if (bestResult) {
                  return (
                    <Text fontSize="sm" color="gray.600">
                      {bestResult.eventType} (
                      {dayjs(bestResult.date).format("MMM D, YYYY")})
                    </Text>
                  );
                }
                return null;
              })()}
            </Stat>
          </StatGroup>

          {/* Second row - new element stats */}
          {(filteredTopScoringElement || filteredHighestMeanGOEElement) && (
            <StatGroup>
              {filteredTopScoringElement && (
                <Stat>
                  <StatLabel>
                    Top Element
                    {filteredHistory.length !== fullHistory.length &&
                      ` (Filtered)`}
                  </StatLabel>
                  <StatNumber>
                    {filteredTopScoringElement.executedElement ? (
                      <HoverTooltip
                        text={
                          <Box p={2}>
                            <Text fontSize="sm">
                              {filteredTopScoringElement.executedElement}
                            </Text>
                          </Box>
                        }
                      >
                        {truncateElementName(
                          filteredTopScoringElement.elementName
                        )}
                      </HoverTooltip>
                    ) : (
                      truncateElementName(filteredTopScoringElement.elementName)
                    )}
                  </StatNumber>
                  <Text fontSize="sm" color="gray.600">
                    Score: {filteredTopScoringElement.score.toFixed(2)}
                  </Text>
                  {filteredHistory.length !== fullHistory.length &&
                    topScoringElement && (
                      <Text fontSize="sm" color="gray.600">
                        Overall:{" "}
                        {truncateElementName(topScoringElement.elementName)} (
                        {topScoringElement.score.toFixed(2)})
                      </Text>
                    )}
                  <Text fontSize="sm" color="gray.600">
                    {dayjs(filteredTopScoringElement.date).format(
                      "MMM D, YYYY"
                    )}
                  </Text>
                </Stat>
              )}
              {filteredHighestMeanGOEElement && (
                <Stat>
                  <StatLabel>
                    Highest GOE
                    {filteredHistory.length !== fullHistory.length &&
                      ` (Filtered)`}
                  </StatLabel>
                  <StatNumber>
                    {filteredHighestMeanGOEElement.executedElement ? (
                      <HoverTooltip
                        text={
                          <Box p={2}>
                            <Text fontSize="sm">
                              {filteredHighestMeanGOEElement.executedElement}
                            </Text>
                          </Box>
                        }
                      >
                        {truncateElementName(
                          filteredHighestMeanGOEElement.elementName
                        )}
                      </HoverTooltip>
                    ) : (
                      truncateElementName(
                        filteredHighestMeanGOEElement.elementName
                      )
                    )}
                  </StatNumber>
                  <Text fontSize="sm" color="gray.600">
                    GOE: {filteredHighestMeanGOEElement.meanGOE.toFixed(2)}
                  </Text>
                  {filteredHistory.length !== fullHistory.length &&
                    highestMeanGOEElement && (
                      <Text fontSize="sm" color="gray.600">
                        Overall:{" "}
                        {truncateElementName(highestMeanGOEElement.elementName)}{" "}
                        ({highestMeanGOEElement.meanGOE.toFixed(2)})
                      </Text>
                    )}
                  <Text fontSize="sm" color="gray.600">
                    {dayjs(filteredHighestMeanGOEElement.date).format(
                      "MMM D, YYYY"
                    )}
                  </Text>
                </Stat>
              )}
            </StatGroup>
          )}
        </VStack>
      </Box>

      {/* Desktop layout - single row */}
      <Box display={{ base: "none", md: "block" }}>
        <StatGroup>
          <Stat>
            <StatLabel>
              Competitions
              {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
            </StatLabel>
            <StatNumber>
              {new Set(filteredHistory.map((h) => h.competition)).size}
            </StatNumber>
            {filteredHistory.length !== fullHistory.length && (
              <Text fontSize="sm" color="gray.600">
                of {totalCompetitions} total
              </Text>
            )}
          </Stat>
          <Stat>
            <StatLabel>
              Events
              {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
            </StatLabel>
            <StatNumber>{filteredHistory.length}</StatNumber>
            {filteredHistory.length !== fullHistory.length && (
              <Text fontSize="sm" color="gray.600">
                of {totalEvents} total
              </Text>
            )}
          </Stat>
          <Stat>
            <StatLabel>
              Personal Best
              {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
            </StatLabel>
            <StatNumber>
              {(() => {
                // Check if all filtered events are 6.0 events
                const isFilteredAllSixEvents =
                  filteredHistory.length > 0 &&
                  filteredHistory.every((h) => h.isSixEvent);

                const scores = filteredHistory
                  .map(getEffectiveScore)
                  .filter(
                    (score) => score != null && !isNaN(score) && score > 0
                  );

                const filteredBest =
                  scores.length > 0
                    ? isFilteredAllSixEvents
                      ? Math.min(...scores)
                      : Math.max(...scores)
                    : 0;

                return filteredBest > 0 ? filteredBest.toFixed(2) : "N/A";
              })()}
            </StatNumber>
            {filteredHistory.length !== fullHistory.length &&
              personalBest.score && (
                <Text fontSize="sm" color="gray.600">
                  Overall: {Number(personalBest.score).toFixed(2)}
                </Text>
              )}
            {(() => {
              const isFilteredAllSixEvents =
                filteredHistory.length > 0 &&
                filteredHistory.every((h) => h.isSixEvent);

              const scores = filteredHistory
                .map(getEffectiveScore)
                .filter((score) => score != null && !isNaN(score) && score > 0);

              const bestScore =
                scores.length > 0
                  ? isFilteredAllSixEvents
                    ? Math.min(...scores)
                    : Math.max(...scores)
                  : null;

              const bestResult = filteredHistory.find(
                (h) => getEffectiveScore(h) === bestScore
              );
              if (bestResult) {
                return (
                  <Text fontSize="sm" color="gray.600">
                    {bestResult.eventType} (
                    {dayjs(bestResult.date).format("MMM D, YYYY")})
                  </Text>
                );
              }
              return null;
            })()}
          </Stat>
          {filteredTopScoringElement && (
            <Stat>
              <StatLabel>
                Top Element
                {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
              </StatLabel>
              <StatNumber>
                {filteredTopScoringElement.executedElement ? (
                  <HoverTooltip
                    text={
                      <Box p={2}>
                        <Text fontSize="sm">
                          {filteredTopScoringElement.executedElement}
                        </Text>
                      </Box>
                    }
                  >
                    {truncateElementName(filteredTopScoringElement.elementName)}
                  </HoverTooltip>
                ) : (
                  truncateElementName(filteredTopScoringElement.elementName)
                )}
              </StatNumber>
              <Text fontSize="sm" color="gray.600">
                Score: {filteredTopScoringElement.score.toFixed(2)}
              </Text>
              {filteredHistory.length !== fullHistory.length &&
                topScoringElement && (
                  <Text fontSize="sm" color="gray.600">
                    Overall:{" "}
                    {truncateElementName(topScoringElement.elementName)} (
                    {topScoringElement.score.toFixed(2)})
                  </Text>
                )}
              <Text fontSize="sm" color="gray.600">
                {dayjs(filteredTopScoringElement.date).format("MMM D, YYYY")}
              </Text>
            </Stat>
          )}
          {filteredHighestMeanGOEElement && (
            <Stat>
              <StatLabel>
                Highest GOE
                {filteredHistory.length !== fullHistory.length && ` (Filtered)`}
              </StatLabel>
              <StatNumber>
                {filteredHighestMeanGOEElement.executedElement ? (
                  <HoverTooltip
                    text={
                      <Box p={2}>
                        <Text fontSize="sm">
                          {filteredHighestMeanGOEElement.executedElement}
                        </Text>
                      </Box>
                    }
                  >
                    {truncateElementName(
                      filteredHighestMeanGOEElement.elementName
                    )}
                  </HoverTooltip>
                ) : (
                  truncateElementName(filteredHighestMeanGOEElement.elementName)
                )}
              </StatNumber>
              <Text fontSize="sm" color="gray.600">
                GOE: {filteredHighestMeanGOEElement.meanGOE.toFixed(2)}
              </Text>
              {filteredHistory.length !== fullHistory.length &&
                highestMeanGOEElement && (
                  <Text fontSize="sm" color="gray.600">
                    Overall:{" "}
                    {truncateElementName(highestMeanGOEElement.elementName)} (
                    {highestMeanGOEElement.meanGOE.toFixed(2)})
                  </Text>
                )}
              <Text fontSize="sm" color="gray.600">
                {dayjs(filteredHighestMeanGOEElement.date).format(
                  "MMM D, YYYY"
                )}
              </Text>
            </Stat>
          )}
        </StatGroup>
      </Box>
    </Card>
  );
}
