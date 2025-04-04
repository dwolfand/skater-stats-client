import React, { useRef, useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
  Card,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { MapLocation, MapLocationType } from "../types/auth";

// Get Google Maps API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface SkaterMapDisplayProps {
  locations: MapLocation[];
  themeColors: {
    color?: string;
    fontFamily?: string;
    backgroundColor?: string;
    backgroundImage?: string;
  };
}

// Location type options with colors
const LOCATION_TYPES: {
  label: string;
  value: MapLocationType;
  color: string;
  badgeColor: string;
  emoji: string;
}[] = [
  {
    label: "Current City",
    value: "current",
    color: "#38A169", // green.500
    badgeColor: "green",
    emoji: "📍",
  },
  {
    label: "Home Town",
    value: "hometown",
    color: "#3182CE", // blue.500
    badgeColor: "blue",
    emoji: "🏠",
  },
  {
    label: "Training Location",
    value: "training",
    color: "#805AD5", // purple.500
    badgeColor: "purple",
    emoji: "⛸️",
  },
  {
    label: "Competition",
    value: "competition",
    color: "#DD6B20", // orange.500
    badgeColor: "orange",
    emoji: "🏆",
  },
  {
    label: "Performance",
    value: "performance",
    color: "#00B5D8", // cyan.500
    badgeColor: "cyan",
    emoji: "🎭",
  },
  {
    label: "Visited Rink",
    value: "visited",
    color: "#D53F8C", // pink.500
    badgeColor: "pink",
    emoji: "❄️",
  },
  {
    label: "Other",
    value: "other",
    color: "#718096", // gray.500
    badgeColor: "gray",
    emoji: "📌",
  },
];

// Get color for location type
function getColorForType(type: MapLocationType): string {
  const locationType = LOCATION_TYPES.find((t) => t.value === type);
  return locationType ? locationType.color : "#718096";
}

// Get label for location type
function getTypeLabel(type: MapLocationType): string {
  const locationType = LOCATION_TYPES.find((t) => t.value === type);
  return locationType ? locationType.label : "Other";
}

// Get icon for location type
function getIconForType(type: MapLocationType): React.ReactNode {
  const locationType = LOCATION_TYPES.find((t) => t.value === type);
  return locationType ? (
    <span style={{ fontSize: "1.2em" }}>{locationType.emoji}</span>
  ) : (
    <span style={{ fontSize: "1.2em" }}>📌</span>
  );
}

// Helper function to get the icon component name for a location type (used for marker creation)
function getIconComponentName(type: MapLocationType): string {
  switch (type) {
    case "current":
      return "FaLocationArrow";
    case "hometown":
      return "FaHome";
    case "training":
      return "FaSkating";
    case "competition":
      return "FaTrophy";
    case "performance":
      return "FaTheaterMasks";
    case "visited":
      return "FaIcicles";
    case "other":
    default:
      return "FaMapPin";
  }
}

