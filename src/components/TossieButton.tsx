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
  Textarea,
  FormControl,
  FormLabel,
  Switch,
  FormHelperText,
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
const DEFAULT_TOSSIE_NOTE_KEY = "default_tossie_note";
const DEFAULT_TOSSIE_NOTE_PUBLIC_KEY = "default_tossie_note_public";

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
  const [showNoteModal, setShowNoteModal] = React.useState(false);
  const [dontShowAgain, setDontShowAgain] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [isPublicNote, setIsPublicNote] = React.useState(false);
  const [saveAsDefault, setSaveAsDefault] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = React.useContext(LoginModalContext);
  const toast = useToast();

  // Initialize hasSeenExplanation from localStorage on component mount
  const [hasSeenExplanation, setHasSeenExplanation] = React.useState(() => {
    return localStorage.getItem(TOSSIE_EXPLAINED_KEY) === "true";
  });

  // Load default note from localStorage on component mount
  React.useEffect(() => {
    const defaultNote = localStorage.getItem(DEFAULT_TOSSIE_NOTE_KEY);
    const defaultIsPublic =
      localStorage.getItem(DEFAULT_TOSSIE_NOTE_PUBLIC_KEY) === "true";

    if (defaultNote) {
      setNote(defaultNote);
      setIsPublicNote(defaultIsPublic);
    }
  }, []);

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

  const saveDefaultNote = () => {
    if (saveAsDefault && note.trim()) {
      localStorage.setItem(DEFAULT_TOSSIE_NOTE_KEY, note);
      localStorage.setItem(
        DEFAULT_TOSSIE_NOTE_PUBLIC_KEY,
        isPublicNote.toString()
      );
    }
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

    // Load default note from localStorage before showing the modal
    const defaultNote = localStorage.getItem(DEFAULT_TOSSIE_NOTE_KEY);
    const defaultIsPublic =
      localStorage.getItem(DEFAULT_TOSSIE_NOTE_PUBLIC_KEY) === "true";

    if (defaultNote) {
      setNote(defaultNote);
      setIsPublicNote(defaultIsPublic);
    }

    // Show note modal instead of immediately submitting
    setShowNoteModal(true);
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

      // Save default note if option is checked
      if (saveAsDefault) {
        saveDefaultNote();
      }

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

      // Close the note modal
      setShowNoteModal(false);
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
        setShowNoteModal(false);
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
    // Close the explanation modal
    setShowExplanationModal(false);

    // Save preference if checked
    if (dontShowAgain) {
      markTossieExplanationSeen();
    }

    // Load default note from localStorage before showing the modal
    const defaultNote = localStorage.getItem(DEFAULT_TOSSIE_NOTE_KEY);
    const defaultIsPublic =
      localStorage.getItem(DEFAULT_TOSSIE_NOTE_PUBLIC_KEY) === "true";

    if (defaultNote) {
      setNote(defaultNote);
      setIsPublicNote(defaultIsPublic);
    }

    // Now show the note modal
    setShowNoteModal(true);
  };

  const handleNoteModalClose = () => {
    setShowNoteModal(false);
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

      {/* Tossie Note Modal */}
      <Modal isOpen={showNoteModal} onClose={handleNoteModalClose} size="md">
        <ModalOverlay />
        <ModalContent maxH={{ base: "85vh", md: "auto" }} overflow="hidden">
          <ModalHeader>Add a Note with Your Tossie</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            <VStack spacing={4} align="stretch">
              <Text>
                Add a personal note to your tossie for {skaterName}. This is
                optional but adds a special touch!
              </Text>
              <FormControl>
                <FormLabel>Your Note</FormLabel>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={`Example: Amazing performance, ${skaterName}!`}
                  resize="vertical"
                  rows={3}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="public-note" mb="0">
                  Make note public
                </FormLabel>
                <Switch
                  id="public-note"
                  isChecked={isPublicNote}
                  onChange={(e) => setIsPublicNote(e.target.checked)}
                />
                <FormHelperText ml={2}>
                  {isPublicNote
                    ? "Everyone can see your note"
                    : "Only the skater can see your note"}
                </FormHelperText>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="save-default" mb="0">
                  Save as default note
                </FormLabel>
                <Switch
                  id="save-default"
                  isChecked={saveAsDefault}
                  onChange={(e) => setSaveAsDefault(e.target.checked)}
                />
                <FormHelperText ml={2}>
                  Pre-fill this note for future tossies
                </FormHelperText>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" mr={3} onClick={handleNoteModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={submitTossieForSkater}
              isLoading={isSubmitting}
            >
              {note.trim() ? "Give a Tossie with Note!" : "Give a Tossie!"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
