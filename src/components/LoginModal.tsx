import React, { useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  "968418043401-c0nnio4ubtfruq0n0733891a0o3252uv.apps.googleusercontent.com";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function LoginModal({ isOpen, onClose, message }: LoginModalProps) {
  const { login } = useAuth();
  const buttonId = React.useId();

  useEffect(() => {
    if (isOpen) {
      const initializeGoogleSignIn = () => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            if (response.credential) {
              try {
                await login(response.credential);
                onClose();
              } catch (error) {
                console.error("Login failed:", error);
              }
            }
          },
        });

        const buttonElement = document.getElementById(buttonId);
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: "outline",
            size: "large",
            type: "standard",
          });
        }
      };

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.onload = initializeGoogleSignIn;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen, login, onClose, buttonId]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent mx={4}>
        <ModalHeader>Sign In Required</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch">
            <Text>{message || "Please sign in to continue"}</Text>
            <Box id={buttonId} />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

// Create a context to manage the login modal state globally
export const LoginModalContext = React.createContext({
  openLoginModal: (message?: string) => {},
});

export function LoginModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [modalMessage, setModalMessage] = React.useState<string>();

  const openLoginModal = (message?: string) => {
    setModalMessage(message);
    onOpen();
  };

  return (
    <LoginModalContext.Provider value={{ openLoginModal }}>
      {children}
      <LoginModal isOpen={isOpen} onClose={onClose} message={modalMessage} />
    </LoginModalContext.Provider>
  );
}
