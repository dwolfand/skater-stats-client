import React from "react";
import { IconButton, Icon, Tooltip, useToast } from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import {
  FavoriteType,
  addFavorite,
  removeFavorite,
  isFavorite,
} from "../utils/favorites";
import { FAVORITES_UPDATED_EVENT } from "./FavoritesMenu";
import { trackFavoriteAction } from "../utils/analytics";

interface BaseFavoriteButtonProps {
  type: FavoriteType;
  name: string;
}

interface CompetitionButtonProps extends BaseFavoriteButtonProps {
  type: "competition";
  params: {
    year: string;
    ijsId: string;
  };
}

interface EventButtonProps extends BaseFavoriteButtonProps {
  type: "event";
  params: {
    year: string;
    ijsId: string;
    eventId: string;
  };
}

interface SkaterButtonProps extends BaseFavoriteButtonProps {
  type: "skater";
  params: {
    name?: string;
    skaterId?: number;
  };
}

type FavoriteButtonProps =
  | CompetitionButtonProps
  | EventButtonProps
  | SkaterButtonProps;

export default function FavoriteButton(props: FavoriteButtonProps) {
  const { type, name, params } = props;
  const toast = useToast();
  const [isActive, setIsActive] = React.useState(() =>
    isFavorite(type, params)
  );

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isActive) {
      removeFavorite(type, params);
      trackFavoriteAction("remove", type, name);
      toast({
        title: "Removed from favorites",
        description: `${name} has been removed from your favorites`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      switch (type) {
        case "competition":
          addFavorite({
            type: "competition",
            name,
            params: params as CompetitionButtonProps["params"],
          });
          break;
        case "event":
          addFavorite({
            type: "event",
            name,
            params: params as EventButtonProps["params"],
          });
          break;
        case "skater":
          addFavorite({
            type: "skater",
            name,
            params: params as SkaterButtonProps["params"],
          });
          break;
      }
      trackFavoriteAction("add", type, name);
      toast({
        title: "Added to favorites",
        description: `${name} has been added to your favorites`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    setIsActive(!isActive);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
  };

  return (
    <Tooltip label={isActive ? "Remove from favorites" : "Add to favorites"}>
      <IconButton
        aria-label="Toggle favorite"
        icon={
          <Icon as={StarIcon} color={isActive ? "yellow.400" : "gray.300"} />
        }
        variant="ghost"
        onClick={handleToggle}
        _hover={{ bg: "transparent" }}
      />
    </Tooltip>
  );
}
