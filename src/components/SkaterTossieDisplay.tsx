import React, { useState, useMemo } from "react";
import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Badge,
  Divider,
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

interface SkaterTossieDisplayProps {
  tossies: TossieReceipt[] | undefined;
  isLoading?: boolean;
  themeColors?: {
    accent?: string;
    font?: string;
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
    definition: TossieTypeDefinition;
    category: string;
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
    const category = tossie.definition.category || "";
    setSelectedTossie({
      type: tossie.type,
      definition: tossie.definition,
      category,
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
      <Card p={6} border="none" bg="white" fontFamily={themeColors.font}>
        <Heading
          size="sm"
          mb={4}
          color={themeColors.accent}
          fontFamily={themeColors.font}
        >
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
        <Modal
          isOpen={!!selectedTossie}
          onClose={() => setSelectedTossie(null)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Flex align="center">
                <Image
                  src={`/images/tossie-types/${selectedTossie.type}.png`}
                  alt={selectedTossie.definition.title}
                  boxSize="50px"
                  objectFit="contain"
                  mr={3}
                />
                <Text>{selectedTossie.definition.title}</Text>
              </Flex>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Box mb={4}>
                <Text color="gray.700">
                  {selectedTossie.definition.description}
                </Text>
                {selectedTossie.count > 1 && (
                  <Text mt={2} fontWeight="bold">
                    Received {selectedTossie.count} times
                  </Text>
                )}
              </Box>

              <Divider my={3} />

              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack>
                    <Text fontSize="md" color="gray.600">
                      Category:
                    </Text>
                    <Text fontWeight="medium">{selectedTossie.category}</Text>
                  </HStack>
                  <Badge
                    colorScheme={
                      getRarityLabel(
                        selectedTossie.definition.rarity
                      ).color.split(".")[0]
                    }
                  >
                    {getRarityLabel(selectedTossie.definition.rarity).label}
                  </Badge>
                </Flex>

                <Text fontSize="sm" color="gray.500">
                  {getCategoryInfo()[selectedTossie.category]?.description ||
                    ""}
                </Text>
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
}
