import React, { useState } from "react";
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
import { ProfileCustomization } from "../types/auth";
import { handleImageUpload } from "../api/auth";

interface ProfileCustomizationSectionProps {
  initialCustomization?: ProfileCustomization;
  onSave: (customization: ProfileCustomization) => Promise<void>;
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
> = ({ initialCustomization, onSave }) => {
  const [customization, setCustomization] = useState<ProfileCustomization>(
    initialCustomization || {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<{
    type: "profile" | "cover" | "gallery";
    index?: number;
  } | null>(null);
  const toast = useToast();

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
      const fileUrl = await handleImageUpload(file, type);

      if (type === "gallery") {
        setCustomization({
          ...customization,
          galleryImages: [...(customization.galleryImages || []), fileUrl],
        });
      } else {
        setCustomization({
          ...customization,
          [type === "profile" ? "profileImage" : "coverImage"]: fileUrl,
        });
      }

      toast({
        title: "Image uploaded successfully",
        status: "success",
      });
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
    <Card p={{ base: 3, md: 6 }}>
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
                  <FormLabel>Background Color</FormLabel>
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
                              color={customization.backgroundColor || "#FFFFFF"}
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
                    Allow your profile to be featured on the homepage
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
                        onClick={() =>
                          setCustomization({
                            ...customization,
                            profileImage: undefined,
                          })
                        }
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
                        src={customization.profileImage}
                        alt="Profile"
                        boxSize="150px"
                        objectFit="cover"
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
                        onClick={() =>
                          setCustomization({
                            ...customization,
                            coverImage: undefined,
                          })
                        }
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
                        src={customization.coverImage}
                        alt="Cover"
                        objectFit="cover"
                        w="100%"
                        h="100%"
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
                          src={image}
                          alt={`Gallery ${index + 1}`}
                          objectFit="cover"
                          aspectRatio={1}
                          borderRadius="md"
                        />
                        <IconButton
                          aria-label="Remove image"
                          icon={<FaTrash />}
                          position="absolute"
                          top={2}
                          right={2}
                          size="sm"
                          onClick={() => {
                            const newImages = [
                              ...(customization.galleryImages || []),
                            ];
                            newImages.splice(index, 1);
                            setCustomization({
                              ...customization,
                              galleryImages: newImages,
                            });
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
