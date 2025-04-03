import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link,
  Spinner,
  Center,
  Button,
  HStack,
  Select,
  Image,
  Icon,
  Flex,
  useDisclosure,
  Stack,
  Divider,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "../utils/date";
import { getClubStats, type ClubStats } from "../api/client";
import { useAuth } from "../context/AuthContext";
import {
  FaInstagram,
  FaFacebook,
  FaGlobe,
  FaMapMarkerAlt,
  FaEdit,
} from "react-icons/fa";
import ClubCustomizationModal from "../components/ClubCustomizationModal";
import { getThumbnailUrl } from "../utils/images";

const PAGE_SIZES = [10, 25, 50, 100];

export default function Club() {
  const { clubId } = useParams<{ clubId: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const { profile } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: clubStats, isLoading } = useQuery({
    queryKey: ["club", clubId],
    queryFn: async () => {
      const data = await getClubStats(clubId!);
      if ("clubName" in data) {
        throw new Error("Unexpected data type");
      }
      return data;
    },
    enabled: !!clubId,
  });

  // Check if the current user belongs to this club
  const isUserMemberOfClub =
    profile?.currentClubId === Number(clubId) || profile?.role === "admin";

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (!clubStats) {
    return (
      <Container py={8}>
        <Text>Club not found</Text>
      </Container>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(clubStats.competitions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentCompetitions = clubStats.competitions.slice(
    startIndex,
    endIndex
  );

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Flex justify="space-between" align="flex-start">
            <Box>
              <Heading size="lg" mb={2}>
                {clubStats.name}
              </Heading>
              <Text color="gray.600">
                {clubStats.totalSkaters} skaters · {clubStats.totalCompetitions}{" "}
                competitions
              </Text>
            </Box>
            {isUserMemberOfClub && (
              <Button
                leftIcon={<FaEdit />}
                colorScheme="blue"
                size="sm"
                onClick={onOpen}
              >
                Edit Club Info
              </Button>
            )}
          </Flex>
        </Box>

        {/* Display club customization if available */}
        {clubStats.customization && (
          <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={5}
            bg="white"
            shadow="sm"
          >
            <Stack direction={["column", "row"]} spacing={6} align="flex-start">
              {clubStats.customization.profileImage && (
                <Image
                  src={getThumbnailUrl(
                    clubStats.customization.profileImage,
                    "medium"
                  )}
                  alt={`${clubStats.name} logo`}
                  boxSize={["120px", "150px"]}
                  objectFit="contain"
                  borderRadius="md"
                  style={{ imageOrientation: "from-image" }}
                />
              )}

              <Stack flex="1" spacing={4}>
                {clubStats.customization.description && (
                  <Text>{clubStats.customization.description}</Text>
                )}

                <Stack spacing={2}>
                  {clubStats.customization.location && (
                    <Flex align="center">
                      <Icon as={FaMapMarkerAlt} color="gray.500" mr={2} />
                      <Text>{clubStats.customization.location}</Text>
                    </Flex>
                  )}

                  {clubStats.customization.website && (
                    <Flex align="center">
                      <Icon as={FaGlobe} color="gray.500" mr={2} />
                      <Link
                        href={clubStats.customization.website}
                        isExternal
                        color="blue.500"
                      >
                        {clubStats.customization.website.replace(
                          /(https?:\/\/)?(www\.)?/i,
                          ""
                        )}
                      </Link>
                    </Flex>
                  )}

                  {/* Social Media Links */}
                  {clubStats.customization.socialLinks && (
                    <Flex gap={3} mt={1}>
                      {clubStats.customization.socialLinks.instagram && (
                        <Link
                          href={`https://instagram.com/${clubStats.customization.socialLinks.instagram}`}
                          isExternal
                        >
                          <Icon
                            as={FaInstagram}
                            boxSize="1.5em"
                            color="gray.600"
                            _hover={{ color: "blue.500" }}
                          />
                        </Link>
                      )}

                      {clubStats.customization.socialLinks.facebook && (
                        <Link
                          href={`https://facebook.com/${clubStats.customization.socialLinks.facebook}`}
                          isExternal
                        >
                          <Icon
                            as={FaFacebook}
                            boxSize="1.5em"
                            color="gray.600"
                            _hover={{ color: "blue.500" }}
                          />
                        </Link>
                      )}
                    </Flex>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </Box>
        )}

        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Competition History</Heading>
            <HStack spacing={4}>
              <Select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                width="auto"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </Select>
            </HStack>
          </HStack>

          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Competition</Th>
                <Th>Date</Th>
                <Th isNumeric>Club Skaters</Th>
              </Tr>
            </Thead>
            <Tbody>
              {currentCompetitions.map((competition) => (
                <Tr key={`${competition.year}-${competition.ijsId}`}>
                  <Td>
                    <Link
                      as={RouterLink}
                      to={`/club/${clubId}/competition/${competition.year}/${competition.ijsId}`}
                      color="blue.500"
                    >
                      {competition.name}
                    </Link>
                  </Td>
                  <Td>{dayjs(competition.date).format("MMM D, YYYY")}</Td>
                  <Td isNumeric>{competition.skaterCount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {totalPages > 1 && (
            <HStack justify="center" mt={4} spacing={2}>
              <Button
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Text>
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </HStack>
          )}
        </Box>
      </VStack>

      {/* Edit Club Modal */}
      <ClubCustomizationModal
        isOpen={isOpen}
        onClose={onClose}
        clubId={clubId || ""}
        currentCustomization={clubStats.customization}
      />
    </Container>
  );
}
