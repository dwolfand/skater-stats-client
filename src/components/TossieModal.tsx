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
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import dayjs from "../utils/date";
import { TossieReceipt } from "../api/client";

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

  return (
    <HStack spacing={3} py={2} align="start">
      <Avatar
        size="sm"
        src={receipt.fromUserPicture}
        name={receipt.fromUserName}
      />
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
      <ModalContent>
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
