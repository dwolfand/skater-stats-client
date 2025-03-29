import React, { useEffect, useState } from "react";
import {
  Box,
  HStack,
  Text,
  IconButton,
  Button,
  useColorModeValue,
  Icon,
  SlideFade,
  useBreakpointValue,
  Flex,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { FaDownload, FaApple } from "react-icons/fa";
import { usePWAInstall } from "../context/PWAInstallContext";

// Detect iOS Safari
const isIOSSafari = (): boolean => {
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  return iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/FxiOS/i);
};

// Height of the banner in pixels
const BANNER_HEIGHT = 60;

export function PWAInstallBanner() {
  const { isPWAInstallBannerVisible, hideBanner, showInstallPrompt } =
    usePWAInstall();
  const [isRendered, setIsRendered] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("blue.200", "blue.700");
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Check platform on mount
  useEffect(() => {
    setIsIOS(isIOSSafari());
  }, []);

  // Handle animation timing
  useEffect(() => {
    if (isPWAInstallBannerVisible) {
      setIsRendered(true);
    } else {
      // Delay unmounting to allow exit animation to complete
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 200); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isPWAInstallBannerVisible]);

  if (!isRendered) {
    return null;
  }

  const messageText = isIOS
    ? "Install Skater Stats: tap Share then 'Add to Home Screen'"
    : "Install Skater Stats for better performance and offline access";

  return (
    <SlideFade in={isPWAInstallBannerVisible} offsetY="20px">
      <Box
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        width="100%"
        zIndex={99}
        bg={bgColor}
        borderTop="1px"
        borderColor={borderColor}
        px={{ base: 3, md: 4 }}
        py={{ base: 2, md: 3 }}
        boxShadow="0 -2px 10px rgba(0, 0, 0, 0.05)"
        minHeight={`${BANNER_HEIGHT}px`}
      >
        {/* Two separate layouts for mobile and desktop */}
        {isMobile ? (
          <>
            {/* Mobile layout */}
            <Flex
              justifyContent="space-between"
              alignItems="flex-start"
              width="100%"
            >
              {/* Text and icon */}
              <HStack spacing={2} flex="1" pr={2}>
                <Icon
                  as={isIOS ? FaApple : FaDownload}
                  boxSize={4}
                  color="blue.500"
                  flexShrink={0}
                />
                <Text fontSize="xs" fontWeight="medium">
                  {messageText}
                </Text>
              </HStack>

              {/* Close button */}
              <IconButton
                aria-label="Close banner"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                onClick={hideBanner}
                flexShrink={0}
              />
            </Flex>

            {/* Install button in its own row */}
            {!isIOS && (
              <Box mt={2}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={showInstallPrompt}
                >
                  Install
                </Button>
              </Box>
            )}
          </>
        ) : (
          /* Desktop layout - unchanged */
          <Flex justify="space-between" align="center" height="100%">
            <HStack spacing={3} flex="1">
              <Icon
                as={isIOS ? FaApple : FaDownload}
                boxSize={5}
                color="blue.500"
              />
              <Text fontSize="sm" fontWeight="medium">
                {messageText}
              </Text>
            </HStack>
            <HStack spacing={2}>
              {!isIOS && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={showInstallPrompt}
                >
                  Install
                </Button>
              )}
              <IconButton
                aria-label="Close banner"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                onClick={hideBanner}
              />
            </HStack>
          </Flex>
        )}
      </Box>
    </SlideFade>
  );
}

// Export a separate spacer component that can be added at the bottom of the layout
export function PWAInstallSpacer() {
  const { isPWAInstallBannerVisible } = usePWAInstall();
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (!isPWAInstallBannerVisible) {
    return null;
  }

  // Taller spacer on mobile due to potentially wrapping text
  const spacerHeight = isMobile ? BANNER_HEIGHT * 1.8 : BANNER_HEIGHT;

  return <Box height={`${spacerHeight}px`} width="100%" />;
}
