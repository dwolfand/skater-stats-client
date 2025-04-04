import { useEffect } from "react";

const DEFAULT_TITLE =
  "Skater Stats - See your past scores and get live updates";

interface DocumentTitleProps {
  title?: string;
}

/**
 * Component to set the document title. Can be included in any component
 * to automatically handle title changes and resets.
 */
export function DocumentTitle({ title = DEFAULT_TITLE }: DocumentTitleProps) {
  useEffect(() => {
    // Set the document title when component mounts
    const previousTitle = document.title;
    document.title = title;

    // Reset to previous title when component unmounts
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  // This component doesn't render anything
  return null;
}

export { DEFAULT_TITLE };
