import React, { useState } from "react";
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
  useStyleConfig,
  Center,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getProfile, requestSkaterLink } from "../api/auth";
import { UserStatus } from "../types/auth";
import { LoginModalContext } from "../components/LoginModal";

function Card({ children }: { children: React.ReactNode }) {
  const styles = useStyleConfig("Box", { variant: "card" });
  return <Box __css={{ ...styles, p: { base: 4, md: 6 } }}>{children}</Box>;
}

export const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { openLoginModal } = React.useContext(LoginModalContext);
  const [error, setError] = useState<string | null>(null);

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    enabled: isAuthenticated,
    retry: false, // Don't retry on error since it might be an auth issue
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

  if (authLoading || (isAuthenticated && profileLoading)) {
    return (
      <Container centerContent py={10}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={6} align="stretch">
          <Box textAlign="center">
            <Heading size="lg" mb={2}>
              Profile
            </Heading>
          </Box>
          <Card>
            <VStack spacing={4} align="center" py={4}>
              <Heading size="md">Sign in to View Your Profile</Heading>
              <Text color="gray.600" textAlign="center">
                Access your skating profile, manage your favorites, and more.
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() =>
                  openLoginModal("Please sign in to view your profile")
                }
              >
                Sign In
              </Button>
            </VStack>
          </Card>
        </VStack>
      </Container>
    );
  }

  // Handle profile loading error
  if (profileError) {
    return (
      <Container maxW="container.md" py={10}>
        <VStack spacing={6} align="stretch">
          <Alert status="error">
            <AlertIcon />
            <VStack align="stretch" spacing={2}>
              <Text>
                Failed to load profile data. Please try logging in again.
              </Text>
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => {
                  logout();
                }}
              >
                Return to Login
              </Button>
            </VStack>
          </Alert>
        </VStack>
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

        <Card>
          <Box display="flex" alignItems="center" gap={6}>
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
        </Card>

        <Card>
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
        </Card>

        <Box display="flex" justifyContent="center">
          <Button
            colorScheme="red"
            onClick={() => {
              logout();
            }}
          >
            Logout
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};
