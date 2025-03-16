import {
  Box,
  Tooltip,
  Text,
  TooltipProps,
  useDisclosure,
} from "@chakra-ui/react";
import { ReactNode } from "react";

interface HoverTooltipProps extends Omit<TooltipProps, "children"> {
  children: ReactNode;
  text?: string | ReactNode;
}

export default function HoverTooltip({
  children,
  text,
  label,
  ...tooltipProps
}: HoverTooltipProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box position="relative" display="inline-block">
      <Tooltip
        hasArrow
        placement="top"
        bg="white"
        color="gray.800"
        isOpen={isOpen}
        label={text || label}
        {...tooltipProps}
      >
        <Text
          cursor="pointer"
          onClick={onOpen}
          onMouseEnter={onOpen}
          onMouseLeave={onClose}
          onTouchStart={(e) => {
            e.preventDefault();
            onOpen();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setTimeout(onClose, 3000);
          }}
        >
          {children}
        </Text>
      </Tooltip>
    </Box>
  );
}
