import React, { useEffect, useState, useCallback } from "react";
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
  // Simplified state - just track the current animation phase
  const [animationPhase, setAnimationPhase] = useState<
    "idle" | "entrance" | "fadeOut" | "fadeIn" | "exit"
  >("idle");

  // For debugging - log state changes
  useEffect(() => {
    console.log("Animation phase changed to:", animationPhase);
  }, [animationPhase]);

  // Reset the animation
  const resetAnimation = useCallback(() => {
    console.log("Resetting animation");
    setAnimationPhase("idle");
    onAnimationComplete();
  }, [onAnimationComplete]);

  // Handle clicks to skip the animation
  const handleSkip = useCallback(() => {
    console.log("Animation skipped by user");
    setAnimationPhase("exit");
    setTimeout(resetAnimation, 600);
  }, [resetAnimation]);

  // Main animation controller
  useEffect(() => {
    // Skip animation if not active or reduced motion
    if (!isActive) {
      if (animationPhase !== "idle") resetAnimation();
      return;
    }

    if (prefersReducedMotion) {
      onAnimationComplete();
      return;
    }

    // Only start the animation if we're in the idle state
    if (isActive && animationPhase === "idle") {
      console.log("Starting animation sequence");

      // Store all timeouts so we can clean them up
      const timeouts: NodeJS.Timeout[] = [];

      // Phase 1: Entrance - Start immediately
      setAnimationPhase("entrance");

      // Phase 2: Fade out - Start after 1.5 seconds
      timeouts.push(
        setTimeout(() => {
          console.log("Starting fade out");
          setAnimationPhase("fadeOut");
        }, 1500)
      );

      // Phase 3: Fade in - Start after 2 seconds (0.5s after fade out begins)
      timeouts.push(
        setTimeout(() => {
          console.log("Starting fade in");
          setAnimationPhase("fadeIn");
        }, 2000)
      );

      // Phase 4: Exit - Start after 3.5 seconds
      timeouts.push(
        setTimeout(() => {
          console.log("Starting exit animation");
          setAnimationPhase("exit");
        }, 3500)
      );

      // Animation complete - After 4.1 seconds
      timeouts.push(
        setTimeout(() => {
          console.log("Animation complete, resetting");
          resetAnimation();
        }, 4100)
      );

      // Clean up all timeouts if the component unmounts or animation is cancelled
      return () => {
        console.log("Cleaning up timeouts");
        timeouts.forEach((timeout) => clearTimeout(timeout));
      };
    }
  }, [isActive, animationPhase, prefersReducedMotion, resetAnimation]);

  // Don't render anything if we're not animating
  if (!isActive || animationPhase === "idle" || prefersReducedMotion)
    return null;

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
      onClick={handleSkip}
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
        {/* Entrance animation */}
        {animationPhase === "entrance" && (
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

        {/* Fade out animation */}
        {animationPhase === "fadeOut" && (
          <Box
            width="100%"
            height="100%"
            css={css`
              animation: ${fadeOut} 0.5s ease-in forwards;
              -webkit-animation: ${fadeOut} 0.5s ease-in forwards;
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

        {/* Fade in animation */}
        {(animationPhase === "fadeIn" || animationPhase === "exit") &&
          tossieType && (
            <Box
              width="100%"
              height="100%"
              css={css`
                animation: ${animationPhase === "fadeIn" ? fadeIn : exitAnim}
                  0.5s ease-out forwards;
                -webkit-animation: ${animationPhase === "fadeIn"
                    ? fadeIn
                    : exitAnim}
                  0.5s ease-out forwards;
              `}
            >
              <Image
                src={`/images/tossie-types/${tossieType}.png`}
                alt="Tossie Type"
                boxSize="100%"
                objectFit="contain"
                draggable={false}
              />
            </Box>
          )}
      </Box>
    </Box>,
    document.body
  );
};
