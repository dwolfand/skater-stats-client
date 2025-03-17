import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#EBF5FF",
      100: "#D1E9FF",
      200: "#A3D3FF",
      300: "#75BCFF",
      400: "#47A6FF",
      500: "#4A90E2", // primary blue
      600: "#2B6CB0",
      700: "#1E4E8C",
      800: "#153E75",
      900: "#1A365D",
    },
    accent: {
      50: "#FFF5F9",
      100: "#FFE6F1",
      200: "#FFC7E3",
      300: "#FFA3D3",
      400: "#FF7AC0",
      500: "#FF4DAB", // primary pink
      600: "#E63D91",
      700: "#CC2E77",
      800: "#B31F5E",
      900: "#991047",
    },
  },
  styles: {
    global: {
      "html, body": {
        background: "transparent",
        minHeight: "100vh",
        "@supports (-webkit-touch-callout: none)": {
          "*": {
            "--webkit-overflow-scrolling-color":
              "var(--chakra-colors-brand-500)",
          },
        },
      },
      "#root": {
        minHeight: "100vh",
      },
      body: {
        color: "gray.800",
        position: "relative",
        "&:before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "linear-gradient(135deg, rgba(74,144,226,0.15) 0%, rgba(244,114,182,0.15) 100%)",
          zIndex: -1,
        },
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        _hover: {
          transform: "translateY(-1px)",
        },
        _active: {
          transform: "translateY(0)",
        },
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
        outline: {
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: "rgba(255, 255, 255, 0.9)",
          borderRadius: "xl",
          boxShadow: "xl",
          border: "1px solid",
          borderColor: "gray.100",
          transition: "all 0.2s",
          _hover: {
            boxShadow: "2xl",
            transform: "translateY(-2px)",
            borderColor: "#f4f4f4",
          },
        },
      },
    },
    Link: {
      baseStyle: {
        color: "brand.500",
        _hover: {
          color: "brand.600",
          textDecoration: "none",
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            borderColor: "gray.200",
            bg: "rgba(255, 255, 255, 0.9)",
            fontWeight: "600",
            color: "gray.700",
          },
          td: {
            borderColor: "gray.200",
            bg: "rgba(255, 255, 255, 0.9)",
          },
          table: {
            bg: "rgba(255, 255, 255, 0.9)",
            borderRadius: "lg",
            overflow: "hidden",
            boxShadow: "xl",
            border: "1px solid",
            borderColor: "gray.100",
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: "gray.700",
        fontWeight: "600",
      },
    },
    Container: {
      baseStyle: {
        maxW: "container.xl",
      },
    },
    Box: {
      variants: {
        card: {
          bg: "rgba(255, 255, 255, 0.9)",
          borderRadius: "xl",
          boxShadow: "xl",
          border: "1px solid",
          borderColor: "gray.100",
          p: { base: 2, md: 6 },
          transition: "all 0.2s",
          _hover: {
            boxShadow: "2xl",
            transform: "translateY(-2px)",
            borderColor: "#f4f4f4",
          },
        },
      },
    },
  },
  fonts: {
    heading:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  shadows: {
    sm: "0 1px 1px 0 rgba(0,0,0,0.05)",
    md: "0 1px 2px -1px rgba(0,0,0,0.05)",
    lg: "0 2px 4px -1px rgba(0,0,0,0.05), 0 1px 2px -1px rgba(0,0,0,0.05)",
    xl: "0 4px 8px -2px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.05)",
    "2xl": "0 8px 16px -3px rgba(0,0,0,0.05), 0 4px 8px -2px rgba(0,0,0,0.05)",
  },
});

export default theme;
