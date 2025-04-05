import React from "react";
import {
  IconButton,
  Image,
  Tooltip,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  Button,
  VStack,
  Box,
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { LoginModalContext } from "./LoginModal";
import { submitTossie } from "../api/client";
import dayjs from "../utils/date";
import { trackTossieLoginPrompt } from "../utils/analytics";

interface TossieButtonProps {
  eventResultId?: number;
  sixEventResultId?: number;
  skaterName: string;
  initialHasTossie?: boolean;
  eventDate?: string;
}

export default function TossieButton({
  eventResultId,
  sixEventResultId,
  skaterName,
  initialHasTossie = false,
  eventDate,
}: TossieButtonProps) {
  const [isGiven, setIsGiven] = React.useState(initialHasTossie);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showTossieModal, setShowTossieModal] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [isPublicNote, setIsPublicNote] = React.useState(false);
  const { isOpen: isNoteOpen, onToggle: onNoteToggle } = useDisclosure();
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = React.useContext(LoginModalContext);
  const toast = useToast();

  // Hide button if event date is null or if event is more than 90 days old
  if (!eventDate) {
    return null;
  }

  const eventDay = dayjs(eventDate);
  const today = dayjs();
  const daysSinceEvent = today.diff(eventDay, "day");
  if (daysSinceEvent > 90) {
    return null;
  }

  const handleGivenTossieClick = (e: React.MouseEvent) => {
    // Still need to stop propagation to prevent opening the results
    e.stopPropagation();

    toast({
      title: "Tossie already given",
      description: `You've already given a tossie to ${skaterName} for this event.`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If the tossie is already given, show a toast instead of opening the modal
    if (isGiven) {
      toast({
        title: "Tossie already given",
        description: `You've already given a tossie to ${skaterName} for this event.`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isAuthenticated) {
      trackTossieLoginPrompt(skaterName);
      openLoginModal(
        `Sign in to give a tossie to ${skaterName}! 🎉\nA tossie is a virtual way to show appreciation for a skater's performance - inspired by the tradition of fans tossing gifts onto the ice after a great performance.\nCreate an account to celebrate ${skaterName}'s achievement!`
      );
      return;
    }

    // Clear note and isPublicNote on modal open
    setNote("");
    setIsPublicNote(false);

    // Reset note collapse state to closed when opening modal
    if (isNoteOpen) {
      onNoteToggle();
    }

    // Show combined modal
    setShowTossieModal(true);
  };

  const submitTossieForSkater = async () => {
    if (!eventResultId && !sixEventResultId) {
      console.error(
        "Either eventResultId or sixEventResultId must be provided"
      );
      return;
    }

    try {
      setIsSubmitting(true);

      await submitTossie({
        eventResultId,
        sixEventResultId,
        note: note.trim() || undefined,
        isPublicNote: note.trim() ? isPublicNote : undefined,
      });

      setIsGiven(true);
      toast({
        title: "Tossie given!",
        description: `You gave a tossie to ${skaterName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Close the modal
      setShowTossieModal(false);
    } catch (error: any) {
      console.error("Error submitting tossie:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to give tossie";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      // If the error is that they already gave a tossie, update the state
      if (error.response?.status === 409) {
        setIsGiven(true);
        setShowTossieModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowTossieModal(false);
  };

  return (
    <>
      <Tooltip label={isGiven ? "Tossie given!" : "Give a tossie"}>
        <IconButton
          aria-label="Give tossie"
          icon={
            <Image
              src={isGiven ? "/images/tossie_filled.png" : "/images/tossie.png"}
              alt="Tossie"
              boxSize="20px"
            />
          }
          variant="ghost"
          onClick={isGiven ? handleGivenTossieClick : handleClick}
          isLoading={isSubmitting}
          _hover={{ bg: "transparent" }}
        />
      </Tooltip>

      {/* Combined Tossie Modal */}
      <Modal isOpen={showTossieModal} onClose={handleModalClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <Box position="relative" textAlign="center" pt={8} pb={2}>
            <Image
              src="/images/tossie_filled.png"
              alt="Tossie"
              boxSize="70px"
              display="inline-block"
              mb={2}
            />
            <ModalHeader paddingTop={0}>
              Give a Tossie to {skaterName}
            </ModalHeader>
          </Box>
          <ModalCloseButton />
          <ModalBody pt={0}>
            <VStack spacing={4} align="stretch">
              {/* Always show the description */}
              <Text fontSize="sm">
                A tossie is a virtual way to show appreciation for a skater's
                performance - inspired by the tradition of fans tossing gifts
                onto the ice after a great performance.
              </Text>

              {/* Only show the button when note section is collapsed */}
              {!isNoteOpen && (
                <Button
                  size="sm"
                  onClick={onNoteToggle}
                  variant="outline"
                  width="100%"
                >
                  Add a Note (Optional)
                </Button>
              )}

              <Collapse in={isNoteOpen} animateOpacity>
                <VStack spacing={3} align="stretch" mt={2}>
                  <FormControl>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={`Example: Amazing performance, ${skaterName}!`}
                      resize="vertical"
                      rows={3}
                      size="sm"
                      fontSize="16px" // Minimum size to prevent iOS zoom
                    />
                  </FormControl>

                  <FormControl display="flex" alignItems="center" size="sm">
                    <FormLabel htmlFor="public-note" mb="0" fontSize="sm">
                      Make note public
                    </FormLabel>
                    <Switch
                      id="public-note"
                      isChecked={isPublicNote}
                      onChange={(e) => setIsPublicNote(e.target.checked)}
                      size="sm"
                    />
                  </FormControl>
                </VStack>
              </Collapse>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={handleModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={submitTossieForSkater}
              isLoading={isSubmitting}
            >
              Give a Tossie!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
