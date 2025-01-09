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

export default math;
