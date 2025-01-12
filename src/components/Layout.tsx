import React from "react";
import {
  Box,
  Text,
  Link,
  HStack,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
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
        <HStack justify="space-between" align="center">
          <Text fontSize={{ base: "sm", md: "md" }}>
            Made with ⛸️ in Washington, DC
          </Text>
          <Link
            onClick={onOpen}
            color="blue.500"
            _hover={{ textDecoration: "underline", cursor: "pointer" }}
            fontSize={{ base: "sm", md: "md" }}
          >
            Report an Issue
          </Link>
        </HStack>
      </Box>
      <FeedbackModal isOpen={isOpen} onClose={onClose} />
    </>
  );
}
