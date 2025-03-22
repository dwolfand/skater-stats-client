import React from "react";
import { IconButton, Image, Tooltip, useToast } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { LoginModalContext } from "./LoginModal";
import { submitTossie } from "../api/client";
import dayjs from "../utils/date";
import { trackTossieLoginPrompt } from "../utils/analytics";

interface TossieButtonProps {
  eventResultId?: number;
  sixEventResultId?: number;
  skaterName: string;
  initialHasTossie?: boolean;
  eventDate?: string;
}

export default function TossieButton({
  eventResultId,
  sixEventResultId,
  skaterName,
  initialHasTossie = false,
  eventDate,
}: TossieButtonProps) {
  const [isGiven, setIsGiven] = React.useState(initialHasTossie);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = React.useContext(LoginModalContext);
  const toast = useToast();

  // Hide button if event date is null or if event is more than 60 days old
  if (!eventDate) {
    return null;
  }

  const eventDay = dayjs(eventDate);
  const today = dayjs();
  const daysSinceEvent = today.diff(eventDay, "day");
  if (daysSinceEvent > 60) {
    return null;
  }

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      trackTossieLoginPrompt(skaterName);
      openLoginModal(`Sign in to give a tossie to ${skaterName}!`);
      return;
    }

    if (!eventResultId && !sixEventResultId) {
      console.error(
        "Either eventResultId or sixEventResultId must be provided"
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await submitTossie({
        eventResultId,
        sixEventResultId,
      });
      setIsGiven(true);
      toast({
        title: "Tossie given!",
        description: `You gave a tossie to ${skaterName}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error("Error submitting tossie:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to give tossie";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      // If the error is that they already gave a tossie, update the state
      if (error.response?.status === 409) {
        setIsGiven(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Tooltip label={isGiven ? "Tossie given!" : "Give a tossie"}>
      <IconButton
        aria-label="Give tossie"
        icon={
          <Image
            src={isGiven ? "/images/tossie_filled.png" : "/images/tossie.png"}
            alt="Tossie"
            boxSize="20px"
          />
        }
        variant="ghost"
        onClick={handleClick}
        isLoading={isSubmitting}
        _hover={{ bg: "transparent" }}
      />
    </Tooltip>
  );
}
