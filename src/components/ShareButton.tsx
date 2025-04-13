import { IconButton, Icon, useToast, IconButtonProps } from "@chakra-ui/react";
import { BsShare } from "react-icons/bs";
import { useCallback } from "react";

interface ShareButtonProps extends Omit<IconButtonProps, "aria-label"> {
  title: string;
  text?: string;
  url: string;
}

const ShareButton = ({ title, text, url, ...props }: ShareButtonProps) => {
  const toast = useToast();

  const handleShare = useCallback(async () => {
    // Check if the Web Share API is supported
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (error) {
        // User canceled or share failed
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Error sharing:", error);
          toast({
            title: "Sharing failed",
            description: "Could not share this content",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "The link has been copied to your clipboard",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Failed to copy:", error);
        toast({
          title: "Copy failed",
          description: "Could not copy the link to clipboard",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [title, text, url, toast]);

  return (
    <IconButton
      aria-label="Share"
      icon={<Icon as={BsShare} />}
      onClick={handleShare}
      {...props}
    />
  );
};

export default ShareButton;
