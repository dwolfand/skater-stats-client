import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  Box,
  Divider,
  HStack,
  Badge,
  Image,
  ScaleFade,
  useDisclosure,
  Center,
} from "@chakra-ui/react";
import {
  getTossieInfo,
  getRarityLabel,
  TossieTypeDefinition,
  getCategoryInfo,
} from "../types/tossies";

interface TossieDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tossieType: string;
  count?: number;
}

/**
 * A reusable modal component for displaying tossie details
 * Used in both the skater profile page and the tossie basket
 */
export const TossieDetailsModal: React.FC<TossieDetailsModalProps> = ({
  isOpen,
  onClose,
  tossieType,
  count = 1,
}) => {
  // Get tossie definition and metadata
  const definition = getTossieInfo(tossieType);
  const category = definition.category || "";
  const rarityInfo = getRarityLabel(definition.rarity);

  return (
    <Modal isOpen={isOpen} onClose={onClose} motionPreset="scale" isCentered>
      <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(2px)" />
      <ModalContent>
        <ModalCloseButton zIndex={2} />

        {/* Image centered at the top */}
        <Center pt={8} pb={2}>
          <ScaleFade initialScale={0.8} in={isOpen}>
            <Image
              src={`/images/tossie-types/${tossieType}.png`}
              alt={definition.title}
              boxSize="120px"
              objectFit="contain"
              className="tossie-details-image"
            />
          </ScaleFade>
        </Center>

        {/* Title below the image */}
        <ModalHeader textAlign="center" pt={2} pb={0}>
          <Text>{definition.title}</Text>
        </ModalHeader>

        <ModalBody pt={2} pb={6}>
          <Box mb={4} textAlign="center">
            <Text color="gray.700">{definition.description}</Text>
            {count > 1 && (
              <Text mt={2} fontWeight="bold">
                Received {count} times
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
                <Text fontWeight="medium">{category}</Text>
              </HStack>
              <Badge colorScheme={rarityInfo.color.split(".")[0]}>
                {rarityInfo.label}
              </Badge>
            </Flex>

            <Text fontSize="sm" color="gray.500">
              {getCategoryInfo()[category]?.description || ""}
            </Text>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
