/**
 * Normalizes a name by:
 * 1. Converting to lowercase
 * 2. Removing special characters
 * 3. Removing extra spaces
 * 4. Removing common name parts (like 'jr', 'sr', 'iii', etc)
 */
export const normalizeName = (name: string): string => {
  return (
    name
      .toLowerCase()
      // Remove special characters and numbers
      .replace(/[^a-z\s]/g, "")
      // Remove common name suffixes
      .replace(/\s+(jr|sr|ii|iii|iv)(\s|$)/g, "")
      // Replace multiple spaces with single space and trim
      .replace(/\s+/g, " ")
      .trim()
  );
};

/**
 * Compares two names after normalizing them
 * Returns true if the names match after normalization
 */
export const compareNames = (name1: string, name2: string): boolean => {
  return normalizeName(name1) === normalizeName(name2);
};
