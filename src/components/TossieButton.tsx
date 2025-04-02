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
  Checkbox,
  VStack,
  Flex,
  Box,
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

const TOSSIE_EXPLAINED_KEY = "tossie_explanation_viewed";

export default function TossieButton({
  eventResultId,
  sixEventResultId,
  skaterName,
  initialHasTossie = false,
  eventDate,
}: TossieButtonProps) {
  const [isGiven, setIsGiven] = React.useState(initialHasTossie);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showExplanationModal, setShowExplanationModal] = React.useState(false);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = React.useContext(LoginModalContext);
  const toast = useToast();

  // Initialize hasSeenExplanation from localStorage on component mount
  const [hasSeenExplanation, setHasSeenExplanation] = React.useState(() => {
    return localStorage.getItem(TOSSIE_EXPLAINED_KEY) === "true";
  });

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

  const markTossieExplanationSeen = () => {
    localStorage.setItem(TOSSIE_EXPLAINED_KEY, "true");
    setHasSeenExplanation(true);
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      trackTossieLoginPrompt(skaterName);
      openLoginModal(
        `Sign in to give a tossie to ${skaterName}! 🎉\nA tossie is a virtual way to show appreciation for a skater's performance - inspired by the tradition of fans tossing gifts onto the ice after a great performance.\nCreate an account to celebrate ${skaterName}'s achievement!`
      );
      return;
    }

    // If authenticated but hasn't seen the explanation, show it first
    if (isAuthenticated && !hasSeenExplanation) {
      setShowExplanationModal(true);
      return;
    }

    await submitTossieForSkater();
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
      });
      setIsGiven(true);
      toast({
        title: "Tossie given!",
        description: `You gave a tossie to ${skaterName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    // Just close the modal without giving a tossie
    setShowExplanationModal(false);

    // Still save the user preference if they checked "don't show again"
    if (dontShowAgain) {
      markTossieExplanationSeen();
    }
  };

  const handleGiveTossie = () => {
    // Close the modal
    setShowExplanationModal(false);

    // Save preference if checked
    if (dontShowAgain) {
      markTossieExplanationSeen();
    }

    // Now give the tossie
    submitTossieForSkater();
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
          onClick={handleClick}
          isLoading={isSubmitting}
          _hover={{ bg: "transparent" }}
        />
      </Tooltip>

      {/* Tossie Explanation Modal */}
      <Modal isOpen={showExplanationModal} onClose={handleModalClose} size="md">
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
            <ModalHeader paddingTop={0}>What's a Tossie?</ModalHeader>
          </Box>
          <ModalCloseButton />
          <ModalBody pt={0}>
            <VStack spacing={4} align="stretch">
              <Text>
                A tossie is a soft, celebratory item tossed onto the ice to
                honor a skater's performance. Often a plush toy, handmade gift,
                or small themed bundle, it's a heartfelt tradition in figure
                skating—offering encouragement, appreciation, and joy from fans
                to skaters.
              </Text>
              <Text>
                By clicking "Give a tossie", you're virtually showing your
                support for {skaterName}'s performance!
              </Text>
              <Checkbox
                isChecked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              >
                Don't show this again
              </Checkbox>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleGiveTossie}>
              Give a Tossie!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
