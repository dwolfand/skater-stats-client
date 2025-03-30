import React, { useState, useMemo } from "react";
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
  Image,
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
  TOSSIE_CATEGORIES,
  getCategoryInfo,
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
        width="60px"
        height="60px"
        bg={isCollected ? "blue.50" : "gray.50"}
        borderRadius="md"
        flexShrink={0}
        overflow="hidden"
      >
        {isLoading ? (
          <Spinner size="md" color="blue.500" />
        ) : isCollected ? (
          <Image
            src={`/images/tossie-types/${type}.png`}
            alt={definition.title}
            boxSize="50px"
            objectFit="contain"
          />
        ) : (
          <Box
            position="relative"
            width="50px"
            height="50px"
            filter="blur(5px)"
            opacity={0.5}
          >
            <Image
              src={`/images/tossie-types/${type}.png`}
              alt="Locked"
              boxSize="50px"
              objectFit="contain"
            />
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex={2}
              fontSize="xl"
              color="gray.800"
            >
              <Text>🔒</Text>
            </Box>
          </Box>
        )}
      </Flex>

      {/* Content in the middle */}
      <Flex direction="column" flex="1">
        <Flex justify="space-between" align="center" width="100%">
          <Box position="relative" width="100%">
            <Text
              fontWeight="bold"
              color={isCollected ? "inherit" : "gray.500"}
              filter={isCollected ? "none" : "blur(3px)"}
            >
              {definition.title}
            </Text>

            {!isCollected && (
              <Text
                position="absolute"
                top="0"
                left="0"
                fontWeight="medium"
                color="gray.500"
              >
                Uncollected Tossie
              </Text>
            )}
          </Box>

          {count > 1 && (
            <Badge colorScheme="blue" borderRadius="full" ml={2} flexShrink={0}>
              x{count}
            </Badge>
          )}
        </Flex>

        <Box position="relative">
          <Text
            fontSize="sm"
            color={isCollected ? "gray.600" : "gray.400"}
            noOfLines={1}
            filter={isCollected ? "none" : "blur(3px)"}
          >
            {definition.description}
          </Text>

          {!isCollected && (
            <Text
              position="absolute"
              top="0"
              left="0"
              fontSize="sm"
              color="gray.500"
            >
              Unlock to reveal details
            </Text>
          )}
        </Box>
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

  // Get all tossie types for random selection
  const allTossieTypes = Object.keys(tossieTypeMap);

  // Function to get a random tossie type
  const getRandomTossieType = () => {
    const randomIndex = Math.floor(Math.random() * allTossieTypes.length);
    return allTossieTypes[randomIndex];
  };

  // Assign a random tossie type to each unopened tossie
  const unopenedTossieTypes = useMemo(() => {
    return tossieReceipts
      .filter((tossie) => !tossie.is_opened)
      .reduce((acc, tossie) => {
        acc[tossie.id] = getRandomTossieType();
        return acc;
      }, {} as Record<number, string>);
  }, [tossieReceipts, allTossieTypes]);

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
        title: (
          <Flex align="center">
            <Image
              src={`/images/tossie-types/${tossieType}.png`}
              alt={tossieInfo.title}
              boxSize="32px"
              objectFit="contain"
              mr={2}
            />
            <Text>{tossieInfo.title}!</Text>
          </Flex>
        ),
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

  // Group tossies by their categories from tossies.ts
  const tossiesByCategory = Object.values(TOSSIE_CATEGORIES).reduce(
    (acc, category) => {
      // Find all tossies belonging to this category
      const tossiesInCategory = Object.entries(tossieTypeMap)
        .filter(([_, definition]) => definition.category === category)
        .map(([typeId, definition]) => ({
          type: typeId,
          definition,
          isCollected: !!groupedOpenedTossies[typeId],
          count: groupedOpenedTossies[typeId]?.count || 0,
        }));

      if (tossiesInCategory.length > 0) {
        acc[category] = tossiesInCategory;
      }

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

  // Get category info for display
  const categoryInfo = getCategoryInfo();

  // Category order based on the new structure
  const categoryOrder = Object.values(TOSSIE_CATEGORIES);

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
                  width="60px"
                  height="60px"
                  bg="white"
                  borderRadius="md"
                  flexShrink={0}
                  overflow="hidden"
                >
                  {openingTossie === tossie.id ? (
                    <Spinner size="md" color="blue.500" />
                  ) : (
                    <Box position="relative" width="50px" height="50px">
                      <Image
                        src={`/images/tossie-types/${
                          unopenedTossieTypes[tossie.id]
                        }.png`}
                        alt="Mystery Tossie"
                        boxSize="50px"
                        objectFit="contain"
                        filter="blur(3px)"
                        opacity={0.7}
                        fallback={<Text>❓</Text>}
                      />
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        fontSize="md"
                        color="blue.600"
                        bg="white"
                        borderRadius="full"
                        width="22px"
                        height="22px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text>?</Text>
                      </Box>
                    </Box>
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
            const info = categoryInfo[category];

            return (
              <Box key={category}>
                <HStack mb={2}>
                  <Text fontSize="xl">{info.emoji}</Text>
                  <Heading size="sm" color="gray.600">
                    {category}
                  </Heading>
                </HStack>
                <Text fontSize="sm" color="gray.500" mb={3}>
                  {info.description}
                </Text>
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
