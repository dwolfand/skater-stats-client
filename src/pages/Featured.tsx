import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Link,
  Avatar,
  Image,
  useStyleConfig,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { getFeaturedSkaters, FeaturedSkater } from "../api/client";
import { trackEvent } from "../utils/analytics";

function Card({ children }: { children: React.ReactNode }) {
  const styles = useStyleConfig("Box", { variant: "card" });
  return (
    <Box __css={{ ...styles, p: { base: 4, md: 6 }, width: "100%" }}>
      {children}
    </Box>
  );
}

export default function Featured() {
  const { data: featuredSkaters, isLoading } = useQuery<FeaturedSkater[]>({
    queryKey: ["featuredSkaters"],
    queryFn: getFeaturedSkaters,
  });

  useEffect(() => {
    trackEvent("view_page", { page_type: "featured" });
  }, []);

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center>
          <Spinner size="xl" color="brand.500" />
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size="lg" mb={2}>
            Featured Skaters
          </Heading>
          <Text color="gray.600">
            Meet some of our amazing skaters from across the country.
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={6}>
          {featuredSkaters?.map((skater) => (
            <Link
              key={skater.id}
              as={RouterLink}
              to={`/skater/id/${skater.id}`}
              _hover={{ textDecoration: "none" }}
            >
              <Card>
                <VStack spacing={4} align="center">
                  {skater.profileImage ? (
                    <Image
                      src={skater.profileImage}
                      alt={skater.name}
                      borderRadius="full"
                      boxSize={{ base: "120px", md: "150px" }}
                      objectFit="cover"
                    />
                  ) : (
                    <Avatar
                      size={{ base: "2xl", md: "2xl" }}
                      name={skater.name}
                    />
                  )}
                  <VStack spacing={1}>
                    <Text
                      fontWeight="medium"
                      fontSize="lg"
                      textAlign="center"
                      noOfLines={1}
                    >
                      {skater.name}
                    </Text>
                    {skater.club && (
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        textAlign="center"
                        noOfLines={1}
                      >
                        {skater.club}
                      </Text>
                    )}
                    {skater.customization?.bio && (
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        textAlign="center"
                        noOfLines={2}
                        mt={2}
                        maxW="100%"
                        overflow="hidden"
                        wordBreak="break-word"
                      >
                        {skater.customization.bio}
                      </Text>
                    )}
                  </VStack>
                </VStack>
              </Card>
            </Link>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
}
