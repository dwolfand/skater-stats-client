"use client";

import type { ButtonProps } from "@chakra-ui/react";
import { Button, IconButton } from "@chakra-ui/react";
import * as React from "react";
import {
  HiChevronLeft,
  HiChevronRight,
  HiMiniEllipsisHorizontal,
} from "react-icons/hi2";

interface PaginationContext {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationContext = React.createContext<PaginationContext | undefined>(
  undefined
);

export interface PaginationRootProps {
  count: number;
  pageSize: number;
  page: number;
  onPageChange: (details: { page: number }) => void;
  size?: ButtonProps["size"];
  variant?: "outline" | "solid" | "subtle";
  children?: React.ReactNode;
}

export const PaginationRoot: React.FC<PaginationRootProps> = ({
  count,
  pageSize,
  page,
  onPageChange,
  size = "md",
  variant = "outline",
  children,
}) => {
  const totalPages = Math.ceil(count / pageSize);

  return (
    <PaginationContext.Provider
      value={{
        currentPage: page,
        totalPages,
        onPageChange: (newPage: number) => onPageChange({ page: newPage }),
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};

export const PaginationPrevTrigger: React.FC = () => {
  const context = React.useContext(PaginationContext);
  if (!context) throw new Error("Must be used within PaginationRoot");

  const { currentPage, onPageChange } = context;

  return (
    <IconButton
      aria-label="Previous page"
      icon={<HiChevronLeft />}
      isDisabled={currentPage <= 1}
      onClick={() => onPageChange(currentPage - 1)}
      variant="outline"
      size="sm"
    />
  );
};

export const PaginationNextTrigger: React.FC = () => {
  const context = React.useContext(PaginationContext);
  if (!context) throw new Error("Must be used within PaginationRoot");

  const { currentPage, totalPages, onPageChange } = context;

  return (
    <IconButton
      aria-label="Next page"
      icon={<HiChevronRight />}
      isDisabled={currentPage >= totalPages}
      onClick={() => onPageChange(currentPage + 1)}
      variant="outline"
      size="sm"
    />
  );
};

export const PaginationItems: React.FC = () => {
  const context = React.useContext(PaginationContext);
  if (!context) throw new Error("Must be used within PaginationRoot");

  const { currentPage, totalPages, onPageChange } = context;

  const pages = React.useMemo(() => {
    const items: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    items.push(1);

    if (currentPage > 3) {
      items.push("ellipsis");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(i);
    }

    if (currentPage < totalPages - 2) {
      items.push("ellipsis");
    }

    items.push(totalPages);

    return items;
  }, [currentPage, totalPages]);

  return (
    <>
      {pages.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <Button
              key={`ellipsis-${index}`}
              variant="ghost"
              size="sm"
              isDisabled
            >
              <HiMiniEllipsisHorizontal />
            </Button>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "solid" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}
    </>
  );
};
