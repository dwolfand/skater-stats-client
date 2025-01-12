import { create, all } from "mathjs";

// Create a new instance of mathjs with all functions
const math = create(all);

// Configure mathjs
math.config({
  // Precision for floating point arithmetic
  precision: 2,
  // Number of significant digits to return in string output
  number: "number",
});

/**
 * Safely formats a number to 2 decimal places
 * @param value - The value to format (can be number, string, null, or undefined)
 * @returns A string representation of the number with 2 decimal places
 */
export const formatNumber = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined) return "0.00";
  try {
    const num = math.number(value);
    return math.format(num, { notation: "fixed", precision: 2 });
  } catch {
    return "0.00";
  }
};

export default math;
