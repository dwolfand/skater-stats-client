import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  FormHelperText,
  InputGroup,
  InputLeftAddon,
  Box,
  Image,
  Spinner,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClubStats,
  updateClubCustomization,
  handleImageUpload,
} from "../api/client";
import { FaUpload, FaTrash } from "react-icons/fa";
import { flagRecentlyUploaded, getThumbnailUrl } from "../utils/images";

interface ClubCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  currentCustomization?: ClubStats["customization"];
}

const ClubCustomizationModal: React.FC<ClubCustomizationModalProps> = ({
  isOpen,
  onClose,
  clubId,
  currentCustomization,
}) => {
  const [location, setLocation] = useState(
    currentCustomization?.location || ""
  );
  const [website, setWebsite] = useState(currentCustomization?.website || "");
  const [description, setDescription] = useState(
    currentCustomization?.description || ""
  );
  const [instagram, setInstagram] = useState(
    currentCustomization?.socialLinks?.instagram || ""
  );
  const [facebook, setFacebook] = useState(
    currentCustomization?.socialLinks?.facebook || ""
  );
  const [imageUrl, setImageUrl] = useState(
    typeof currentCustomization?.profileImage === "string"
      ? currentCustomization.profileImage
      : currentCustomization?.profileImage?.url || ""
  );
  const [thumbnails, setThumbnails] = useState(
    typeof currentCustomization?.profileImage === "object"
      ? currentCustomization?.profileImage?.thumbnails
      : undefined
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const toast = useToast();
  const queryClient = useQueryClient();

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (isOpen) {
      setLocation(currentCustomization?.location || "");
      setWebsite(currentCustomization?.website || "");
      setDescription(currentCustomization?.description || "");
      setInstagram(currentCustomization?.socialLinks?.instagram || "");
      setFacebook(currentCustomization?.socialLinks?.facebook || "");
      setImageUrl(
        typeof currentCustomization?.profileImage === "string"
          ? currentCustomization.profileImage
          : currentCustomization?.profileImage?.url || ""
      );
      setThumbnails(
        typeof currentCustomization?.profileImage === "object"
          ? currentCustomization?.profileImage?.thumbnails
          : undefined
      );
    }
  }, [isOpen, currentCustomization]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const customizationData: ClubStats["customization"] = {
        location: location || undefined,
        website: website || undefined,
        description: description || undefined,
        socialLinks: {
          instagram: instagram || undefined,
          facebook: facebook || undefined,
        },
        profileImage: imageUrl
          ? {
              url: imageUrl,
              thumbnails: thumbnails,
            }
          : undefined,
      };

      return updateClubCustomization(clubId, customizationData);
    },
    onSuccess: () => {
      toast({
        title: "Club information updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      queryClient.invalidateQueries({ queryKey: ["club", clubId] });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating club information",
        description: "Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Error updating club:", error);
    },
  });

  const handleImageUploadChange = async (
    event: React.ChangeEvent<HTMLInputElement>
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

    setIsUploadingImage(true);
    try {
      const { fileUrl, thumbnailUrls } = await handleImageUpload(
        "club",
        clubId,
        file,
        "logo"
      );

      // Flag the image as recently uploaded so we use the original URL while thumbnails generate
      flagRecentlyUploaded(fileUrl);

      setImageUrl(fileUrl);
      setThumbnails(thumbnailUrls);

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
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate();
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setThumbnails(undefined);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>Edit Club Information</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <HStack justify="space-between" align="center" mb={2}>
                  <FormLabel mb={0}>Club Logo</FormLabel>
                  {imageUrl && (
                    <Button
                      size="sm"
                      leftIcon={<FaTrash />}
                      variant="ghost"
                      colorScheme="red"
                      onClick={handleRemoveImage}
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
                  borderRadius="md"
                  overflow="hidden"
                >
                  {imageUrl ? (
                    <Image
                      src={
                        thumbnails
                          ? getThumbnailUrl(
                              { url: imageUrl, thumbnails },
                              "medium"
                            )
                          : imageUrl
                      }
                      alt="Club Logo"
                      boxSize="150px"
                      objectFit="contain"
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
                      <Text fontSize="sm">Add Logo</Text>
                    </VStack>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadChange}
                    position="absolute"
                    top={0}
                    left={0}
                    opacity={0}
                    width="100%"
                    height="100%"
                    cursor="pointer"
                  />
                  {isUploadingImage && (
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
                <FormLabel>Club Location</FormLabel>
                <Input
                  placeholder="e.g. Boston, MA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Website</FormLabel>
                <Input
                  placeholder="e.g. https://www.clubwebsite.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
                <FormHelperText>
                  Include https:// for proper linking
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Brief description of the club"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Social Media</FormLabel>
                <VStack spacing={2}>
                  <InputGroup>
                    <InputLeftAddon>instagram.com/</InputLeftAddon>
                    <Input
                      placeholder="username"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                    />
                  </InputGroup>

                  <InputGroup>
                    <InputLeftAddon>facebook.com/</InputLeftAddon>
                    <Input
                      placeholder="username or page"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                    />
                  </InputGroup>
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="submit"
              isLoading={updateMutation.isPending}
            >
              Save Changes
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default ClubCustomizationModal;
