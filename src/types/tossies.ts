/**
 * Tossie type definitions and helper functions
 */

export interface TossieTypeDefinition {
  emoji: string;
  title: string;
  description: string;
  rarity: number; // 1-10, where 10 is most common
}

// Here we define all the tossie types and their metadata
export const tossieTypeMap: Record<string, TossieTypeDefinition> = {
  // Encouragement & Motivation - Common
  "you-got-grit": {
    emoji: "💪",
    title: "You've Got Grit",
    description: "You don't quit. Even on rough days.",
    rarity: 8,
  },
  "clean-skate-energy": {
    emoji: "✨",
    title: "Clean Skate Energy",
    description: "Sending perfect program vibes.",
    rarity: 9,
  },
  "main-character": {
    emoji: "👑",
    title: "You're the Main Character",
    description: "This week's skate = your story arc.",
    rarity: 7,
  },

  // Humor & Whimsy - Medium
  "zamboni-zen": {
    emoji: "🧊",
    title: "Zamboni Zen",
    description: "A calming visual or skating-themed meditation.",
    rarity: 6,
  },
  "rink-rat": {
    emoji: "🐀",
    title: "Rink Rat",
    description: "You practically live there. Wear it with pride.",
    rarity: 7,
  },
  "coach-said-again": {
    emoji: "🔄",
    title: "Coach Said 'Again'",
    description: "Again. Again. Again. Again.",
    rarity: 8,
  },

  // Nostalgia + Personality - Medium
  "bedazzle-babe": {
    emoji: "💎",
    title: "Bedazzle Babe",
    description: "You get a little sparkle flair for your profile.",
    rarity: 6,
  },
  "tights-over-boots": {
    emoji: "🧦",
    title: "Tights Over Boots",
    description: "Controversial? Maybe. Cute? Always.",
    rarity: 7,
  },
  "first-competition": {
    emoji: "🔙",
    title: "First Competition Flashback",
    description: "A throwback surprise just for fun.",
    rarity: 5,
  },

  // Music + Artistic Inspo - Medium
  "program-idea": {
    emoji: "🎵",
    title: "Program Idea",
    description: "Random 30-second music clip to imagine choreo to.",
    rarity: 6,
  },
  drama: {
    emoji: "🎭",
    title: "Drama",
    description: "Your energy today: Phantom of the Rink.",
    rarity: 7,
  },
  "free-leg-flare": {
    emoji: "💃",
    title: "Free Leg Flare",
    description: "Inspired by Yebin or Brown? Add flair to your next edge.",
    rarity: 6,
  },

  // Recognition & Affirmation - Rare
  "golden-toe-pick": {
    emoji: "🏅",
    title: "Golden Toe Pick",
    description: "Rare collectible Tossie.",
    rarity: 2,
  },
  "get-back-up": {
    emoji: "👑",
    title: "Get Back Up Queen",
    description: "You bounced back stronger. This one's yours.",
    rarity: 3,
  },
  "fan-favorite": {
    emoji: "❤️",
    title: "Fan Favorite",
    description: "You've been spotted. Someone loves your vibe.",
    rarity: 4,
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
