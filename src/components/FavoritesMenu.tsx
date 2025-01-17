import React from "react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
  Icon,
  Badge,
  Box,
  HStack,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { Link as RouterLink } from "react-router-dom";
import { getFavorites, FavoriteItem } from "../utils/favorites";

// Create a custom event for favorite updates
export const FAVORITES_UPDATED_EVENT = "favoritesUpdated";

const TYPE_COLORS = {
  competition: "brand",
  event: "purple",
  skater: "accent",
} as const;

export default function FavoritesMenu() {
  const [favorites, setFavorites] = React.useState<FavoriteItem[]>([]);

  const loadFavorites = React.useCallback(() => {
    try {
      setFavorites(getFavorites());
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]);
    }
  }, []);

  React.useEffect(() => {
    loadFavorites();

    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "skater-stats-favorites") {
        loadFavorites();
      }
    };

    // Listen for favorite updates within the same window
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        FAVORITES_UPDATED_EVENT,
        handleFavoritesUpdate
      );
    };
  }, [loadFavorites]);

  return (
    <Menu onOpen={loadFavorites}>
      <MenuButton
        as={IconButton}
        aria-label="Favorites"
        icon={
          <Icon
            as={StarIcon}
            color={favorites.length > 0 ? "yellow.400" : "gray.300"}
          />
        }
        variant="ghost"
      />
      <MenuList
        maxH="400px"
        overflowY="auto"
        zIndex={1400}
        w={{ base: "calc(100vw - 32px)", md: "auto" }}
        minW={{ base: "calc(100vw - 32px)", md: "320px" }}
        maxW={{ base: "calc(100vw - 32px)", md: "400px" }}
      >
        {favorites.length === 0 ? (
          <Text px={3} py={2} color="gray.500">
            No favorites yet
          </Text>
        ) : (
          favorites.map((item) => (
            <MenuItem
              key={`${item.type}-${item.id}`}
              as={RouterLink}
              to={item.url}
            >
              <HStack spacing={2} width="100%" justify="space-between" minW={0}>
                <Text noOfLines={1} flex="1">
                  {item.name}
                </Text>
                <Badge flexShrink={0} colorScheme={TYPE_COLORS[item.type]}>
                  {item.type}
                </Badge>
              </HStack>
            </MenuItem>
          ))
        )}
      </MenuList>
    </Menu>
  );
}
