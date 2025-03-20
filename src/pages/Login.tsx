import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Box,
  Heading,
  Text,
  VStack,
  Center,
} from "@chakra-ui/react";

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

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (!window.google) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          if (response.credential) {
            try {
              await login(response.credential);
              navigate("/");
            } catch (error) {
              console.error("Login failed:", error);
            }
          }
        },
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin")!,
        {
          theme: "outline",
          size: "large",
          type: "standard",
        }
      );
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
  }, [login, navigate]);

  return (
    <Container maxW="container.xl" py={20}>
      <Center>
        <Box
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="lg"
          maxW="md"
          w="full"
        >
          <VStack spacing={6}>
            <Heading size="lg" textAlign="center">
              Sign in to Skater Stats
            </Heading>
            <Text color="gray.600" textAlign="center">
              Access your skating profile and more
            </Text>
            <Box id="google-signin" />
          </VStack>
        </Box>
      </Center>
    </Container>
  );
};
