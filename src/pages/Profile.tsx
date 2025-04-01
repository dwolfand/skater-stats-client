import React, { useState, useRef } from "react";
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
  HStack,
  Link,
  Avatar,
  Center,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  requestSkaterLink,
  getTossieReceipts,
  saveProfileCustomization,
} from "../api/auth";
import {
  UserStatus,
  LinkSkaterRequest,
  LinkRequest,
  ProfileCustomization,
} from "../types/auth";
import { TossieReceipt } from "../api/client";
import { LoginModalContext } from "../components/LoginModal";
import { SkaterLinkModal } from "../components/SkaterLinkModal";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useFeedbackModal } from "../components/FeedbackModal";
import { AdminInfo } from "../components/AdminInfo";
import { ProfileCustomizationSection } from "../components/ProfileCustomizationSection";
import { TossieNotification } from "../components/TossieNotification";
import { TossieBasket } from "../components/TossieBasket";
import { FaSkating } from "react-icons/fa";
import { getImageUrl } from "../utils/images";

const needSupportPrompt = `Need to combine profiles (e.g., maiden name or misspellings)? `;

function Card({ children }: { children: React.ReactNode }) {
  const styles = useStyleConfig("Box", { variant: "card" });
  return <Box __css={{ ...styles, p: { base: 4, md: 6 } }}>{children}</Box>;
}

// Create a version that forwards the ref
const CardWithRef = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode }
>((props, ref) => {
  const styles = useStyleConfig("Box", { variant: "card" });
  return (
    <Box ref={ref} __css={{ ...styles, p: { base: 4, md: 6 } }}>
      {props.children}
    </Box>
  );
});

const statusColors: Record<UserStatus, string> = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
};

const statusLabels: Record<UserStatus, string> = {
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
};

const TossieReceiptItem: React.FC<{ receipt: TossieReceipt }> = ({
  receipt,
}) => {
  const fromName = receipt.fromSkaterName || receipt.fromUserName;
  const eventUrl =
    receipt.resultType === "six_event"
      ? `/competition/${receipt.eventYear}/${receipt.ijsId}/six-event/${receipt.results_url}`
      : `/competition/${receipt.eventYear}/${receipt.ijsId}/event/${receipt.results_url}`;

  return (
    <HStack spacing={3} py={2} align="start">
      <Avatar
        size="sm"
        src={receipt.fromUserPicture}
        name={receipt.fromUserName}
      />
      <Box flex={1}>
        <HStack spacing={2} flexWrap="wrap">
          {receipt.fromSkaterId ? (
            <Link
              as={RouterLink}
              to={`/skater/id/${receipt.fromSkaterId}`}
              color="blue.500"
              fontWeight="medium"
            >
              {fromName}
            </Link>
          ) : (
            <Text fontWeight="medium">{fromName}</Text>
          )}
          <Text>gave you a tossie</Text>
          <Link as={RouterLink} to={eventUrl} color="blue.500">
            {receipt.eventName}
          </Link>
        </HStack>
        <Text fontSize="sm" color="gray.500">
          {new Date(receipt.created_at).toLocaleString()}
        </Text>
      </Box>
    </HStack>
  );
};

