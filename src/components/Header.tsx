import { Box, Heading, Link } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

export default function Header() {
  return (
    <Box
      as="header"
      borderBottom="1px"
      borderColor="gray.200"
      bg="white"
      position="sticky"
      top={0}
      zIndex={10}
      px={4}
      py={3}
      shadow="sm"
    >
      <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
        <Heading size="md" color="blue.600">
          Skater Stats
        </Heading>
      </Link>
    </Box>
  );
}
