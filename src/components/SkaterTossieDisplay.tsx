import React, { useState, useMemo } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Flex,
  Badge,
  HStack,
  Tooltip,
  Card,
  Image,
} from "@chakra-ui/react";
import { TossieReceipt } from "../api/client";
import {
  getTossieInfo,
  getRarityLabel,
  TossieTypeDefinition,
  TOSSIE_CATEGORIES,
  getCategoryInfo,
} from "../types/tossies";
import { TossieDetailsModal } from "./TossieDetailsModal";

interface SkaterTossieDisplayProps {
  tossies: TossieReceipt[] | null;
  isLoading: boolean;
  themeColors: {
    color?: string;
    fontFamily?: string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
}

interface GroupedTossie {
  emoji: string;
  title: string;
  count: number;
  type: string;
  definition: TossieTypeDefinition;
}

export default function SkaterTossieDisplay({
  tossies,
  isLoading = false,
  themeColors = {},
}: SkaterTossieDisplayProps) {
  const [selectedTossie, setSelectedTossie] = useState<{
    type: string;
    count: number;
  } | null>(null);

  // Group opened tossies by type and count them
  const groupedTossies = useMemo(() => {
    if (!tossies) return [];

    // Only consider opened tossies
    const openedTossies = tossies.filter((tossie) => tossie.is_opened);

    // Convert the record to an array
    const tossieTypesRecord = openedTossies.reduce((acc, tossie) => {
      const type = tossie.tossie_type || "unknown";
      if (!acc[type]) {
        const definition = getTossieInfo(type);
        acc[type] = {
          count: 1,
          definition,
          emoji: definition.emoji,
          title: definition.title,
          type,
        };
      } else {
        acc[type].count += 1;
      }
      return acc;
    }, {} as Record<string, GroupedTossie>);

    // Convert to array and sort by title
    return Object.values(tossieTypesRecord).sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }, [tossies]);

  // Handle opening the tossie detail modal
  const handleTossieClick = (tossie: GroupedTossie) => {
    setSelectedTossie({
      type: tossie.type,
      count: tossie.count,
    });
  };

  // Count total tossies
  const totalTossies = useMemo(() => {
    return groupedTossies.reduce((sum, tossie) => sum + tossie.count, 0);
  }, [groupedTossies]);

  // Count unique tossie types
  const uniqueTypes = groupedTossies.length;

  return (
    <Box mb={6}>
      <Card
        p={6}
        border="none"
        bg="white"
        fontFamily={themeColors.fontFamily}
        borderWidth="0"
      >
        <Heading size="sm" mb={4} fontFamily={themeColors.fontFamily}>
          Tossie Collection
          <Text
            as="span"
            fontSize="sm"
            color="gray.500"
            fontWeight="normal"
            ml={2}
          >
            {uniqueTypes} unique types ({totalTossies} total)
          </Text>
        </Heading>

        <SimpleGrid columns={{ base: 4, sm: 5, md: 6, lg: 8 }} spacing={4}>
          {groupedTossies.map((tossie) => (
            <Tooltip
              key={tossie.type}
              label={`${tossie.title} ${
                tossie.count > 1 ? `(×${tossie.count})` : ""
              }`}
              hasArrow
            >
              <Flex
                direction="column"
                align="center"
                justify="center"
                bg="gray.50"
                p={3}
                borderRadius="md"
                cursor="pointer"
                onClick={() => handleTossieClick(tossie)}
                _hover={{ bg: "gray.100" }}
                position="relative"
                overflow="hidden"
                h="90px"
                w="90px"
              >
                <Image
                  src={`/images/tossie-types/${tossie.type}.png`}
                  alt={tossie.title}
                  boxSize="70px"
                  objectFit="contain"
                />
                {tossie.count > 1 && (
                  <Badge
                    colorScheme="blue"
                    position="absolute"
                    top={2}
                    right={2}
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {tossie.count}
                  </Badge>
                )}
              </Flex>
            </Tooltip>
          ))}
        </SimpleGrid>
      </Card>

      {selectedTossie && (
        <TossieDetailsModal
          isOpen={!!selectedTossie}
          onClose={() => setSelectedTossie(null)}
          tossieType={selectedTossie.type}
          count={selectedTossie.count}
        />
      )}
    </Box>
  );
}
