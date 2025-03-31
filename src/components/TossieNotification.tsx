import React from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  useColorModeValue,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { TossieReceipt } from "../api/client";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { getTossieNotificationMessage } from "../types/tossies";

interface TossieNotificationProps {
  unopenedCount: number;
  onViewTossies: () => void;
}

export const TossieNotification: React.FC<TossieNotificationProps> = ({
  unopenedCount,
  onViewTossies,
}) => {
  const bgColor = useColorModeValue("blue.50", "blue.900");
  const borderColor = useColorModeValue("blue.200", "blue.700");

  if (unopenedCount === 0) return null;

  // Get the message from the shared function
  const message = getTossieNotificationMessage(unopenedCount);

  return (
    <Box
      p={4}
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      boxShadow="md"
      position="relative"
      overflow="hidden"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "center", md: "center" }}
        justify="space-between"
      >
        <Box>
          <HStack mb={2} spacing={2}>
            <Text fontSize="2xl">{unopenedCount > 3 ? "🎉" : "🎁"}</Text>
            <Heading size="md">
              {unopenedCount} Unopened Tossie{unopenedCount > 1 ? "s" : ""}!
            </Heading>
          </HStack>
          <Text color="gray.600" maxW="lg">
            {message}
          </Text>
        </Box>

        <Button
          mt={{ base: 4, md: 0 }}
          colorScheme="blue"
          onClick={onViewTossies}
          rightIcon={<ChevronRightIcon />}
        >
          Open My Tossies
        </Button>
      </Flex>
    </Box>
  );
};
