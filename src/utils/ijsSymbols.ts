export interface IJSSymbol {
  symbol: string;
  description: string;
  category?: "jump" | "spin" | "step" | "general";
}

export const ijsSymbols: { [key: string]: IJSSymbol } = {
  // Basic Symbols
  e: {
    symbol: "e",
    description: "Wrong edge take-off in jump elements (Flutz/Lip)",
    category: "jump",
  },
  "!": {
    symbol: "!",
    description: "Attention - unclear edge take-off in jump elements",
    category: "jump",
  },
  "<<": {
    symbol: "<<",
    description: "Downgraded jump (missing rotation of ½ revolution or more)",
    category: "jump",
  },
  "<": {
    symbol: "<",
    description: "Under-rotated jump (missing rotation of ¼ to ½ revolution)",
    category: "jump",
  },
  ">": {
    symbol: ">",
    description: "Over-rotated jump",
    category: "jump",
  },
  q: {
    symbol: "q",
    description:
      "Jump landed on quarter (missing rotation less than ¼ revolution)",
    category: "jump",
  },
  Q: {
    // Seen 3 times
    symbol: "Q",
    description:
      "Jump landed on quarter (missing rotation less than ¼ revolution)",
    category: "jump",
  },
  "*": {
    symbol: "*",
    description: "Invalid element",
    category: "general",
  },
  F: {
    symbol: "F",
    description: "Fall during the element",
    category: "general",
  },
  f: {
    symbol: "f",
    description: "Fall during the element",
    category: "general",
  },
  S: {
    symbol: "S",
    description: "Step Sequence",
    category: "step",
  },
  C: {
    symbol: "C",
    description: "Combination",
    category: "general",
  },
  c: {
    // Seen 1 time
    symbol: "c",
    description: "Combination",
    category: "general",
  },
  CS: {
    symbol: "CS",
    description: "Change of Spin",
    category: "spin",
  },
  U: {
    symbol: "U",
    description: "Unclear/unclear edge",
    category: "general",
  },
  u: {
    // Seen 1 time
    symbol: "u",
    description: "Unclear/unclear edge",
    category: "general",
  },
  V: {
    // Seen 3 times
    symbol: "V",
    description: "Wrong number of rotations/positions in spin",
    category: "spin",
  },

  // Edge and Rotation Combinations
  "e<<": {
    // Seen 17 times
    symbol: "e<<",
    description: "Wrong edge take-off with downgraded jump",
    category: "jump",
  },
  "e<": {
    // Seen 16 times
    symbol: "e<",
    description: "Wrong edge take-off with under-rotated jump",
    category: "jump",
  },
  "!q": {
    // Seen 17 times
    symbol: "!q",
    description: "Unclear edge take-off with quarter rotation",
    category: "jump",
  },
  "!<": {
    // Seen 10 times
    symbol: "!<",
    description: "Unclear edge take-off with under-rotation",
    category: "jump",
  },
  "!<<": {
    // Seen 9 times
    symbol: "!<<",
    description: "Unclear edge take-off with downgraded jump",
    category: "jump",
  },
  "q<": {
    // Seen 9 times
    symbol: "q<",
    description: "Quarter rotation with under-rotation",
    category: "jump",
  },
  eq: {
    // Seen 8 times
    symbol: "eq",
    description: "Wrong edge take-off with quarter rotation",
    category: "jump",
  },
  "<<<": {
    // Seen 2 times
    symbol: "<<<",
    description: "Severely downgraded jump",
    category: "jump",
  },
  "<<<<": {
    // Seen 1 time
    symbol: "<<<<",
    description: "Severely downgraded jump",
    category: "jump",
  },

  // Fall Combinations
  eF: {
    // Seen 15 times
    symbol: "eF",
    description: "Wrong edge take-off with Fall",
    category: "jump",
  },
  "F*": {
    // Seen 12 times
    symbol: "F*",
    description: "Fall on invalid element",
    category: "general",
  },
  "!F": {
    // Seen 10 times
    symbol: "!F",
    description: "Unclear edge take-off with Fall",
    category: "jump",
  },
  qF: {
    // Seen 10 times
    symbol: "qF",
    description: "Quarter rotation with Fall",
    category: "jump",
  },
  "f!": {
    // Seen 6 times
    symbol: "f!",
    description: "Fall with unclear edge take-off",
    category: "jump",
  },
  FS: {
    // Seen 6 times
    symbol: "FS",
    description: "Fall during Step Sequence",
    category: "step",
  },
  "f<": {
    // Seen 5 times
    symbol: "f<",
    description: "Fall on under-rotated jump",
    category: "jump",
  },
  "*F": {
    // Seen 5 times
    symbol: "F*",
    description: "Invalid element with Fall",
    category: "general",
  },
  UF: {
    // Seen 4 times
    symbol: "UF",
    description: "Unclear edge with Fall",
    category: "general",
  },
  fe: {
    // Seen 3 times
    symbol: "fe",
    description: "Fall with wrong edge take-off",
    category: "jump",
  },
  FU: {
    // Seen 3 times
    symbol: "FU",
    description: "Fall with unclear edge",
    category: "general",
  },

  // No Value Combinations
  NC: {
    // Seen 8 times
    symbol: "NC",
    description: "No value - Combination",
    category: "general",
  },
  NS: {
    // Seen 11 times
    symbol: "NS",
    description: "No value - Step Sequence",
    category: "step",
  },
  nCF: {
    // Seen 11 times
    symbol: "nCF",
    description: "No value - Combination with Fall",
    category: "general",
  },
  nSnU: {
    // Seen 7 times
    symbol: "nSnU",
    description: "No value - Step Sequence and Unclear edge",
    category: "step",
  },
  NU: {
    // Seen 3 times
    symbol: "NU",
    description: "No value - Unclear edge",
    category: "general",
  },

  // Special Combinations
  "**": {
    // Seen 2 times
    symbol: "**",
    description: "Multiple invalid elements",
    category: "general",
  },
  SU: {
    // Seen 6 times
    symbol: "SU",
    description: "Step Sequence with unclear edge",
    category: "step",
  },

  "<<*": {
    symbol: "<<*",
    description: "Downgraded and invalid element",
    category: "jump",
  },
  "F<": {
    symbol: "F<",
    description: "Fall on under-rotated jump",
    category: "jump",
  },
  "F<<": {
    symbol: "F<<",
    description: "Fall on downgraded jump",
    category: "jump",
  },
  "<F": {
    symbol: "<F",
    description: "Under-rotated jump with Fall",
    category: "jump",
  },
  "<<F": {
    symbol: "<<F",
    description: "Downgraded jump with Fall",
    category: "jump",
  },
  "F!": {
    symbol: "F!",
    description: "Fall with unclear edge take-off",
    category: "jump",
  },
  Fe: {
    symbol: "Fe",
    description: "Fall with wrong edge take-off",
    category: "jump",
  },
  Feq: {
    symbol: "Feq",
    description: "Fall with wrong edge and quarter rotation issues",
    category: "jump",
  },
  Fq: {
    symbol: "Fq",
    description: "Fall with quarter rotation issues",
    category: "jump",
  },
  "F!q": {
    symbol: "F!q",
    description: "Fall with unclear edge and quarter rotation issues",
    category: "jump",
  },
  Fx: {
    symbol: "Fx",
    description: "Fall with invalid element execution",
    category: "general",
  },
  nC: {
    symbol: "nC",
    description: "No value - Combination does not meet requirements",
    category: "general",
  },
  nS: {
    symbol: "nS",
    description: "No value - Step Sequence does not meet minimum requirements",
    category: "step",
  },
  ns: {
    symbol: "ns",
    description: "No value - Step Sequence does not meet minimum requirements",
    category: "step",
  },
  nU: {
    symbol: "nU",
    description: "No value - Unclear element",
    category: "general",
  },
  nCnS: {
    symbol: "nCnS",
    description:
      "No value - Combination and Step Sequence requirements not met",
    category: "general",
  },
  nSF: {
    symbol: "nSF",
    description: "No value - Step Sequence with Fall",
    category: "step",
  },
  nUF: {
    symbol: "nUF",
    description: "No value - Unclear element with Fall",
    category: "general",
  },
};

// Helper function to get symbol description
export const getSymbolDescription = (symbol: string): string | undefined => {
  return ijsSymbols[symbol]?.description;
};

// Helper function to get full symbol info
export const getSymbolInfo = (symbol: string): IJSSymbol | undefined => {
  return ijsSymbols[symbol];
};
