import React from "react";
import { Box } from "@chakra-ui/react";
import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Box as="main" pt="60px">
        {children}
      </Box>
    </>
  );
}
