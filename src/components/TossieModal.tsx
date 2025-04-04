import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Link,
  Avatar,
  HStack,
  Box,
  Center,
  Spinner,
  Flex,
  Badge,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "../utils/date";
import { TossieReceipt } from "../api/client";
import { getImageUrl, getThumbnailUrl } from "../utils/images";

interface TossieModalProps {
  isOpen: boolean;
  onClose: () => void;
  tossies: TossieReceipt[] | undefined;
  isLoading: boolean;
}

const TossieReceiptItem: React.FC<{
  receipt: TossieReceipt;
  onClose: () => void;
}> = ({ receipt, onClose }) => {
  const fromName = receipt.fromSkaterName || receipt.fromUserName;
  const eventUrl =
    receipt.resultType === "six_event"
      ? `/competition/${receipt.eventYear}/${receipt.ijsId}/six-event/${receipt.results_url}`
      : `/competition/${receipt.eventYear}/${receipt.ijsId}/event/${receipt.results_url}`;

  // Prefer customProfileImage over fromUserPicture
  // Pass customProfileImage directly to getThumbnailUrl if it exists
  const profileImage = receipt.customProfileImage
    ? getThumbnailUrl(receipt.customProfileImage, "small")
    : receipt.fromUserPicture;

  return (
    <VStack spacing={1} py={2} align="start">
      <HStack spacing={3} w="100%" align="start">
        <Avatar size="sm" src={profileImage} name={receipt.fromUserName} />
        <Box flex={1}>
          <HStack spacing={2} flexWrap="wrap">
            {receipt.fromSkaterId ? (
              <Link
                as={RouterLink}
                to={`/skater/id/${receipt.fromSkaterId}`}
                color="blue.500"
                fontWeight="medium"
                onClick={onClose}
              >
                {fromName}
              </Link>
            ) : (
              <Text fontWeight="medium">{fromName}</Text>
            )}
            <Text>gave a tossie at</Text>
            <Link
              as={RouterLink}
              to={eventUrl}
              color="blue.500"
              onClick={onClose}
            >
              {receipt.eventName}
            </Link>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            {dayjs(receipt.created_at).format("MMM D, YYYY h:mm A")}
          </Text>
        </Box>
      </HStack>

      {receipt.note && (
        <Flex ml={{ base: 3, sm: 10 }} direction="column" mt={1} w="100%">
          <Box
            bg="gray.50"
            p={3}
            borderRadius="md"
            borderLeftWidth={4}
            borderLeftColor="blue.400"
            wordBreak="break-word"
            overflowWrap="break-word"
            maxW="100%"
          >
            <Flex justify="space-between" mb={1}>
              <Badge
                colorScheme={receipt.is_public_note ? "green" : "purple"}
                fontSize="xs"
              >
                {receipt.is_public_note ? "Public Note" : "Private Note"}
              </Badge>
            </Flex>
            <Text fontSize="sm" wordBreak="break-word">
              {receipt.note}
            </Text>
          </Box>
        </Flex>
      )}
    </VStack>
  );
};

export default function TossieModal({
  isOpen,
  onClose,
  tossies,
  isLoading,
}: TossieModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent maxW={{ base: "95%", md: "800px" }} overflowX="hidden">
        <ModalHeader>Received Tossies</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <Center py={8}>
              <Spinner size="lg" />
            </Center>
          ) : !tossies?.length ? (
            <Text color="gray.600" py={4}>
              No tossies received yet.
            </Text>
          ) : (
            <VStack
              align="stretch"
              divider={<Box borderBottomWidth={1} borderColor="gray.200" />}
              maxH="60vh"
              overflowY="auto"
              pr={2}
              maxW="100%"
              w="100%"
              overflowX="hidden"
            >
              {tossies.map((receipt) => (
                <TossieReceiptItem
                  key={receipt.id}
                  receipt={receipt}
                  onClose={onClose}
                />
              ))}
            </VStack>
          )}
        </ModalBody>
        <ModalFooter />
      </ModalContent>
    </Modal>
  );
}
