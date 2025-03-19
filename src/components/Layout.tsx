import React from "react";
import {
  Box,
  Text,
  Link as ChakraLink,
  HStack,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Header from "./Header";
import FeedbackModal from "./FeedbackModal";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Header />
      <Box
        as="main"
        pt="60px"
        minH={{
          base: "100vh",
          md: "calc(100vh - 60px)",
        }}
        pb={{
          base: "0",
          md: "100px",
        }}
      >
        {children}
      </Box>
      <Box
        as="footer"
        position={{ base: "static", md: "fixed" }}
        bottom={0}
        left={0}
        right={0}
        borderTop="1px"
        borderColor="gray.200"
        bg="white"
        py={{ base: 3, md: 4 }}
        px={6}
      >
        <VStack spacing={2} align="center">
          <HStack
            justify={{ base: "center", md: "space-between" }}
            align="center"
            spacing={4}
            w="full"
          >
            <Text fontSize={{ base: "sm", md: "md" }}>⛸️ Made in DC</Text>
            <HStack spacing={4}>
              <ChakraLink
                href="https://ko-fi.com/david1466"
                isExternal
                color="blue.500"
                _hover={{ textDecoration: "underline", cursor: "pointer" }}
                fontSize={{ base: "sm", md: "md" }}
              >
                ☕ Support
              </ChakraLink>
              <ChakraLink
                onClick={onOpen}
                color="blue.500"
                _hover={{ textDecoration: "underline", cursor: "pointer" }}
                fontSize={{ base: "sm", md: "md" }}
              >
                🐛 Report an Issue
              </ChakraLink>
              <HStack spacing={4} display={{ base: "none", md: "flex" }}>
                <ChakraLink
                  as={RouterLink}
                  to="/terms"
                  color="blue.500"
                  _hover={{ textDecoration: "underline", cursor: "pointer" }}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Terms
                </ChakraLink>
                <ChakraLink
                  as={RouterLink}
                  to="/privacy"
                  color="blue.500"
                  _hover={{ textDecoration: "underline", cursor: "pointer" }}
                  fontSize={{ base: "sm", md: "md" }}
                >
                  Privacy
                </ChakraLink>
              </HStack>
            </HStack>
          </HStack>
          <HStack spacing={4} display={{ base: "flex", md: "none" }}>
            <ChakraLink
              as={RouterLink}
              to="/terms"
              color="blue.500"
              _hover={{ textDecoration: "underline", cursor: "pointer" }}
              fontSize={{ base: "sm", md: "md" }}
            >
              Terms
            </ChakraLink>
            <ChakraLink
              as={RouterLink}
              to="/privacy"
              color="blue.500"
              _hover={{ textDecoration: "underline", cursor: "pointer" }}
              fontSize={{ base: "sm", md: "md" }}
            >
              Privacy
            </ChakraLink>
          </HStack>
        </VStack>
      </Box>
      <FeedbackModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
