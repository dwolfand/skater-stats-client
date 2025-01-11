import { Box, Heading, Link, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import FavoritesMenu from "./FavoritesMenu";
import { useEffect, useState } from "react";

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrollingUp = prevScrollPos > currentScrollPos;

      setIsVisible(isScrollingUp || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  return (
    <Box
      as="header"
      borderBottom="1px"
      borderColor="gray.200"
      bg="white"
      position="fixed"
      top={0}
      left={0}
      right={0}
      zIndex={10}
      px={4}
      py={3}
      shadow="sm"
      transform={`translateY(${isVisible ? "0" : "-100%"})`}
      transition="transform 0.3s ease-in-out"
    >
      <HStack justify="space-between" align="center">
        <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
          <Heading size="md" color="blue.600">
            Skater Stats
          </Heading>
        </Link>
        <FavoritesMenu />
      </HStack>
    </Box>
  );
}