export const Profile: React.FC = () => {
  const {
    user,
    profile,
    isAuthenticated,
    isLoading: authLoading,
    refreshProfile,
    logout,
  } = useAuth();
  const { openLoginModal } = React.useContext(LoginModalContext);
  const { openFeedbackModal } = useFeedbackModal();
  const [error, setError] = useState<string | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const tossieBasketRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: tossieReceipts, isLoading: tossiesLoading } = useQuery({
    queryKey: ["tossieReceipts"],
    queryFn: getTossieReceipts,
    enabled: isAuthenticated && profile?.status === "approved",
  });

  const linkSkaterMutation = useMutation({
    mutationFn: (params: LinkSkaterRequest) =>
      requestSkaterLink(
        params.skaterId,
        params.usfsNumber,
        params.additionalInfo
      ),
    onSuccess: () => {
      refreshProfile();
    },
    onError: (error: any) => {
      setError(error.response?.data?.error || "Failed to link skater profile");
    },
  });

  const handleSaveCustomization = async (
    customization: ProfileCustomization
  ) => {
    try {
      await saveProfileCustomization(customization);
      await refreshProfile();
    } catch (error) {
      throw error;
    }
  };

  const scrollToTossieBasket = () => {
    tossieBasketRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Filter unopened tossies
  const unopenedTossies =
    tossieReceipts?.filter((tossie) => !tossie.is_opened) || [];

  if (authLoading) {
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
                Access your skating profile, give tossies, manage your
                favorites, and more.
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

  const getStatusBadge = () => {
    if (!profile?.status) return null;

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
        </Box>

        {error && (
          <Alert status="error" mb={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Card>
          <Box display="flex" alignItems="center" gap={6}>
            <VStack spacing={4}>
              {profile?.customization?.profileImage ? (
                <Image
                  src={getImageUrl(profile.customization.profileImage)}
                  alt={user?.name}
                  borderRadius="full"
                  boxSize="100px"
                  objectFit="cover"
                  style={{ imageOrientation: "from-image" }}
                />
              ) : user?.picture ? (
                <Image
                  src={user.picture}
                  alt={user?.name}
                  borderRadius="full"
                  boxSize="100px"
                  objectFit="cover"
                  style={{ imageOrientation: "from-image" }}
                />
              ) : (
                <Avatar size="xl" name={user?.name} />
              )}
              {profile?.status === "approved" && (
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  You can change your profile photo in the customization section
                  below
                </Text>
              )}
            </VStack>
            <VStack align="stretch" flex={1}>
              <Text>
                <strong>Name:</strong> {user?.name}
              </Text>
              <Text>
                <strong>Email:</strong> {user?.email}
              </Text>
              {profile?.skaterId && (
                <Text>
                  <strong>Linked Skater:</strong>{" "}
                  <Link
                    as={RouterLink}
                    to={`/skater/id/${profile.skaterId}`}
                    color="blue.500"
                  >
                    {profile.skaterName}
                  </Link>{" "}
                  {getStatusBadge()}
                </Text>
              )}
              {profile?.status === "approved" &&
                profile?.currentClub &&
                profile?.clubHistory && (
                  <Text>
                    <strong>Current Club:</strong> {profile.currentClub}
                  </Text>
                )}

              {!profile?.skaterId && !profile?.status && (
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={FaSkating} />}
                  onClick={() => setIsLinkModalOpen(true)}
                  mt={2}
                >
                  Link Your Skater Profile
                </Button>
              )}

              {profile?.status === "rejected" && (
                <HStack mt={2}>
                  <Button
                    colorScheme="blue"
                    leftIcon={<Icon as={FaSkating} />}
                    onClick={() => setIsLinkModalOpen(true)}
                    size="sm"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      openFeedbackModal(
                        "I need help linking my skating profile",
                        `${needSupportPrompt} Skater name: ${user?.name}`
                      );
                    }}
                  >
                    Get Support
                  </Button>
                </HStack>
              )}

              {profile?.status === "pending" && (
                <Box mt={2}>
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    size="sm"
                    onClick={() => {
                      openFeedbackModal(
                        "I need help with my pending skater link",
                        `${needSupportPrompt} Skater ID: ${profile.skaterId}`
                      );
                    }}
                  >
                    Need Help?
                  </Button>
                </Box>
              )}
            </VStack>
          </Box>
        </Card>

        {/* Tossie Notification - only show when there are unopened tossies */}
        {profile?.status === "approved" && unopenedTossies.length > 0 && (
          <TossieNotification
            unopenedCount={unopenedTossies.length}
            onViewTossies={scrollToTossieBasket}
          />
        )}

        {profile?.status === "approved" && (
          <ProfileCustomizationSection
            initialCustomization={profile.customization || {}}
            onSave={handleSaveCustomization}
          />
        )}

        {/* Tossie Basket - replace the old Received Tossies section */}
        {profile?.status === "approved" && (
          <CardWithRef ref={tossieBasketRef}>
            {tossiesLoading ? (
              <Center py={4}>
                <Spinner />
              </Center>
            ) : !tossieReceipts?.length ? (
              <Text color="gray.600">No tossies received yet.</Text>
            ) : (
              <TossieBasket
                tossieReceipts={tossieReceipts}
                refreshTossies={() => refreshProfile()}
              />
            )}
          </CardWithRef>
        )}

        {profile?.role === "admin" && (
          <Card>
            <Heading size="md" mb={4}>
              Admin Dashboard
            </Heading>
            <AdminInfo />
          </Card>
        )}

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

      <SkaterLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        userName={user?.name || ""}
        onSuccess={refreshProfile}
      />
    </Container>
  );
};
