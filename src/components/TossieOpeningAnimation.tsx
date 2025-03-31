import React, { useEffect, useState, useCallback, useRef } from "react";
import { Box, Image, usePrefersReducedMotion } from "@chakra-ui/react";
import { css, keyframes } from "@emotion/react";
import { createPortal } from "react-dom";

interface TossieOpeningAnimationProps {
  isActive: boolean;
  tossieType: string | null;
  onAnimationComplete: () => void;
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
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showTossieBag, setShowTossieBag] = useState(false);
  const [showTossieResult, setShowTossieResult] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      console.log("Cleaning up all timeouts");
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // Handle animation lifecycle
  useEffect(() => {
    if (!isActive) {
      setShowTossieBag(false);
      setShowTossieResult(false);
      setIsExiting(false);
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
      <Box
        position="fixed"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        width="200px"
        height="200px"
        zIndex={10000}
      >
        {/* Tossie bag entrance */}
        {showTossieBag && (
          <Box
            width="100%"
            height="100%"
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
          <Box
            width="100%"
            height="100%"
            css={css`
              animation: ${isExiting ? exitAnim : fadeIn} 0.5s ease-out forwards;
              -webkit-animation: ${isExiting ? exitAnim : fadeIn} 0.5s ease-out
                forwards;
            `}
          >
            <Image
              src={`/images/tossie-types/${tossieType}.png`}
              alt="Tossie Type"
              boxSize="100%"
              objectFit="contain"
              draggable={false}
            />
            {!isExiting && (
              <Box
                position="absolute"
                bottom="-40px"
                left="0"
                right="0"
                textAlign="center"
                color="white"
                fontSize="sm"
              >
                Click to continue
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>,
    document.body
  );
};
