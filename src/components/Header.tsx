import {
  Box,
  Heading,
  Link,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useDisclosure,
  IconButton,
  Collapse,
  VStack,
  useBreakpointValue,
  Text,
  Badge,
  Spinner,
  Avatar,
  Tooltip,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { Search2Icon, CloseIcon, Icon, ArrowBackIcon } from "@chakra-ui/icons";
import { FiUser } from "react-icons/fi";
import FavoritesMenu from "./FavoritesMenu";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchEvents } from "../api/client";
import type { SearchResult } from "../api/client";
import dayjs from "../utils/date";
import { useAuth } from "../context/AuthContext";
import HoverTooltip from "./shared/HoverTooltip";
import { getImageUrl } from "../utils/images";

const SearchInput = ({
  isMobile,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const { data: results, isLoading } = useQuery({
    queryKey: ["headerSearch", query],
    queryFn: () => searchEvents(query),
    enabled: query.length > 2,
  });

  const handleResultClick = (result: SearchResult) => {
    setQuery("");
    onClose?.();
    const path =
      result.type === "competition"
        ? `/competition/${result.year}/${result.ijsId}`
        : result.type === "skater"
        ? result.id
          ? `/skater/id/${result.id}`
          : `/skater/${encodeURIComponent(result.name)}`
        : result.type === "club"
        ? `/club/${result.id}`
        : `/official/id/${result.id}`;
    navigate(path);
  };

  return (
    <Box position={isMobile ? "static" : "relative"} w="100%">
      <InputGroup size={isMobile ? "md" : "sm"}>
        <InputLeftElement pointerEvents="none">
          <Search2Icon color="gray.400" />
        </InputLeftElement>
        <Input
          placeholder="Search skaters, competitions, or officials..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg="gray.50"
          borderRadius="full"
          autoComplete="off"
          fontSize="16px"
          _focus={{
            bg: "white",
            borderColor: "blue.500",
          }}
        />
        {query && (
          <InputRightElement>
            <IconButton
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              aria-label="Clear search"
              onClick={() => setQuery("")}
            />
          </InputRightElement>
        )}
      </InputGroup>

      {query.length > 2 && (
        <Box
          position="absolute"
          top={isMobile ? "calc(100% - 4px)" : "100%"}
          left={0}
          right={0}
          bg="white"
          boxShadow="lg"
          borderRadius="md"
          maxH="400px"
          overflowY="auto"
          zIndex={999}
          mx={isMobile ? 4 : 0}
        >
          {isLoading ? (
            <Box p={4} textAlign="center">
              <Spinner color="blue.500" />
            </Box>
          ) : !results || results.length === 0 ? (
            <Box p={4}>
              <Text color="gray.600">No results found</Text>
            </Box>
          ) : (
            <VStack spacing={0} align="stretch">
              {results.map((result, index) => (
                <Box
                  key={index}
                  p={3}
                  cursor="pointer"
                  onClick={() => handleResultClick(result)}
                  _hover={{ bg: "gray.50" }}
                  borderBottom="1px"
                  borderColor="gray.100"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="500">{result.name}</Text>
                      {result.type === "competition" && result.startDate && (
                        <Text fontSize="sm" color="gray.600">
                          {dayjs(result.startDate).format("MMM D, YYYY")}
                        </Text>
                      )}
                    </VStack>
                    <Badge
                      colorScheme={
                        result.type === "competition"
                          ? "brand"
                          : result.type === "skater"
                          ? "accent"
                          : "purple"
                      }
                    >
                      {result.type}
                    </Badge>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};

// Function to check if app is running in standalone mode (PWA)
const isPWAMode = (): boolean => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
};

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile } = useAuth();
  const {
    isOpen: isMobileSearchOpen,
    onToggle: onMobileSearchToggle,
    onClose: onMobileSearchClose,
  } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isHomePage = location.pathname === "/";
  const [isPWA, setIsPWA] = useState(false);

  // Check if app is running as PWA on mount
  useEffect(() => {
    setIsPWA(isPWAMode());
    // Add event listener for display mode changes
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsPWA(e.matches || (window.navigator as any).standalone === true);
    };

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addEventListener("change", handleDisplayModeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  // Close mobile search when screen size changes to desktop
  useEffect(() => {
    if (!isMobile && isMobileSearchOpen) {
      onMobileSearchClose();
    }
  }, [isMobile, isMobileSearchOpen, onMobileSearchClose]);

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

  const handleBack = () => {
    navigate(-1);
  };

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
      <VStack spacing={2}>
        <HStack justify="space-between" align="center" w="100%">
          {isPWA && !isHomePage ? (
            <HStack spacing={2}>
              <IconButton
                aria-label="Go back"
                icon={<ArrowBackIcon />}
                size="sm"
                variant="ghost"
                onClick={handleBack}
              />
              <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
                <Heading size="md" color="blue.600">
                  Skater Stats
                </Heading>
              </Link>
            </HStack>
          ) : (
            <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
              <Heading size="md" color="blue.600">
                Skater Stats
              </Heading>
            </Link>
          )}

          {/* Desktop Search */}
          {!isHomePage && (
            <Box display={{ base: "none", md: "block" }} flex="1" mx={8}>
              <SearchInput isMobile={false} />
            </Box>
          )}

          <HStack spacing={2}>
            {/* Mobile Search Toggle */}
            {!isHomePage && (
              <IconButton
                aria-label="Search"
                icon={<Search2Icon />}
                size="sm"
                variant="ghost"
                display={{ base: "flex", md: "none" }}
                onClick={onMobileSearchToggle}
              />
            )}
            <FavoritesMenu />
            {isAuthenticated ? (
              <Link as={RouterLink} to="/profile">
                <Avatar
                  size="sm"
                  name={user?.name}
                  src={
                    getImageUrl(profile?.customization?.profileImage) ||
                    user?.picture
                  }
                  cursor="pointer"
                />
              </Link>
            ) : (
              <Link as={RouterLink} to="/profile">
                <IconButton
                  aria-label="Profile"
                  icon={<Icon as={FiUser} />}
                  size="sm"
                  variant="ghost"
                  color="gray.500"
                />
              </Link>
            )}
          </HStack>
        </HStack>

        {/* Mobile Search */}
        {!isHomePage && (
          <Collapse
            in={isMobileSearchOpen}
            animateOpacity
            style={{ width: "100%" }}
          >
            <Box pb={2} w="100%">
              <SearchInput isMobile={true} onClose={onMobileSearchClose} />
            </Box>
          </Collapse>
        )}
      </VStack>
    </Box>
  );
}