// Get SVG path for each icon type
function getSvgPathForType(type: MapLocationType): string {
  switch (type) {
    case "current":
      return "M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"; // FaLocationArrow path
    case "hometown":
      return "M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z"; // FaHome path
    case "training":
      return "M427.314 96H288V16c0-8.837-7.163-16-16-16h-32c-8.837 0-16 7.163-16 16v80H84.686c-14.729 0-24.813 14.834-19.159 28.565L96 192h128v112H96l-30.473 67.435C60.186 385.166 70.271 400 85 400h160v64c0 17.673 14.327 32 32 32h32c17.673 0 32-14.327 32-32v-64h160c14.729 0 24.813-14.834 19.159-28.565L480 304H352V192h128l30.473-67.435C515.814 110.834 505.729 96 490.314 96zM352 416h-64v112a16 16 0 01-16 16h-32a16 16 0 01-16-16V416h-64a16 16 0 01-14.629-22.283L158.503 368h146.994l13.132 25.717A16 16 0 01304 416zm125.784-186.622L462.552 256H352V160h110.552l-15.232-26.622A8 8 0 00440 128H256V16c0-4.411-3.589-8-8-8h-16c-4.411 0-8 3.589-8 8v112H72a8 8 0 00-7.319 4.783L51.665 160h286.783l-10.624 22.266L320 192H192v80h128l-6.947 14.134L320 304h94.548l-15.232 26.622A8 8 0 01392 336H112a8 8 0 01-7.319-11.217l7.422-15.966L125.513 288l-12.261-24.533L100.413 240h89.793l-10.624-22.266L172.094 208 192 160h-14.315l-15.232-26.622a7.999 7.999 0 010-8.756l15.232-26.622A8 8 0 01184 96h256a8 8 0 017.32 4.783l15.232 26.622a8.001 8.001 0 010 8.751L477.784 229.378z"; // FaSkating path
    case "competition":
      return "M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 35.7 22.5 72.4 61.9 100.7 31.5 22.7 69.8 37.1 110 41.7C203.3 338.5 240 360 240 360v72h-48c-35.3 0-64 20.7-64 56v12c0 6.6 5.4 12 12 12h296c6.6 0 12-5.4 12-12v-12c0-35.3-28.7-56-64-56h-48v-72s36.7-21.5 68.1-73.6c40.3-4.6 78.6-19 110-41.7 39.3-28.3 61.9-65 61.9-100.7V88c0-13.3-10.7-24-24-24zM99.3 192.8C74.9 175.2 64 155.6 64 144v-16h64.2c1 32.6 5.8 61.2 12.8 86.2-15.1-5.2-29.2-12.4-41.7-21.4zM512 144c0 16.1-17.7 36.1-35.3 48.8-12.5 9-26.7 16.2-41.8 21.4 7-25 11.8-53.6 12.8-86.2H512v16z"; // FaTrophy path
    case "visited":
      return "M262.14 356V34.13c0-21.67-14.45-34.13-34.57-34.13C206.18 0 192 14.13 192 34.13V356a80.89 80.89 0 0 0-66.82 79.19c0 30.11 21.27 56.6 51.39 62.85a72 72 0 0 0 10.4.8 66.82 66.82 0 0 0 8-133.16V356zm80.65 102a66.82 66.82 0 0 0 8 133.16 72 72 0 0 0 10.4-.8c30.11-6.25 51.39-32.74 51.39-62.85A80.89 80.89 0 0 0 346.3 448v-10.82c0-21.67-14.45-34.13-34.57-34.13-20.75 0-34.93 14.13-34.93 34.13V458zM374.3 427v-10.87c0-38.58 30.39-69.26 68.3-69.26 37.59 0 68.3 30.68 68.3 69.26V427c19.93-6.7 34.1-25.8 34.1-48.06 0-28.096-22.8-50.9-50.9-50.9-6.92 0-13.55 1.37-19.59 3.86-9.27-31.22-37.95-36.05-37.95-36.05 0-22.95-19.53-42.86-42.79-42.86-23.16 0-42.8 19.91-42.8 42.86 0 0-28.68 4.83-37.95 36.05-6.04-2.49-12.67-3.86-19.59-3.86-28.1 0-50.9 22.8-50.9 50.9 0 22.26 14.17 41.36 34.09 48.06v-10.87c0-38.58 30.39-69.26 68.3-69.26 37.59 0 68.29 30.68 68.29 69.26zm-203.56 10c-20.75 0-34.93 14.13-34.93 34.13V458a67 67 0 0 0 69.86 0v-10.82c0-21.67-14.45-34.13-34.57-34.13-.12-.05-.24-.05-.36-.05z"; // FaIcicles path
    case "other":
    default:
      return "M288 0c-69.59 0-126 56.41-126 126 0 56.26 82.35 158.8 113.9 196.02 6.39 7.54 17.82 7.54 24.2 0C331.65 284.8 414 182.26 414 126 414 56.41 357.59 0 288 0zm0 168c-23.2 0-42-18.8-42-42s18.8-42 42-42 42 18.8 42 42-18.8 42-42 42z"; // FaMapPin path
  }
}

