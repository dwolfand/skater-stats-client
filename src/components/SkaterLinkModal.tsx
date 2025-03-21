import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
  Text,
  Box,
  FormControl,
  FormLabel,
  FormHelperText,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { searchEvents } from "../api/client";
import { requestSkaterLink } from "../api/auth";
import { compareNames } from "../utils/nameComparison";

interface SkaterLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  onSuccess: () => void;
}

interface SkaterSearchResult {
  type: "skater";
  id?: number;
  name: string;
  club?: string;
}

export const SkaterLinkModal: React.FC<SkaterLinkModalProps> = ({
  isOpen,
  onClose,
  userName,
  onSuccess,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SkaterSearchResult[]>([]);
  const [selectedSkater, setSelectedSkater] =
    useState<SkaterSearchResult | null>(null);
  const [usfsNumber, setUsfsNumber] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const searchSkaters = async () => {
      if (searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      try {
        const results = await searchEvents(searchQuery, "skater");
        setSearchResults(
          results.filter(
            (result): result is SkaterSearchResult => result.type === "skater"
          )
        );
      } catch (error) {
        console.error("Error searching skaters:", error);
        toast({
          title: "Error searching skaters",
          status: "error",
          duration: 3000,
        });
      }
    };

    const debounceTimeout = setTimeout(searchSkaters, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery, toast]);

  const handleSubmit = async () => {
    if (!selectedSkater?.id) {
      toast({
        title: "Please select a skater profile",
        status: "error",
        duration: 3000,
      });
      return;
    }

    if (!usfsNumber) {
      toast({
        title: "USFS member number is required",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await requestSkaterLink(selectedSkater.id, usfsNumber, additionalInfo);
      toast({
        title: "Skater profile link request submitted",
        description: compareNames(selectedSkater.name, userName)
          ? "Your profile has been linked!"
          : "Your request will be reviewed",
        status: "success",
        duration: 5000,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error linking skater:", error);
      toast({
        title: "Error linking skater profile",
        description: error.response?.data?.error || "Please try again later",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const namesMatch = selectedSkater
    ? compareNames(selectedSkater.name, userName)
    : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Link Your Skater Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Search for your skating profile</FormLabel>
              <Input
                placeholder="Enter your name as it appears in competitions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FormHelperText>
                Start typing to search for your competition profile
              </FormHelperText>
            </FormControl>

            {searchResults.length > 0 && (
              <Box
                maxH="200px"
                overflowY="auto"
                borderWidth={1}
                borderRadius="md"
                p={2}
              >
                {searchResults.map((result) => (
                  <Box
                    key={`${result.id}-${result.name}`}
                    p={2}
                    cursor="pointer"
                    bg={
                      selectedSkater?.id === result.id
                        ? "blue.50"
                        : "transparent"
                    }
                    _hover={{ bg: "gray.50" }}
                    onClick={() => setSelectedSkater(result)}
                    borderRadius="md"
                  >
                    <Text fontWeight="medium">{result.name}</Text>
                    {result.club && (
                      <Text fontSize="sm" color="gray.600">
                        {result.club}
                      </Text>
                    )}
                  </Box>
                ))}
              </Box>
            )}

            {selectedSkater && (
              <>
                <FormControl isRequired>
                  <FormLabel>USFS Member Number</FormLabel>
                  <Input
                    placeholder="Enter your USFS member number..."
                    value={usfsNumber}
                    onChange={(e) => setUsfsNumber(e.target.value)}
                  />
                </FormControl>

                {!namesMatch && (
                  <FormControl>
                    <FormLabel>Additional Information</FormLabel>
                    <Textarea
                      placeholder="Please explain why the name on your login profile doesn't match your skating profile..."
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value)}
                    />
                  </FormControl>
                )}
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!selectedSkater?.id || (!namesMatch && !additionalInfo)}
          >
            Submit Request
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
