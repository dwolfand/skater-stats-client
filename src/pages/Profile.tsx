import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfile, requestSkaterLink } from "../api/auth";
import { UserStatus } from "../types/auth";

export const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    data: profile,
    isLoading: profileLoading,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isAuthenticated,
  });

  const linkSkaterMutation = useMutation({
    mutationFn: requestSkaterLink,
    onSuccess: () => {
      refetchProfile();
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || "Failed to link skater profile");
    },
  });

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || profileLoading) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  const getStatusBadge = () => {
    if (!profile?.status) return null;

    const statusColors: Record<UserStatus, string> = {
      active: "green",
      pending_verification: "yellow",
      disabled: "red",
    };

    const statusLabels: Record<UserStatus, string> = {
      active: "Active",
      pending_verification: "Pending Verification",
      disabled: "Disabled",
    };

    return (
      <Badge colorScheme={statusColors[profile.status]}>
        {statusLabels[profile.status]}
      </Badge>
    );
  };

  return (
    <Container maxW="container.md" py={10}>
      <VStack spacing={6} align="stretch">
        <Box textAlign="center">
          <Heading size="lg" mb={2}>
            Profile
          </Heading>
          {getStatusBadge()}
        </Box>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Box
          p={6}
          borderWidth={1}
          borderRadius="lg"
          display="flex"
          alignItems="center"
          gap={6}
        >
          {user?.picture && (
            <Image
              src={user.picture}
              alt={user.name}
              borderRadius="full"
              boxSize="100px"
            />
          )}
          <VStack align="stretch" flex={1}>
            <Text>
              <strong>Name:</strong> {user?.name}
            </Text>
            <Text>
              <strong>Email:</strong> {user?.email}
            </Text>
          </VStack>
        </Box>

        <Box p={6} borderWidth={1} borderRadius="lg">
          <Heading size="md" mb={4}>
            Skater Profile
          </Heading>
          {profile?.skaterId ? (
            <>
              <Text mb={4}>
                Your account is linked to skater ID: {profile.skaterId}
              </Text>
              <Button
                as="a"
                href={`/skater/id/${profile.skaterId}`}
                colorScheme="blue"
              >
                View My Skating Profile
              </Button>
            </>
          ) : (
            <VStack align="stretch" spacing={4}>
              <Text>
                Link your account to your skating profile to manage your
                information.
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => {
                  // TODO: Implement skater search and linking
                  // For now, we'll just show an alert
                  alert("Skater linking coming soon!");
                }}
              >
                Link Skating Profile
              </Button>
            </VStack>
          )}
        </Box>
      </VStack>
    </Container>
  );
};
