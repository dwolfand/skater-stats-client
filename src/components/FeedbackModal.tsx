import React, { createContext, useContext, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Textarea,
  VStack,
  Text,
  useToast,
  FormControl,
  FormLabel,
  Input,
  FormHelperText,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { submitFeedback } from "../api/client";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject?: string;
  initialMessage?: string;
}

interface FeedbackModalContextType {
  openFeedbackModal: (subject?: string, initialMessage?: string) => void;
}

export const FeedbackModalContext = createContext<FeedbackModalContextType>({
  openFeedbackModal: () => {},
});

export const useFeedbackModal = () => useContext(FeedbackModalContext);

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  subject,
  initialMessage,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [feedback, setFeedback] = useState(initialMessage || "");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  React.useEffect(() => {
    if (initialMessage) {
      setFeedback(initialMessage);
    }
  }, [initialMessage]);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Please enter your feedback",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback({
        message: feedback,
        email: !isAuthenticated && email ? email : undefined,
      });

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
        status: "success",
        duration: 5000,
      });
      onClose();
      setFeedback("");
      setEmail("");
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error submitting feedback",
        description: error.response?.data?.error || "Please try again later",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFeedback("");
    setEmail("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{subject || "Provide Feedback"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Feedback</FormLabel>
              <Textarea
                placeholder="Tell us what's wrong or what could be improved..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                minH="150px"
              />
            </FormControl>
            {!isAuthenticated && (
              <FormControl>
                <FormLabel>Email (optional)</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter your email if you'd like us to follow up"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FormHelperText>
                  We'll only use this to respond to your feedback
                </FormHelperText>
              </FormControl>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit Feedback
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const FeedbackModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState<string | undefined>();
  const [initialMessage, setInitialMessage] = useState<string | undefined>();

  const openFeedbackModal = (subject?: string, initialMessage?: string) => {
    setSubject(subject);
    setInitialMessage(initialMessage);
    setIsOpen(true);
  };

  const onClose = () => {
    setIsOpen(false);
    setSubject(undefined);
    setInitialMessage(undefined);
  };

  return (
    <FeedbackModalContext.Provider value={{ openFeedbackModal }}>
      {children}
      <FeedbackModal
        isOpen={isOpen}
        onClose={onClose}
        subject={subject}
        initialMessage={initialMessage}
      />
    </FeedbackModalContext.Provider>
  );
};
