import React, { useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  Flex,
  Badge,
  HStack,
  Button,
  useColorModeValue,
  useToast,
  Tooltip,
  Spinner,
  Divider,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { TossieReceipt } from "../api/client";
import { openTossie } from "../api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  tossieTypeMap,
  defaultTossie,
  getRarityLabel,
  getTossieInfo,
  TossieTypeDefinition,
} from "../types/tossies";

interface TossieRowProps {
  type: string;
  definition: TossieTypeDefinition;
  count?: number;
  isCollected: boolean;
  isLoading?: boolean;
  onClick?: () => void;
}

// Define animation keyframes for rare tossies
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
  50% { box-shadow: 0 0 20px rgba(66, 153, 225, 0.8); }
  100% { box-shadow: 0 0 5px rgba(66, 153, 225, 0.5); }
`;

const TossieRow: React.FC<TossieRowProps> = ({
  type,
  definition,
  count = 0,
  isCollected,
  isLoading,
  onClick,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const hoverBgColor = useColorModeValue("gray.50", "gray.700");
  const rarityInfo = getRarityLabel(definition.rarity);

  // Animation for rare tossies
  const getAnimation = () => {
    if (!isCollected) return {};

    // More rare tossies get animations
    if (definition.rarity <= 2) {
      return {
        animation: `${glowAnimation} 2s infinite`,
        transform: "translateZ(0)", // Force GPU acceleration
      };
    }

    return {};
  };

  return (
    <Flex
      p={3}
      borderRadius="md"
      borderWidth="1px"
      borderColor={isCollected ? "gray.200" : "gray.100"}
      bg={bgColor}
      _hover={
        (onClick && !isLoading) || isCollected
          ? { bg: hoverBgColor, cursor: onClick ? "pointer" : "default" }
          : {}
      }
      opacity={isCollected ? 1 : 0.6}
      mb={2}
      onClick={isLoading || !onClick ? undefined : onClick}
      position="relative"
      transition="all 0.2s"
      {...getAnimation()}
    >
      {/* Icon on the left */}
      <Flex
        align="center"
        justify="center"
        mr={4}
        fontSize="2xl"
        width="50px"
        height="50px"
        bg={isCollected ? "blue.50" : "gray.50"}
        borderRadius="full"
        flexShrink={0}
      >
        {isLoading ? (
          <Spinner size="md" color="blue.500" />
        ) : (
          <Text>{isCollected ? definition.emoji : "🔒"}</Text>
        )}
      </Flex>

      {/* Content in the middle */}
      <Flex direction="column" flex="1">
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold" color={isCollected ? "inherit" : "gray.500"}>
            {definition.title}
          </Text>
          {count > 1 && (
            <Badge colorScheme="blue" borderRadius="full">
              x{count}
            </Badge>
          )}
        </Flex>
        <Text
          fontSize="sm"
          color={isCollected ? "gray.600" : "gray.400"}
          noOfLines={1}
        >
          {definition.description}
        </Text>
      </Flex>

      {/* Badge on the right */}
      <Badge
        colorScheme={isCollected ? rarityInfo.color.split(".")[0] : "gray"}
        alignSelf="center"
        ml={3}
        fontSize="xs"
      >
        {rarityInfo.label}
      </Badge>
    </Flex>
  );
};

interface TossieBasketProps {
  tossieReceipts: TossieReceipt[];
  refreshTossies: () => void;
}

interface GroupedTossie extends TossieReceipt {
  count: number;
}

export const TossieBasket: React.FC<TossieBasketProps> = ({
  tossieReceipts,
  refreshTossies,
}) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [openingTossie, setOpeningTossie] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: openTossie,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tossieReceipts"] });
      refreshTossies();

      // Get the tossie rarity info for the toast message
      const tossieType = data.tossie_type;
      const tossieInfo = getTossieInfo(tossieType);
      const rarityInfo = getRarityLabel(tossieInfo.rarity);

      toast({
        title: `${tossieInfo.emoji} ${tossieInfo.title}!`,
        description: `You found a ${rarityInfo.label.toLowerCase()} tossie: ${
          tossieInfo.description
        }`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setOpeningTossie(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to open tossie. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setOpeningTossie(null);
    },
  });

  const unopenedTossies = tossieReceipts.filter((tossie) => !tossie.is_opened);
  const openedTossies = tossieReceipts.filter((tossie) => tossie.is_opened);

  // Group opened tossies by type and count them
  const groupedOpenedTossies = openedTossies.reduce((acc, tossie) => {
    const type = tossie.tossie_type || "unknown";
    if (!acc[type]) {
      acc[type] = {
        ...tossie,
        count: 1,
      };
    } else {
      acc[type].count += 1;
    }
    return acc;
  }, {} as Record<string, GroupedTossie>);

  const handleOpenTossie = (tossieId: number) => {
    setOpeningTossie(tossieId);
    mutation.mutate(tossieId);
  };

  // Group all tossie types by their functional categories (from the comments in tossies.ts)
  const tossieCategories = {
    "Encouragement & Motivation": [
      "you-got-grit",
      "clean-skate-energy",
      "main-character",
    ],
    "Humor & Whimsy": ["zamboni-zen", "rink-rat", "coach-said-again"],
    "Nostalgia & Personality": [
      "bedazzle-babe",
      "tights-over-boots",
      "first-competition",
    ],
    "Music & Artistic Inspiration": ["program-idea", "drama", "free-leg-flare"],
    "Recognition & Affirmation": [
      "golden-toe-pick",
      "get-back-up",
      "fan-favorite",
    ],
  };

  // Group tossies by category for display
  const tossiesByCategory = Object.entries(tossieCategories).reduce(
    (acc, [category, typeIds]) => {
      acc[category] = typeIds.map((typeId) => ({
        type: typeId,
        definition: tossieTypeMap[typeId],
        isCollected: !!groupedOpenedTossies[typeId],
        count: groupedOpenedTossies[typeId]?.count || 0,
      }));
      return acc;
    },
    {} as Record<
      string,
      Array<{
        type: string;
        definition: TossieTypeDefinition;
        isCollected: boolean;
        count: number;
      }>
    >
  );

  // Category order
  const categoryOrder = [
    "Encouragement & Motivation",
    "Humor & Whimsy",
    "Nostalgia & Personality",
    "Music & Artistic Inspiration",
    "Recognition & Affirmation",
  ];

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {unopenedTossies.length > 0 && (
        <Box>
          <Heading size="md" mb={4}>
            Unopened Tossies ({unopenedTossies.length})
          </Heading>
          <VStack spacing={2} align="stretch">
            {unopenedTossies.map((tossie) => (
              <Flex
                key={tossie.id}
                p={3}
                borderRadius="md"
                borderWidth="1px"
                borderColor="blue.200"
                bg="blue.50"
                _hover={{ bg: "blue.100", cursor: "pointer" }}
                onClick={() => handleOpenTossie(tossie.id)}
                position="relative"
              >
                {/* Icon on the left */}
                <Flex
                  align="center"
                  justify="center"
                  mr={4}
                  fontSize="2xl"
                  width="50px"
                  height="50px"
                  bg="white"
                  borderRadius="full"
                  flexShrink={0}
                >
                  {openingTossie === tossie.id ? (
                    <Spinner size="md" color="blue.500" />
                  ) : (
                    <Text>❓</Text>
                  )}
                </Flex>

                {/* Content in the middle */}
                <Flex direction="column" flex="1" justify="center">
                  <Text fontWeight="bold">
                    {openingTossie === tossie.id
                      ? "Opening..."
                      : "Unopened Tossie"}
                  </Text>
                  <Text fontSize="sm" color="blue.700">
                    Click to discover what's inside!
                  </Text>
                </Flex>
              </Flex>
            ))}
          </VStack>
        </Box>
      )}

      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Tossie Collection</Heading>
          <Text fontSize="sm" color="gray.500">
            Collection: {Object.keys(groupedOpenedTossies).length}/
            {Object.keys(tossieTypeMap).length} (
            {Math.round(
              (Object.keys(groupedOpenedTossies).length /
                Object.keys(tossieTypeMap).length) *
                100
            )}
            %)
          </Text>
        </HStack>

        <VStack spacing={4} align="stretch">
          {categoryOrder.map((category) => {
            const tossies = tossiesByCategory[category] || [];

            return (
              <Box key={category}>
                <Heading size="sm" mb={2} color="gray.600">
                  {category}
                </Heading>
                <VStack spacing={2} align="stretch">
                  {tossies.map(({ type, definition, isCollected, count }) => (
                    <TossieRow
                      key={type}
                      type={type}
                      definition={definition}
                      count={count}
                      isCollected={isCollected}
                    />
                  ))}
                </VStack>
                <Divider mt={3} mb={1} />
              </Box>
            );
          })}
        </VStack>
      </Box>
    </VStack>
  );
};