// Create SVG marker icon
function createSvgMarker(
  type: MapLocationType,
  isReadOnly: boolean = false
): google.maps.Icon {
  const color = getColorForType(type);

  // Create SVG with emoji centered using foreignObject for better alignment
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" fill="${color}" stroke="white" stroke-width="2" />
      <foreignObject x="2" y="2" width="36" height="36">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
          ${getEmojiForType(type)}
        </div>
      </foreignObject>
    </svg>
  `;

  // Use a larger marker for competition history markers to make them stand out
  const scale = isReadOnly ? 1.1 : 1.0;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(40 * scale, 40 * scale),
    anchor: new google.maps.Point(20 * scale, 20 * scale),
    origin: new google.maps.Point(0, 0),
  };
}

// Helper function to get emoji for location type
function getEmojiForType(type: MapLocationType): string {
  switch (type) {
    case "current":
      return "📍"; // Location arrow emoji
    case "hometown":
      return "🏠"; // Home emoji
    case "training":
      return "⛸️"; // Ice skate emoji
    case "competition":
      return "🏆"; // Trophy emoji
    case "performance":
      return "🎭"; // Theater masks emoji
    case "visited":
      return "❄️"; // Snowflake emoji
    case "other":
    default:
      return "📌"; // Pin emoji
  }
}

// Map component
const Map: React.FC<{
  center: google.maps.LatLngLiteral;
  zoom: number;
  markers: MapLocation[];
}> = ({ center, zoom, markers }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [mapMarkers, setMapMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);

  // Check if Google Maps API is loaded
  useEffect(() => {
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      setIsApiLoaded(true);
    } else {
      // Try again in 100ms
      const timer = setTimeout(() => {
        if (
          typeof window !== "undefined" &&
          window.google &&
          window.google.maps
        ) {
          setIsApiLoaded(true);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Initialize map once the API is loaded and the ref is available
  useEffect(() => {
    if (ref.current && !map && isApiLoaded) {
      try {
        const newMap = new window.google.maps.Map(ref.current, {
          center,
          zoom,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });
        setMap(newMap);
      } catch (error) {
        console.error("Error initializing Google Map:", error);
      }
    }
  }, [ref, map, center, zoom, isApiLoaded]);

  // Update markers when they change
  useEffect(() => {
    if (map && markers.length > 0 && isApiLoaded) {
      // Clear existing markers
      mapMarkers.forEach((marker) => marker.setMap(null));
      setMapMarkers([]);

      // Close existing info windows
      infoWindows.forEach((w) => w.close());
      setInfoWindows([]);

      const newMarkers: google.maps.Marker[] = [];
      const newInfoWindows: google.maps.InfoWindow[] = [];

      markers.forEach((location) => {
        // Create SVG marker icon
        const markerIcon = createSvgMarker(location.type, location.readOnly);

        // Set marker with icon
        const marker = new window.google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map,
          title: location.name,
          icon: markerIcon,
          zIndex: location.type === "current" ? 100 : 10, // Make current location appear on top
        });

        // Create info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h3 style="font-weight: bold; margin: 0 0 8px 0; font-size: 16px;">${
                location.name
              }</h3>
              <div style="margin-bottom: 4px;">
                ${getEmojiForType(location.type)} ${getTypeLabel(location.type)}
              </div>
              ${
                location.address
                  ? `<div style="margin-bottom: 4px; color: #4A5568; font-size: 14px;">${location.address}</div>`
                  : ""
              }
              ${
                location.description
                  ? `<div style="font-style: italic; color: #4A5568; font-size: 14px;">"${location.description}"</div>`
                  : ""
              }
            </div>
          `,
        });

        newInfoWindows.push(infoWindow);

        // Add click listener
        marker.addListener("click", () => {
          // Close all open info windows
          newInfoWindows.forEach((w) => w.close());

          // Open this info window
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
      });

      // Fit map to bounds if we have locations
      if (newMarkers.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        newMarkers.forEach((marker) =>
          bounds.extend(marker.getPosition() as google.maps.LatLng)
        );
        map.fitBounds(bounds);

        // Don't zoom in too far on single marker
        const listener = window.google.maps.event.addListener(
          map,
          "idle",
          () => {
            const currentZoom = map.getZoom();
            if (currentZoom !== undefined && currentZoom > 12) {
              map.setZoom(12);
            }
            window.google.maps.event.removeListener(listener);
          }
        );
      }

      setMapMarkers(newMarkers);
      setInfoWindows(newInfoWindows);
    }
  }, [map, markers, isApiLoaded]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "400px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    />
  );
};

