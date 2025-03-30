/**
 * Tossie type definitions and helper functions
 */

export interface TossieTypeDefinition {
  emoji: string;
  title: string;
  description: string;
  rarity: number; // 1-10, where 10 is most common
  category?: string; // Added category field
}

// Tossie categories
export const TOSSIE_CATEGORIES = {
  INNER_DRIVE: "Inner Drive",
  RINK_CULTURE: "Rink Culture",
  SKATER_ORIGINS: "Skater Origins",
  ARTISTRY_EDGE: "Artistry & Edge",
  HIGHLIGHTS: "The Highlights",
};

// Here we define all the tossie types and their metadata
export const tossieTypeMap: Record<string, TossieTypeDefinition> = {
  // Inner Drive - For the resilience, mindset, and magic that moves you forward
  "you-got-grit": {
    emoji: "💪",
    title: "You've Got Grit",
    description: "You don't quit. Even on rough days.",
    rarity: 8,
    category: TOSSIE_CATEGORIES.INNER_DRIVE,
  },
  "clean-skate-energy": {
    emoji: "✨",
    title: "Clean Skate Energy",
    description: "Sending perfect program vibes.",
    rarity: 9,
    category: TOSSIE_CATEGORIES.INNER_DRIVE,
  },
  "main-character": {
    emoji: "👑",
    title: "You're the Main Character",
    description: "This week's skate = your story arc.",
    rarity: 7,
    category: TOSSIE_CATEGORIES.INNER_DRIVE,
  },

  // Rink Culture - The shared chaos, charm, and jokes only skaters understand
  "zamboni-zen": {
    emoji: "🧊",
    title: "Zamboni Zen",
    description: "A calming visual or skating-themed meditation.",
    rarity: 6,
    category: TOSSIE_CATEGORIES.RINK_CULTURE,
  },
  "rink-rat": {
    emoji: "🐀",
    title: "Rink Rat",
    description: "You practically live there. Wear it with pride.",
    rarity: 7,
    category: TOSSIE_CATEGORIES.RINK_CULTURE,
  },
  "coach-said-again": {
    emoji: "🔄",
    title: "Coach Said 'Again'",
    description: "Again. Again. Again. Again.",
    rarity: 8,
    category: TOSSIE_CATEGORIES.RINK_CULTURE,
  },

  // Skater Origins - Your journey, quirks, and iconic firsts—all here
  "bedazzle-babe": {
    emoji: "💎",
    title: "Bedazzle Babe",
    description: "You get a little sparkle flair for your profile.",
    rarity: 6,
    category: TOSSIE_CATEGORIES.SKATER_ORIGINS,
  },
  "tights-over-boots": {
    emoji: "🧦",
    title: "Tights Over Boots",
    description: "Controversial? Maybe. Classic? Absolutely.",
    rarity: 7,
    category: TOSSIE_CATEGORIES.SKATER_ORIGINS,
  },
  "first-competition": {
    emoji: "🔙",
    title: "First Competition Flashback",
    description: "A throwback surprise just for fun.",
    rarity: 5,
    category: TOSSIE_CATEGORIES.SKATER_ORIGINS,
  },

  // Artistry & Edge - Where music meets movement—and your style takes the lead
  "program-idea": {
    emoji: "🎵",
    title: "Program Idea",
    description: "Random 30-second music clip to imagine choreo to.",
    rarity: 6,
    category: TOSSIE_CATEGORIES.ARTISTRY_EDGE,
  },
  drama: {
    emoji: "🎭",
    title: "Drama",
    description: "Your energy today: Phantom of the Rink.",
    rarity: 7,
    category: TOSSIE_CATEGORIES.ARTISTRY_EDGE,
  },
  "free-leg-flare": {
    emoji: "💃",
    title: "Free Leg Flare",
    description: "Inspired by Yebin or Brown? Add flair to your next edge.",
    rarity: 6,
    category: TOSSIE_CATEGORIES.ARTISTRY_EDGE,
  },

  // The Highlights - Collected wins, memorable moments, and your spark seen by others
  "golden-toe-pick": {
    emoji: "🏅",
    title: "Golden Toe Pick",
    description: "Rare collectible Tossie.",
    rarity: 2,
    category: TOSSIE_CATEGORIES.HIGHLIGHTS,
  },
  "get-back-up": {
    emoji: "👑",
    title: "Get Back Up Queen",
    description: "You bounced back stronger. This one's yours.",
    rarity: 3,
    category: TOSSIE_CATEGORIES.HIGHLIGHTS,
  },
  "fan-favorite": {
    emoji: "❤️",
    title: "Fan Favorite",
    description: "You've been spotted. Someone loves your vibe.",
    rarity: 4,
    category: TOSSIE_CATEGORIES.HIGHLIGHTS,
  },
};

// Default tossie for unknown types
export const defaultTossie: TossieTypeDefinition = {
  emoji: "🎁",
  title: "Mystery Tossie",
  description: "What could it be?",
  rarity: 5,
};

/**
 * Get category emoji and description
 * @returns Object with emoji and description for each category
 */
export const getCategoryInfo = (): Record<
  string,
  { emoji: string; description: string }
> => {
  return {
    [TOSSIE_CATEGORIES.INNER_DRIVE]: {
      emoji: "💪",
      description:
        "For the resilience, mindset, and magic that moves you forward.",
    },
    [TOSSIE_CATEGORIES.RINK_CULTURE]: {
      emoji: "🧊",
      description:
        "The shared chaos, charm, and jokes only skaters understand.",
    },
    [TOSSIE_CATEGORIES.SKATER_ORIGINS]: {
      emoji: "🗂️",
      description: "Your journey, quirks, and iconic firsts—all here.",
    },
    [TOSSIE_CATEGORIES.ARTISTRY_EDGE]: {
      emoji: "🎭",
      description: "Where music meets movement—and your style takes the lead.",
    },
    [TOSSIE_CATEGORIES.HIGHLIGHTS]: {
      emoji: "✨",
      description:
        "Collected wins, memorable moments, and your spark seen by others.",
    },
  };
};

/**
 * Get rarity label and color based on rarity score
 * @param rarity - Rarity score (1-10)
 * @returns Object with label and color
 */
export const getRarityLabel = (
  rarity: number
): { label: string; color: string } => {
  if (rarity >= 8) return { label: "Common", color: "gray.500" };
  if (rarity >= 5) return { label: "Uncommon", color: "green.500" };
  if (rarity >= 3) return { label: "Rare", color: "blue.500" };
  return { label: "Ultra Rare", color: "purple.500" };
};

/**
 * Get a TossieTypeDefinition by its ID
 * @param tossieType - Type ID
 * @returns The tossie definition or default if not found
 */
export const getTossieInfo = (tossieType?: string): TossieTypeDefinition => {
  if (!tossieType) return defaultTossie;
  return tossieTypeMap[tossieType] || defaultTossie;
};

/**
 * Get tossie notification message based on the number of unopened tossies
 * @param count Number of unopened tossies
 * @returns Message string
 */
export const getTossieNotificationMessage = (count: number): string => {
  if (count === 1) {
    return "You've received a tossie! Open it to discover what special type you got - maybe even a rare one!";
  } else if (count <= 3) {
    return `You have ${count} unopened tossies waiting for you! Who knows what rare surprises might be inside?`;
  } else {
    return `Wow! You have ${count} unopened tossies! You might find some ultra-rare collectibles among them!`;
  }
};
