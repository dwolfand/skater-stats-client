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
import { TossieOpeningAnimation } from "./TossieOpeningAnimation";
import { TossieDetailsModal } from "./TossieDetailsModal";

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
        isCollected
          ? {
              bg: hoverBgColor,
              cursor: "pointer",
              borderColor: "blue.200",
              transform: "translateY(-2px)",
              boxShadow: "sm",
            }
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
          <Box position="relative" width="50px" height="50px" opacity={0.5}>
            <Image
              src="/images/tossie-types/blank.png"
              alt="Locked"
              boxSize="50px"
              objectFit="contain"
            />
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
              {isCollected ? definition.title : "Lorem ipsum dolor sit"}
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
            {isCollected
              ? definition.description
              : "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
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
  const [showAnimation, setShowAnimation] = useState(false);
  const [currentTossieType, setCurrentTossieType] = useState<string | null>(
    null
  );
  const [currentTossieDescription, setCurrentTossieDescription] = useState<
    string | null
  >(null);
  const [currentTossieSender, setCurrentTossieSender] = useState<string | null>(
    null
  );
  const [currentEventName, setCurrentEventName] = useState<string | null>(null);
  const [currentEventDate, setCurrentEventDate] = useState<string | null>(null);
  const [selectedTossie, setSelectedTossie] = useState<{
    type: string;
    count: number;
  } | null>(null);

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
      // Save the tossie type for animation
      const tossieType = data.tossie_type || "unknown";
      setCurrentTossieType(tossieType);

      // Get the tossie description
      const tossieInfo = getTossieInfo(tossieType);
      setCurrentTossieDescription(tossieInfo.description);

      // Get the sender name
      const sender = data.fromUserName || data.fromSkaterName || "Anonymous";
      setCurrentTossieSender(sender);

      // Save event information
      setCurrentEventName(data.eventName || null);
      setCurrentEventDate(data.created_at || null);

      // Show animation after successful tossie opening
      setShowAnimation(true);

      // After animation completes, these actions will be performed in handleAnimationComplete
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

  // Handle animation completion
  const handleAnimationComplete = () => {
    // Get the tossie info for toast
    if (currentTossieType) {
      const tossieInfo = getTossieInfo(currentTossieType);
      const rarityInfo = getRarityLabel(tossieInfo.rarity);

      // Show toast notification
      toast({
        title: (
          <Flex align="center">
            <Image
              src={`/images/tossie-types/${currentTossieType}.png`}
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
    }

    // Reset states and refresh data
    setShowAnimation(false);
    setOpeningTossie(null);

    // Refresh data using the provided function
    queryClient.invalidateQueries({ queryKey: ["tossieReceipts"] });
    refreshTossies();
  };

  const handleOpenTossie = (tossieId: number) => {
    setOpeningTossie(tossieId);
    mutation.mutate(tossieId);
  };

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

  // Handle click on a collected tossie to show details
  const handleTossieClick = (type: string, count: number) => {
    setSelectedTossie({ type, count });
  };

  return (
    <VStack spacing={6} align="stretch" w="100%">
      {/* Tossie Opening Animation */}
      <TossieOpeningAnimation
        isActive={showAnimation}
        tossieType={currentTossieType}
        onAnimationComplete={handleAnimationComplete}
        description={currentTossieDescription || undefined}
        fromName={currentTossieSender || undefined}
        eventName={currentEventName || undefined}
        eventDate={currentEventDate || undefined}
      />

      {/* Tossie Details Modal */}
      {selectedTossie && (
        <TossieDetailsModal
          isOpen={!!selectedTossie}
          onClose={() => setSelectedTossie(null)}
          tossieType={selectedTossie.type}
          count={selectedTossie.count}
        />
      )}

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
                        src="/images/tossie-types/blank.png"
                        alt="Mystery Tossie"
                        boxSize="50px"
                        objectFit="contain"
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
                      isLoading={false}
                      onClick={
                        isCollected
                          ? () => handleTossieClick(type, count)
                          : undefined
                      }
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