const SkaterMapDisplay: React.FC<SkaterMapDisplayProps> = ({
  locations,
  themeColors = {
    color: "",
    fontFamily: "",
    backgroundColor: "",
    backgroundImage: "",
  },
}) => {
  // Only show if we have locations
  if (!locations || locations.length === 0) return null;

  // Check if Google Maps API key is available
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Card
        p={6}
        mb={6}
        bg="white"
        fontFamily={themeColors.fontFamily}
        borderWidth="0"
      >
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <AlertDescription>
            Google Maps API key is missing. Please add VITE_GOOGLE_MAPS_API_KEY
            to your environment variables.
            <br />
            <br />
            Create a .env file in the project root with:
            <br />
            <code>VITE_GOOGLE_MAPS_API_KEY=your_api_key_here</code>
            <br />
            <br />
            Make sure your API key has the following APIs enabled:
            <ul>
              <li>Maps JavaScript API</li>
              <li>Places API</li>
              <li>Geocoding API</li>
            </ul>
            And add <code>http://localhost:3000/*</code> to the allowed
            referrers.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  // Calculate map center from all locations
  const getMapCenter = (): google.maps.LatLngLiteral => {
    const sumLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
    const sumLng = locations.reduce((sum, loc) => sum + loc.lng, 0);
    return {
      lat: sumLat / locations.length,
      lng: sumLng / locations.length,
    };
  };

  // Count by location type
  const locationCounts = LOCATION_TYPES.map((type) => {
    const count = locations.filter((loc) => loc.type === type.value).length;
    return {
      ...type,
      count,
    };
  }).filter((type) => type.count > 0);

  // Create a render function to handle different loading states
  const render = (status: Status): React.ReactElement => {
    switch (status) {
      case Status.LOADING:
        return (
          <Box
            height="400px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="md"
            bg="gray.50"
          >
            <VStack>
              <Spinner size="xl" color="blue.500" />
              <Text>Loading maps...</Text>
            </VStack>
          </Box>
        );
      case Status.FAILURE:
        return (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertDescription>
              Failed to load Google Maps. Please check your API key and internet
              connection.
            </AlertDescription>
          </Alert>
        );
      case Status.SUCCESS:
        return <Map center={getMapCenter()} zoom={4} markers={locations} />;
      default:
        return <Box>Unexpected status: {status}</Box>;
    }
  };

  return (
    <Card
      p={6}
      mb={6}
      bg="white"
      fontFamily={themeColors.fontFamily || undefined}
      borderWidth="0"
    >
      <VStack spacing={4} align="stretch">
        <Heading
          size="sm"
          mb={2}
          fontFamily={themeColors.fontFamily || undefined}
        >
          Skating Map
        </Heading>

        {/* Location type legend */}
        <HStack wrap="wrap" spacing={2} mb={2}>
          {locationCounts.map((type) => (
            <Badge
              key={type.value}
              colorScheme={type.badgeColor}
              variant="solid"
              py={1}
              px={2}
            >
              <span style={{ color: "white" }}>
                {type.emoji} {type.label}: {type.count}
              </span>
            </Badge>
          ))}
        </HStack>

        {/* Map */}
        <Box borderRadius="md" overflow="hidden">
          <Wrapper
            apiKey={GOOGLE_MAPS_API_KEY}
            libraries={["places"]}
            render={render}
          />
        </Box>
      </VStack>
    </Card>
  );
};

export default SkaterMapDisplay;
