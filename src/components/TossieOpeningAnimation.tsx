import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  Box,
  Image,
  usePrefersReducedMotion,
  VStack,
  Text,
  Button,
  Flex,
  Heading,
  Badge,
} from "@chakra-ui/react";
import { css, keyframes } from "@emotion/react";
import { createPortal } from "react-dom";
import dayjs from "../utils/date";
import { getTossieInfo } from "../types/tossies";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface TossieOpeningAnimationProps {
  isActive: boolean;
  tossieType: string | null;
  onAnimationComplete: () => void;
  fromName?: string;
  description?: string;
  eventName?: string;
  eventDate?: string;
  note?: string;
}

// Define keyframes for the fly-in animation
const flyIn = keyframes`
  0% { transform: translateX(-100vw) scale(0.5); }
  100% { transform: translateX(0) scale(1); }
`;

// Fade out animation
const fadeOut = keyframes`
  0% { opacity: 1; }
  100% { opacity: 0; }
`;

// Fade in animation
const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

// Exit animation
const exitAnim = keyframes`
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1.5); }
`;

export const TossieOpeningAnimation: React.FC<TossieOpeningAnimationProps> = ({
  isActive,
  tossieType,
  onAnimationComplete,
  fromName,
  description,
  eventName,
  eventDate,
  note,
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showTossieBag, setShowTossieBag] = useState(false);
  const [showTossieResult, setShowTossieResult] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [activeConfetti, setActiveConfetti] = useState(true);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // For confetti
  const { width, height } = useWindowSize();

  // Calculate number of confetti pieces based on screen width
  const numberOfConfettiPieces = useMemo(() => {
    if (width < 480) return 150; // Mobile phones
    if (width < 768) return 200; // Tablets
    if (width < 1024) return 250; // Small laptops
    return 300; // Larger screens
  }, [width]);

  // Get tossie info including name
  const tossieInfo = tossieType ? getTossieInfo(tossieType) : null;

  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      console.log("Cleaning up all timeouts");
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Handle confetti display and timing
  useEffect(() => {
    if (showTossieResult && !isExiting) {
      setShowConfetti(true);
      setActiveConfetti(true);

      // Stop generating new confetti after 5 seconds
      const confettiTimeout = setTimeout(() => {
        setActiveConfetti(false);
      }, 5000);

      timeoutsRef.current.push(confettiTimeout);

      return () => {
        clearTimeout(confettiTimeout);
      };
    } else {
      setShowConfetti(false);
      setActiveConfetti(true);
    }
  }, [showTossieResult, isExiting]);

  // Handle animation lifecycle
  useEffect(() => {
    if (!isActive) {
      setShowTossieBag(false);
      setShowTossieResult(false);
      setIsExiting(false);
      setShowConfetti(false);
      return;
    }

    if (prefersReducedMotion) {
      onAnimationComplete();
      return;
    }

    console.log("Starting animation sequence");

    // First show the tossie bag
    setShowTossieBag(true);
    setShowTossieResult(false);
    setIsExiting(false);

    // After 1.5 seconds, transition to the tossie result
    const timeout1 = setTimeout(() => {
      console.log("Transitioning to tossie result");
      setShowTossieBag(false);

      // Small delay before showing the result
      const timeout2 = setTimeout(() => {
        setShowTossieResult(true);
      }, 500);

      timeoutsRef.current.push(timeout2);
    }, 1500);

    timeoutsRef.current.push(timeout1);
  }, [isActive, prefersReducedMotion, onAnimationComplete]);

  // Handle click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      // If we're showing the tossie result, start exit
      if (showTossieResult && !isExiting) {
        console.log("User clicked to finish animation");
        setIsExiting(true);

        // Complete animation after 600ms
        const timeout = setTimeout(() => {
          setShowTossieBag(false);
          setShowTossieResult(false);
          setIsExiting(false);
          onAnimationComplete();
        }, 600);

        timeoutsRef.current.push(timeout);
      }
      // If we're in the entrance phase, skip to the result
      else if (showTossieBag && !showTossieResult) {
        console.log("User skipped to result");
        setShowTossieBag(false);
        setShowTossieResult(true);
      }
    },
    [showTossieBag, showTossieResult, isExiting, onAnimationComplete]
  );

  // Don't render anything if not active
  if (!isActive || prefersReducedMotion) return null;

  return createPortal(
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      width="100vw"
      height="100vh"
      zIndex={9999}
      bg="rgba(0,0,0,0.8)"
      onClick={handleClick}
      cursor="pointer"
    >
      {/* Confetti effect */}
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={activeConfetti}
          run={true}
          numberOfPieces={numberOfConfettiPieces}
          gravity={0.03}
          tweenDuration={10000}
          colors={[
            "#FFC700",
            "#FF0000",
            "#2E3191",
            "#41BBC7",
            "#9F24B4",
            "#FF8F2B",
          ]}
          initialVelocityY={0.5}
          confettiSource={{
            x: 0,
            y: 0,
            w: width,
            h: 0,
          }}
        />
      )}

      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        zIndex={10000}
      >
        {/* Tossie bag entrance */}
        {showTossieBag && (
          <Box
            width="200px"
            height="200px"
            css={css`
              animation: ${flyIn} 1s ease-out forwards;
              -webkit-animation: ${flyIn} 1s ease-out forwards;
            `}
          >
            <Image
              src="/images/tossie_filled.png"
              alt="Tossie"
              boxSize="100%"
              objectFit="contain"
              draggable={false}
            />
          </Box>
        )}

        {/* Tossie result */}
        {showTossieResult && tossieType && (
          <Flex
            direction="column"
            alignItems="center"
            css={css`
              animation: ${isExiting ? exitAnim : fadeIn} 0.5s ease-out forwards;
              -webkit-animation: ${isExiting ? exitAnim : fadeIn} 0.5s ease-out
                forwards;
            `}
          >
            {!isExiting && (
              <VStack
                textAlign="center"
                color="white"
                spacing={4}
                width="350px"
                bg="rgba(0,0,0,0.75)"
                p={5}
                borderRadius="20px"
                boxShadow="0 4px 8px rgba(0,0,0,0.2)"
              >
                {/* Tossie image inside the box */}
                <Box width="180px" height="180px" mt={2} mb={2}>
                  <Image
                    src={`/images/tossie-types/${tossieType}.png`}
                    alt={tossieInfo?.title || "Tossie Type"}
                    boxSize="100%"
                    objectFit="contain"
                    draggable={false}
                  />
                </Box>

                {/* Tossie name as header */}
                {tossieInfo?.title && (
                  <Heading size="md" fontWeight="bold" color="white">
                    {tossieInfo.title}
                  </Heading>
                )}

                {/* Description with better readability */}
                {description && (
                  <Text fontSize="md" color="white" fontWeight="medium">
                    {description}
                  </Text>
                )}

                {/* Note if available */}
                {note && (
                  <Box
                    width="100%"
                    bg="rgba(255,255,255,0.1)"
                    p={3}
                    borderRadius="md"
                    borderLeft="4px solid rgba(66, 153, 225, 0.8)"
                  >
                    <Badge bg="rgba(66, 153, 225, 0.8)" color="white" mb={2}>
                      Note
                    </Badge>
                    <Text color="white" fontSize="sm">
                      "{note}"
                    </Text>
                  </Box>
                )}

                {/* From information */}
                {fromName && (
                  <Text fontSize="sm" color="gray.300">
                    From {fromName}
                  </Text>
                )}

                {/* Event information */}
                {eventName && (
                  <Text fontSize="xs" color="gray.400">
                    {eventName}
                    {eventDate &&
                      ` (${dayjs(eventDate).format("MMM D, YYYY")})`}
                  </Text>
                )}

                {/* Tap to close prompt */}
                <Text fontSize="xs" color="gray.500" mt={3}>
                  Tap anywhere to continue
                </Text>
              </VStack>
            )}
          </Flex>
        )}
      </Box>
    </Box>,
    document.body
  );
};
