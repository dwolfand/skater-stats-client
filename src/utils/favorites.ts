export type FavoriteType = "competition" | "event" | "skater";

// Base interface for all favorite items
interface BaseFavoriteItem {
  type: FavoriteType;
  id: string;
  name: string;
  version: number;
  url: string;
}

// Type-specific interfaces
interface CompetitionFavorite extends BaseFavoriteItem {
  type: "competition";
  params: {
    year: string;
    ijsId: string;
  };
}

interface EventFavorite extends BaseFavoriteItem {
  type: "event";
  params: {
    year: string;
    ijsId: string;
    eventId: string;
  };
}

interface SkaterFavorite extends BaseFavoriteItem {
  type: "skater";
  params: {
    name: string;
  };
}

export type FavoriteItem = CompetitionFavorite | EventFavorite | SkaterFavorite;

// Input types for adding favorites
interface BaseInput {
  type: FavoriteType;
  name: string;
}

interface CompetitionInput extends BaseInput {
  type: "competition";
  params: {
    year: string;
    ijsId: string;
  };
}

interface EventInput extends BaseInput {
  type: "event";
  params: {
    year: string;
    ijsId: string;
    eventId: string;
  };
}

interface SkaterInput extends BaseInput {
  type: "skater";
  params: {
    name: string;
  };
}

type FavoriteInput = CompetitionInput | EventInput | SkaterInput;

const FAVORITES_KEY = "skater-stats-favorites";
const CURRENT_VERSION = 1;

// Helper function to generate ID from params
function generateId<T extends FavoriteInput>(
  type: T["type"],
  params: T["params"]
): string {
  switch (type) {
    case "competition":
      return `${(params as CompetitionInput["params"]).year}-${
        (params as CompetitionInput["params"]).ijsId
      }`;
    case "event":
      return `${(params as EventInput["params"]).year}-${
        (params as EventInput["params"]).ijsId
      }-${(params as EventInput["params"]).eventId}`;
    case "skater":
      return (params as SkaterInput["params"]).name;
    default:
      const _exhaustiveCheck: never = type;
      throw new Error(`Unknown favorite type: ${type}`);
  }
}

// Helper function to build URL from params
function buildUrl(item: FavoriteItem | FavoriteInput): string {
  switch (item.type) {
    case "competition":
      return `/competition/${item.params.year}/${item.params.ijsId}`;
    case "event":
      return `/competition/${item.params.year}/${item.params.ijsId}/event/${item.params.eventId}`;
    case "skater":
      return `/skater/${encodeURIComponent(item.params.name)}`;
  }
}

// Helper function to convert old format to new format
function convertOldFormat(item: any): FavoriteItem {
  const base = {
    ...item,
    version: CURRENT_VERSION,
  };

  switch (item.type) {
    case "competition": {
      const [year, ijsId] = item.id.split("-");
      return {
        ...base,
        type: "competition",
        params: { year, ijsId },
      } as CompetitionFavorite;
    }
    case "event": {
      const [year, ijsId, eventId] = item.id.split("-");
      return {
        ...base,
        type: "event",
        params: { year, ijsId, eventId },
      } as EventFavorite;
    }
    case "skater": {
      return {
        ...base,
        type: "skater",
        params: { name: item.id },
      } as SkaterFavorite;
    }
    default:
      throw new Error(`Unknown favorite type: ${item.type}`);
  }
}

export function getFavorites(): FavoriteItem[] {
  const favoritesJson = localStorage.getItem(FAVORITES_KEY);
  const favorites = favoritesJson ? JSON.parse(favoritesJson) : [];

  // Handle version updates if needed
  return favorites.map((item: any) => {
    if (!item.version) {
      const newItem = convertOldFormat(item);
      newItem.url = buildUrl(newItem);
      return newItem;
    }
    return item;
  });
}

export function addFavorite(input: FavoriteInput) {
  const favorites = getFavorites();
  const id = generateId(input.type, input.params);
  if (!favorites.some((f) => f.type === input.type && f.id === id)) {
    const newItem: FavoriteItem = {
      ...input,
      id,
      version: CURRENT_VERSION,
      url: buildUrl(input),
    } as FavoriteItem;
    favorites.push(newItem);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(
  type: FavoriteType,
  params: FavoriteInput["params"]
) {
  const favorites = getFavorites();
  const id = generateId(type, params);
  const newFavorites = favorites.filter(
    (f) => !(f.type === type && f.id === id)
  );
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
}

export function isFavorite(
  type: FavoriteType,
  params: FavoriteInput["params"]
): boolean {
  const favorites = getFavorites();
  const id = generateId(type, params);
  return favorites.some((f) => f.type === type && f.id === id);
}
