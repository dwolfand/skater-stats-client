import React, { useState, useEffect } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  Box,
  IconButton,
  Image,
  Button,
  useToast,
  Select,
  HStack,
  Text,
  useColorModeValue,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Portal,
  Badge,
  Card,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
  Switch,
  FormHelperText,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FaInstagram,
  FaTwitter,
  FaTiktok,
  FaYoutube,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { HexColorPicker } from "react-colorful";
import { ProfileCustomization, ImageData, MapLocation } from "../types/auth";
import { handleImageUpload } from "../api/auth";
import { api, changeSkaterClub } from "../api/client";
import {
  getImageUrl,
  getThumbnailUrl,
  flagRecentlyUploaded,
} from "../utils/images";
import ProfileMapSection from "./ProfileMapSection";
import { AddIcon } from "@chakra-ui/icons";

interface UploadingImageState {
  type: "profile" | "cover" | "gallery";
  index?: number;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface Club {
  id: number;
  name: string;
}

interface ProfileCustomizationSectionProps {
  initialCustomization?: ProfileCustomization;
  onSave: (customization: ProfileCustomization) => Promise<void>;
  clubHistory?: Club[];
  currentClub?: string;
  competitionLocations?: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: string;
    description?: string;
  }>;
}

const FONT_OPTIONS = [
  { label: "Default", value: "" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Lato", value: "'Lato', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
];

export const ProfileCustomizationSection: React.FC<
  ProfileCustomizationSectionProps
> = ({
  initialCustomization = {},
  onSave,
  clubHistory = [],
  currentClub,
  competitionLocations = [],
}) => {
  const [customization, setCustomization] = useState<ProfileCustomization>(
    initialCustomization || {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState<UploadingImageState | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string>("");
  const [changingClub, setChangingClub] = useState(false);
  const toast = useToast();

  const handleClubChange = async () => {
    if (!selectedClubId) return;

    setChangingClub(true);
    try {
      await changeSkaterClub(selectedClubId);
      toast({
        title: "Club updated successfully!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to update club",
        description: "Please try again later",
        status: "error",
        duration: 3000,
      });
    } finally {
      setChangingClub(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(customization);
      toast({
        title: "Profile customization saved!",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Failed to save customization",
        description: "Please try again later",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUploadChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "cover" | "gallery",
    index?: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        status: "error",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        status: "error",
      });
      return;
    }

    setUploadingImage({ type, index });
    try {
      const { fileUrl, thumbnailUrls } = await handleImageUpload(file, type);

      // Flag the image as recently uploaded so we use the original URL while thumbnails generate
      flagRecentlyUploaded(fileUrl);

      const imageData: ImageData = {
        url: fileUrl,
        thumbnails: thumbnailUrls,
      };

      let updatedCustomization = { ...customization };

      if (type === "gallery") {
        // When updating gallery images, make a fresh copy of the array
        const galleryImages = [...(customization.galleryImages || [])];

        // If updating an existing image (edit mode)
        if (
          typeof index === "number" &&
          index >= 0 &&
          index < galleryImages.length
        ) {
          galleryImages[index] = imageData;
        } else {
          // Otherwise add a new image
          galleryImages.push(imageData);
        }

        updatedCustomization = {
          ...customization,
          galleryImages,
        };

        setCustomization(updatedCustomization);
      } else {
        updatedCustomization = {
          ...customization,
          [type === "profile" ? "profileImage" : "coverImage"]: imageData,
        };

        setCustomization(updatedCustomization);
      }

      toast({
        title: "Image uploaded successfully",
        status: "success",
      });

      // Auto-save after successful upload
      try {
        toast({
          title: "Saving your profile...",
          status: "info",
          duration: 2000,
        });

        await onSave(updatedCustomization);

        toast({
          title: "Profile saved successfully!",
          status: "success",
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Image uploaded but couldn't auto-save",
          description: "Your changes will be saved when you click Save Changes",
          status: "warning",
          duration: 5000,
        });
      }
    } catch (error) {
      toast({
        title: "Failed to upload image",
        description: "Please try again later",
        status: "error",
      });
    } finally {
      setUploadingImage(null);
    }
  };

  return (
    <Card p={{ base: 3, md: 6 }} borderWidth="0">
      <VStack spacing={6} align="stretch">
        <Accordion allowMultiple>
          {/* Theme Section */}
          <AccordionItem border={0}>
            <h2>
              <AccordionButton
                py={3}
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
              >
                <Box as="span" flex="1" textAlign="left" fontWeight="medium">
                  Theme & Colors
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Accent Color</FormLabel>
                  <HStack>
                    <Popover placement="right">
                      <PopoverTrigger>
                        <Button
                          h="40px"
                          w="40px"
                          p={0}
                          backgroundColor={
                            customization.accentColor || "#000000"
                          }
                          border="1px solid"
                          borderColor="gray.200"
                          _hover={{ borderColor: "gray.300" }}
                        />
                      </PopoverTrigger>
                      <Portal>
                        <PopoverContent w="auto" border="none">
                          <PopoverBody p={0}>
                            <HexColorPicker
                              color={customization.accentColor || "#000000"}
                              onChange={(color) =>
                                setCustomization({
                                  ...customization,
                                  accentColor: color,
                                })
                              }
                            />
                          </PopoverBody>
                        </PopoverContent>
                      </Portal>
                    </Popover>
                    <Button
                      size="sm"
                      onClick={() =>
                        setCustomization({
                          ...customization,
                          accentColor: undefined,
                        })
                      }
                    >
                      Reset
                    </Button>
                  </HStack>
                </FormControl>

                <FormControl>
                  <FormLabel>Background</FormLabel>
                  <HStack mb={2}>
                    <Button
                      size="sm"
                      colorScheme={
                        !customization.backgroundGradient ? "blue" : "gray"
                      }
                      onClick={() => {
                        // Switch to solid background mode
                        if (customization.backgroundGradient) {
                          setCustomization({
                            ...customization,
                            backgroundGradient: undefined,
                          });
                        }
                      }}
                    >
                      Solid Color
                    </Button>
                    <Button
                      size="sm"
                      colorScheme={
                        customization.backgroundGradient ? "blue" : "gray"
                      }
                      onClick={() => {
                        // Switch to gradient mode if not already
                        if (!customization.backgroundGradient) {
                          setCustomization({
                            ...customization,
                            backgroundGradient: {
                              colors: [
                                {
                                  color:
                                    customization.backgroundColor || "#FFFFFF",
                                  position: 0,
                                },
                                { color: "#E0E0E0", position: 100 },
                              ],
                              direction: "to bottom",
                            },
                          });
                        }
                      }}
                    >
                      Gradient
                    </Button>
                  </HStack>

                  {/* Solid Background Color Picker */}
                  {!customization.backgroundGradient && (
                    <HStack>
                      <Popover placement="right">
                        <PopoverTrigger>
                          <Button
                            h="40px"
                            w="40px"
                            p={0}
                            backgroundColor={
                              customization.backgroundColor || "#FFFFFF"
                            }
                            border="1px solid"
                            borderColor="gray.200"
                            _hover={{ borderColor: "gray.300" }}
                          />
                        </PopoverTrigger>
                        <Portal>
                          <PopoverContent w="auto" border="none">
                            <PopoverBody p={0}>
                              <HexColorPicker
                                color={
                                  customization.backgroundColor || "#FFFFFF"
                                }
                                onChange={(color) =>
                                  setCustomization({
                                    ...customization,
                                    backgroundColor: color,
                                  })
                                }
                              />
                            </PopoverBody>
                          </PopoverContent>
                        </Portal>
                      </Popover>
                      <Button
                        size="sm"
                        onClick={() =>
                          setCustomization({
                            ...customization,
                            backgroundColor: undefined,
                          })
                        }
                      >
                        Reset
                      </Button>
                    </HStack>
                  )}

                  {/* Gradient Background Controls */}
                  {customization.backgroundGradient && (
                    <VStack spacing={3} align="stretch">
                      {/* Colors */}
                      <FormLabel fontSize="sm">Gradient Colors</FormLabel>
                      {customization.backgroundGradient.colors.map(
                        (colorItem, index) => (
                          <HStack key={index} spacing={3} alignItems="flex-end">
                            <Box>
                              <FormLabel fontSize="xs">
                                Color {index + 1}
                              </FormLabel>
                              <Popover placement="right">
                                <PopoverTrigger>
                                  <Button
                                    h="40px"
                                    w="40px"
                                    p={0}
                                    backgroundColor={colorItem.color}
                                    border="1px solid"
                                    borderColor="gray.200"
                                    _hover={{ borderColor: "gray.300" }}
                                  />
                                </PopoverTrigger>
                                <Portal>
                                  <PopoverContent w="auto" border="none">
                                    <PopoverBody p={0}>
                                      <HexColorPicker
                                        color={colorItem.color}
                                        onChange={(color) => {
                                          const newColors = [
                                            ...customization.backgroundGradient!
                                              .colors,
                                          ];
                                          newColors[index] = {
                                            ...newColors[index],
                                            color,
                                          };
                                          setCustomization({
                                            ...customization,
                                            backgroundGradient: {
                                              ...customization.backgroundGradient!,
                                              colors: newColors,
                                            },
                                          });
                                        }}
                                      />
                                    </PopoverBody>
                                  </PopoverContent>
                                </Portal>
                              </Popover>
                            </Box>

                            <Box flex="1">
                              <FormLabel fontSize="xs">Position %</FormLabel>
                              <Input
                                size="sm"
                                type="number"
                                min="0"
                                max="100"
                                value={
                                  colorItem.position ??
                                  (index === 0
                                    ? 0
                                    : index ===
                                      customization.backgroundGradient.colors
                                        .length -
                                        1
                                    ? 100
                                    : 50)
                                }
                                onChange={(e) => {
                                  const position = Math.min(
                                    100,
                                    Math.max(0, parseInt(e.target.value) || 0)
                                  );
                                  const newColors = [
                                    ...customization.backgroundGradient!.colors,
                                  ];
                                  newColors[index] = {
                                    ...newColors[index],
                                    position,
                                  };
                                  setCustomization({
                                    ...customization,
                                    backgroundGradient: {
                                      ...customization.backgroundGradient!,
                                      colors: newColors,
                                    },
                                  });
                                }}
                              />
                            </Box>

                            <IconButton
                              aria-label="Remove color"
                              icon={<FaTrash />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              isDisabled={
                                customization.backgroundGradient.colors
                                  .length <= 2
                              }
                              onClick={() => {
                                if (
                                  customization.backgroundGradient!.colors
                                    .length <= 2
                                )
                                  return;

                                const newColors = [
                                  ...customization.backgroundGradient!.colors,
                                ];
                                newColors.splice(index, 1);
                                setCustomization({
                                  ...customization,
                                  backgroundGradient: {
                                    ...customization.backgroundGradient!,
                                    colors: newColors,
                                  },
                                });
                              }}
                            />
                          </HStack>
                        )
                      )}

                      <Button
                        size="sm"
                        leftIcon={<AddIcon />}
                        onClick={() => {
                          const existingColors =
                            customization.backgroundGradient!.colors;
                          const lastPosition =
                            existingColors[existingColors.length - 1]
                              .position ?? 100;
                          const secondLastPosition =
                            existingColors.length > 1
                              ? existingColors[existingColors.length - 2]
                                  .position ?? 50
                              : 0;

                          // Calculate position for new color between the last two colors
                          const newPosition =
                            secondLastPosition +
                            (lastPosition - secondLastPosition) / 2;

                          // Calculate a color midway between the last two colors
                          const lastColor =
                            existingColors[existingColors.length - 1].color;

                          setCustomization({
                            ...customization,
                            backgroundGradient: {
                              ...customization.backgroundGradient!,
                              colors: [
                                ...existingColors.slice(0, -1),
                                {
                                  color: "#AAAAAA",
                                  position: Math.round(newPosition),
                                },
                                existingColors[existingColors.length - 1],
                              ],
                            },
                          });
                        }}
                      >
                        Add Color Stop
                      </Button>

                      <FormControl>
                        <FormLabel fontSize="sm">Direction</FormLabel>
                        <Select
                          value={
                            customization.backgroundGradient.direction ||
                            "to bottom"
                          }
                          onChange={(e) =>
                            setCustomization({
                              ...customization,
                              backgroundGradient: {
                                ...customization.backgroundGradient!,
                                direction: e.target.value,
                              },
                            })
                          }
                        >
                          <option value="to bottom">Top to Bottom</option>
                          <option value="to right">Left to Right</option>
                          <option value="to bottom right">Diagonal (↘)</option>
                          <option value="to bottom left">Diagonal (↙)</option>
                          <option value="to top">Bottom to Top</option>
                          <option value="to left">Right to Left</option>
                          <option value="to top right">Diagonal (↗)</option>
                          <option value="to top left">Diagonal (↖)</option>
                        </Select>
                      </FormControl>

                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() =>
                          setCustomization({
                            ...customization,
                            backgroundGradient: undefined,
                          })
                        }
                      >
                        Remove Gradient
                      </Button>

                      {/* Gradient Preview */}
                      <Box
                        h="60px"
                        borderRadius="md"
                        borderWidth="1px"
                        borderColor="gray.200"
                        backgroundImage={`linear-gradient(${
                          customization.backgroundGradient.direction ||
                          "to bottom"
                        }, ${customization.backgroundGradient.colors
                          .sort(
                            (a, b) => (a.position ?? 0) - (b.position ?? 100)
                          )
                          .map(
                            (c) =>
                              `${c.color} ${
                                c.position !== undefined ? c.position + "%" : ""
                              }`
                          )
                          .join(", ")})`}
                      />
                    </VStack>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel>Font Style</FormLabel>
                  <Select
                    value={customization.fontFamily}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        fontFamily: e.target.value,
                      })
                    }
                  >
                    {FONT_OPTIONS.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </Select>
                  <Box mt={2} p={4} bg="gray.50" borderRadius="md">
                    <Text
                      fontFamily={customization.fontFamily || "inherit"}
                      fontSize="lg"
                    >
                      The quick brown fox jumps over the lazy dog
                    </Text>
                    <Text
                      fontFamily={customization.fontFamily || "inherit"}
                      fontSize="md"
                      mt={2}
                    >
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                      <br />
                      abcdefghijklmnopqrstuvwxyz
                      <br />
                      0123456789
                    </Text>
                  </Box>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Personal Info Section */}
          <AccordionItem border={0}>
            <h2>
              <AccordionButton
                py={3}
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
              >
                <Box as="span" flex="1" textAlign="left" fontWeight="medium">
                  Personal Info
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Bio</FormLabel>
                  <Textarea
                    value={customization.bio}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        bio: e.target.value,
                      })
                    }
                    placeholder="Tell us about yourself..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Favorite Quote</FormLabel>
                  <Input
                    value={customization.favoriteQuote}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        favoriteQuote: e.target.value,
                      })
                    }
                    placeholder="Share an inspirational quote..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Social Media Links</FormLabel>
                  <VStack spacing={2}>
                    <HStack>
                      <FaInstagram />
                      <Input
                        value={customization.socialLinks?.instagram}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            socialLinks: {
                              ...customization.socialLinks,
                              instagram: e.target.value,
                            },
                          })
                        }
                        placeholder="Instagram username"
                      />
                    </HStack>
                    <HStack>
                      <FaTiktok />
                      <Input
                        value={customization.socialLinks?.tiktok}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            socialLinks: {
                              ...customization.socialLinks,
                              tiktok: e.target.value,
                            },
                          })
                        }
                        placeholder="TikTok username"
                      />
                    </HStack>
                    <HStack>
                      <FaYoutube />
                      <Input
                        value={customization.socialLinks?.youtube}
                        onChange={(e) =>
                          setCustomization({
                            ...customization,
                            socialLinks: {
                              ...customization.socialLinks,
                              youtube: e.target.value,
                            },
                          })
                        }
                        placeholder="YouTube channel URL"
                      />
                    </HStack>
                  </VStack>
                </FormControl>

                <Divider my={4} />

                <Box>
                  <FormControl>
                    <FormLabel>Current Skating Club</FormLabel>
                    <HStack spacing={4}>
                      <Select
                        placeholder="Select club"
                        value={selectedClubId || ""}
                        onChange={(e) => setSelectedClubId(e.target.value)}
                        isDisabled={!clubHistory?.length}
                      >
                        {clubHistory.map((club) => (
                          <option key={club.id} value={club.id}>
                            {club.name}
                          </option>
                        ))}
                      </Select>
                      <Button
                        colorScheme="blue"
                        onClick={handleClubChange}
                        isLoading={changingClub}
                        isDisabled={!selectedClubId || changingClub}
                      >
                        Change Club
                      </Button>
                    </HStack>
                    <FormHelperText>
                      {currentClub ? (
                        <>Current club: {currentClub}</>
                      ) : clubHistory?.length ? (
                        "Select from clubs in your competition history"
                      ) : (
                        "No competition history available"
                      )}
                    </FormHelperText>
                  </FormControl>
                </Box>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Skating Info Section */}
          <AccordionItem border={0}>
            <h2>
              <AccordionButton
                py={3}
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
              >
                <Box as="span" flex="1" textAlign="left" fontWeight="medium">
                  Skating Info
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Coach</FormLabel>
                  <Input
                    value={customization.coach}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        coach: e.target.value,
                      })
                    }
                    placeholder="Your current coach..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Home Rink</FormLabel>
                  <Input
                    value={customization.homeRink}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        homeRink: e.target.value,
                      })
                    }
                    placeholder="Your home rink..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Goals</FormLabel>
                  <Textarea
                    value={customization.goals}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        goals: e.target.value,
                      })
                    }
                    placeholder="Share your skating goals..."
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="can-be-featured" mb="0">
                    Featured Profile
                  </FormLabel>
                  <Switch
                    id="can-be-featured"
                    isChecked={customization.canBeFeatured}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        canBeFeatured: e.target.checked,
                      })
                    }
                  />
                  <FormHelperText ml={2}>
                    Can we feature your profile on the homepage?
                  </FormHelperText>
                </FormControl>

                <FormControl>
                  <FormLabel>Achievements</FormLabel>
                  <VStack spacing={2}>
                    {(customization.achievements || []).map(
                      (achievement, index) => (
                        <HStack key={index}>
                          <Input
                            value={achievement}
                            onChange={(e) => {
                              const newAchievements = [
                                ...(customization.achievements || []),
                              ];
                              newAchievements[index] = e.target.value;
                              setCustomization({
                                ...customization,
                                achievements: newAchievements,
                              });
                            }}
                          />
                          <IconButton
                            aria-label="Remove achievement"
                            icon={<FaTrash />}
                            onClick={() => {
                              const newAchievements = [
                                ...(customization.achievements || []),
                              ];
                              newAchievements.splice(index, 1);
                              setCustomization({
                                ...customization,
                                achievements: newAchievements,
                              });
                            }}
                          />
                        </HStack>
                      )
                    )}
                    <Button
                      onClick={() =>
                        setCustomization({
                          ...customization,
                          achievements: [
                            ...(customization.achievements || []),
                            "",
                          ],
                        })
                      }
                    >
                      Add Achievement
                    </Button>
                  </VStack>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Media Section */}
          <AccordionItem border={0}>
            <h2>
              <AccordionButton
                py={3}
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
              >
                <Box as="span" flex="1" textAlign="left" fontWeight="medium">
                  Media
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <HStack justify="space-between" align="center" mb={2}>
                    <FormLabel mb={0}>Profile Photo</FormLabel>
                    {customization.profileImage && (
                      <Button
                        size="sm"
                        leftIcon={<FaTrash />}
                        variant="ghost"
                        colorScheme="red"
                        onClick={async () => {
                          const updatedCustomization = {
                            ...customization,
                            profileImage: undefined,
                          };
                          setCustomization(updatedCustomization);

                          // Auto-save after removal
                          try {
                            toast({
                              title: "Saving your profile...",
                              status: "info",
                              duration: 2000,
                            });

                            await onSave(updatedCustomization);

                            toast({
                              title: "Profile photo removed and saved!",
                              status: "success",
                              duration: 3000,
                            });
                          } catch (error) {
                            toast({
                              title: "Photo removed but couldn't auto-save",
                              description:
                                "Your changes will be saved when you click Save Changes",
                              status: "warning",
                              duration: 5000,
                            });
                          }
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </HStack>
                  <Box
                    position="relative"
                    width="150px"
                    height="150px"
                    borderWidth={1}
                    borderRadius="full"
                    overflow="hidden"
                  >
                    {customization.profileImage ? (
                      <Image
                        src={getThumbnailUrl(
                          customization.profileImage,
                          "medium"
                        )}
                        alt="Profile"
                        boxSize="150px"
                        objectFit="cover"
                        style={{ imageOrientation: "from-image" }}
                      />
                    ) : (
                      <VStack
                        justify="center"
                        align="center"
                        h="100%"
                        spacing={2}
                        color="gray.500"
                      >
                        <FaUpload />
                        <Text fontSize="sm">Add Photo</Text>
                      </VStack>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUploadChange(e, "profile")}
                      position="absolute"
                      top={0}
                      left={0}
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                    />
                    {uploadingImage?.type === "profile" && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg="rgba(255, 255, 255, 0.8)"
                        p={3}
                        borderRadius="md"
                      >
                        <Spinner />
                      </Box>
                    )}
                  </Box>
                </FormControl>

                <FormControl>
                  <HStack justify="space-between" align="center" mb={2}>
                    <FormLabel mb={0}>Cover Image</FormLabel>
                    {customization.coverImage && (
                      <Button
                        size="sm"
                        leftIcon={<FaTrash />}
                        variant="ghost"
                        colorScheme="red"
                        onClick={async () => {
                          const updatedCustomization = {
                            ...customization,
                            coverImage: undefined,
                          };
                          setCustomization(updatedCustomization);

                          // Auto-save after removal
                          try {
                            toast({
                              title: "Saving your profile...",
                              status: "info",
                              duration: 2000,
                            });

                            await onSave(updatedCustomization);

                            toast({
                              title: "Cover image removed and saved!",
                              status: "success",
                              duration: 3000,
                            });
                          } catch (error) {
                            toast({
                              title:
                                "Cover image removed but couldn't auto-save",
                              description:
                                "Your changes will be saved when you click Save Changes",
                              status: "warning",
                              duration: 5000,
                            });
                          }
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </HStack>
                  <Box
                    borderWidth={1}
                    borderRadius="md"
                    p={4}
                    position="relative"
                    height="200px"
                    overflow="hidden"
                  >
                    {customization.coverImage ? (
                      <Image
                        src={getThumbnailUrl(
                          customization.coverImage,
                          "medium"
                        )}
                        alt="Cover"
                        objectFit="cover"
                        w="100%"
                        h="100%"
                        style={{ imageOrientation: "from-image" }}
                      />
                    ) : (
                      <VStack
                        justify="center"
                        align="center"
                        h="100%"
                        spacing={2}
                        color="gray.500"
                      >
                        <FaUpload />
                        <Text>Click to upload cover image</Text>
                      </VStack>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUploadChange(e, "cover")}
                      position="absolute"
                      top={0}
                      left={0}
                      opacity={0}
                      width="100%"
                      height="100%"
                      cursor="pointer"
                    />
                    {uploadingImage?.type === "cover" && (
                      <Box
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg="rgba(255, 255, 255, 0.8)"
                        p={3}
                        borderRadius="md"
                      >
                        <Spinner />
                      </Box>
                    )}
                  </Box>
                </FormControl>

                <FormControl>
                  <FormLabel>Gallery Images</FormLabel>
                  <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
                    {(customization.galleryImages || []).map((image, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={getThumbnailUrl(image, "small")}
                          alt={`Gallery ${index + 1}`}
                          objectFit="cover"
                          aspectRatio={1}
                          borderRadius="md"
                          style={{ imageOrientation: "from-image" }}
                        />
                        <IconButton
                          aria-label="Remove image"
                          icon={<FaTrash />}
                          position="absolute"
                          top={2}
                          right={2}
                          size="sm"
                          onClick={async () => {
                            const newImages = [
                              ...(customization.galleryImages || []),
                            ];
                            newImages.splice(index, 1);
                            const updatedCustomization = {
                              ...customization,
                              galleryImages: newImages,
                            };
                            setCustomization(updatedCustomization);

                            // Auto-save after removal
                            try {
                              toast({
                                title: "Saving your profile...",
                                status: "info",
                                duration: 2000,
                              });

                              await onSave(updatedCustomization);

                              toast({
                                title: "Gallery image removed and saved!",
                                status: "success",
                                duration: 3000,
                              });
                            } catch (error) {
                              toast({
                                title: "Image removed but couldn't auto-save",
                                description:
                                  "Your changes will be saved when you click Save Changes",
                                status: "warning",
                                duration: 5000,
                              });
                            }
                          }}
                        />
                      </Box>
                    ))}
                    <Box
                      borderWidth={1}
                      borderRadius="md"
                      p={4}
                      textAlign="center"
                      position="relative"
                      height="100%"
                      minHeight="150px"
                    >
                      <VStack spacing={2} justify="center" h="100%">
                        <FaUpload />
                        <Text>Add Image</Text>
                      </VStack>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUploadChange(e, "gallery")}
                        position="absolute"
                        top={0}
                        left={0}
                        opacity={0}
                        width="100%"
                        height="100%"
                        cursor="pointer"
                      />
                      {uploadingImage?.type === "gallery" && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          bg="rgba(255, 255, 255, 0.8)"
                          p={3}
                          borderRadius="md"
                        >
                          <Spinner />
                        </Box>
                      )}
                    </Box>
                  </SimpleGrid>
                </FormControl>

                <FormControl>
                  <FormLabel>Featured Video URL</FormLabel>
                  <Input
                    value={customization.featuredVideo}
                    onChange={(e) =>
                      setCustomization({
                        ...customization,
                        featuredVideo: e.target.value,
                      })
                    }
                    placeholder="YouTube or Vimeo URL..."
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Profile Song</FormLabel>
                  <VStack spacing={2}>
                    <Input
                      value={customization.profileSong?.title}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          profileSong: {
                            ...customization.profileSong,
                            title: e.target.value,
                          },
                        })
                      }
                      placeholder="Song title..."
                    />
                    <Input
                      value={customization.profileSong?.artist}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          profileSong: {
                            ...customization.profileSong,
                            artist: e.target.value,
                          },
                        })
                      }
                      placeholder="Artist name..."
                    />
                    <Input
                      value={customization.profileSong?.url}
                      onChange={(e) =>
                        setCustomization({
                          ...customization,
                          profileSong: {
                            ...customization.profileSong,
                            url: e.target.value,
                          },
                        })
                      }
                      placeholder="Song URL (Spotify, Apple Music, etc.)..."
                    />
                  </VStack>
                </FormControl>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Map Section */}
          <AccordionItem border={0}>
            <h2>
              <AccordionButton
                py={3}
                _hover={{ bg: "gray.50" }}
                borderRadius="md"
              >
                <Box as="span" flex="1" textAlign="left" fontWeight="medium">
                  Skating Map
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <Text>
                  Add locations where you've skated, trained, or competed to
                  create your personal skating map.
                </Text>
                <ProfileMapSection
                  locations={customization.mapLocations || []}
                  onChange={(locations: MapLocation[]) => {
                    setCustomization({
                      ...customization,
                      mapLocations: locations,
                    });
                  }}
                  competitionLocations={competitionLocations}
                  autoSave={true}
                  onSave={async (updatedLocations: MapLocation[]) => {
                    // Create a customization object with the updated locations
                    const updatedCustomization = {
                      ...customization,
                      mapLocations: updatedLocations,
                    };
                    return onSave(updatedCustomization);
                  }}
                />
              </VStack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        <Button
          colorScheme="blue"
          onClick={handleSave}
          isLoading={isLoading}
          size="lg"
          w="100%"
        >
          Save Changes
        </Button>
      </VStack>
    </Card>
  );
};
