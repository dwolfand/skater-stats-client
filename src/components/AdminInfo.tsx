import React, { useState } from "react";
import {
  VStack,
  Box,
  Heading,
  Text,
  Badge,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Spinner,
  Center,
  Divider,
  HStack,
  Link,
  Avatar,
  Collapse,
  Button,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAdminInfo,
  updateLinkRequestStatus,
  AdminInfo as AdminInfoType,
} from "../api/auth";
import { UserStatus, AdminTossieReceipt } from "../types/auth";
import dayjs from "../utils/date";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";

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

export const AdminInfo: React.FC = () => {
  const [showTossies, setShowTossies] = useState(false);
  const {
    data: adminInfo,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["adminInfo"],
    queryFn: getAdminInfo,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params: { requestId: string; status: UserStatus }) =>
      updateLinkRequestStatus(params.requestId, params.status),
    onSuccess: () => {
      refetch();
    },
  });

  if (isLoading) {
    return (
      <Center py={4}>
        <Spinner />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch" width="100%">
      <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4}>
        <Stat
          p={4}
          bg="blue.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <StatLabel color="blue.700">Total Users</StatLabel>
          <StatNumber color="blue.900">{adminInfo?.userCount || 0}</StatNumber>
        </Stat>
        <Stat
          p={4}
          bg="purple.50"
          borderRadius="md"
          borderWidth="1px"
          borderColor="purple.200"
        >
          <StatLabel color="purple.700">Total Tossies</StatLabel>
          <StatNumber color="purple.900">
            {adminInfo?.tossieCount || 0}
          </StatNumber>
        </Stat>
      </SimpleGrid>

      <Divider />

      <Box>
        <HStack justify="space-between" mb={4}>
          <Heading size="md">Recent Tossies</Heading>
          <Button
            size="sm"
            onClick={() => setShowTossies(!showTossies)}
            rightIcon={
              <Icon as={showTossies ? ChevronUpIcon : ChevronDownIcon} />
            }
          >
            {showTossies ? "Hide" : "Show"}
          </Button>
        </HStack>
        <Collapse in={showTossies} animateOpacity>
          <VStack spacing={4} align="stretch">
            {adminInfo?.recentTossies?.map((tossie) => {
              // Safely check property existence
              const hasNoteData = "note" in tossie && tossie.note;
              const isOpened =
                "is_opened" in tossie ? tossie.is_opened : undefined;
              const tossieType =
                "tossie_type" in tossie ? tossie.tossie_type : undefined;
              const isPublicNote =
                "is_public_note" in tossie ? tossie.is_public_note : false;

              return (
                <Box
                  key={tossie.id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="white"
                >
                  <HStack spacing={3} align="start">
                    <Avatar
                      size="sm"
                      src={tossie.fromUserPicture}
                      name={tossie.fromUserName}
                    />
                    <Box flex={1}>
                      <HStack spacing={2} flexWrap="wrap">
                        {tossie.fromSkaterId ? (
                          <Link
                            as={RouterLink}
                            to={`/skater/id/${tossie.fromSkaterId}`}
                            color="blue.500"
                            fontWeight="medium"
                          >
                            {tossie.fromSkaterName || tossie.fromUserName}
                          </Link>
                        ) : (
                          <Text fontWeight="medium">{tossie.fromUserName}</Text>
                        )}
                        <Text>gave a tossie to</Text>
                        <Link
                          as={RouterLink}
                          to={`/skater/id/${tossie.toSkaterId}`}
                          color="blue.500"
                          fontWeight="medium"
                        >
                          {tossie.toSkaterName}
                        </Link>
                        <Text>at</Text>
                        <Link
                          as={RouterLink}
                          to={
                            tossie.resultType === "six_event"
                              ? `/competition/${tossie.eventYear}/${tossie.ijsId}/six-event/${tossie.results_url}`
                              : `/competition/${tossie.eventYear}/${tossie.ijsId}/event/${tossie.results_url}`
                          }
                          color="blue.500"
                        >
                          {tossie.eventName}
                        </Link>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {dayjs(tossie.created_at).format("MMM D, YYYY h:mm A")}
                      </Text>

                      {/* Display tossie status and type if available */}
                      {isOpened !== undefined && (
                        <HStack mt={1} spacing={2}>
                          <Badge
                            colorScheme={isOpened ? "green" : "yellow"}
                            size="sm"
                          >
                            {isOpened ? "Opened" : "Unopened"}
                          </Badge>
                          {tossieType && (
                            <Badge colorScheme="purple" size="sm">
                              {tossieType}
                            </Badge>
                          )}
                        </HStack>
                      )}

                      {/* Display note if available */}
                      {hasNoteData && (
                        <Box mt={2} p={2} bg="gray.50" borderRadius="md">
                          <HStack>
                            <Badge
                              colorScheme={isPublicNote ? "blue" : "red"}
                              size="sm"
                            >
                              {isPublicNote ? "Public" : "Private"} Note
                            </Badge>
                          </HStack>
                          <Text mt={1} fontSize="sm">
                            "{tossie.note}"
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Collapse>
      </Box>

      <Divider />

      <VStack spacing={4} align="stretch">
        {adminInfo?.linkRequests.map((request) => (
          <Box
            key={request.id}
            p={request.status === "approved" ? 2 : 4}
            borderWidth="1px"
            borderRadius="md"
            bg="white"
          >
            {request.status === "approved" ? (
              // Compact view for approved requests
              <HStack spacing={3}>
                <Text fontSize="sm" color="gray.600">
                  {request.userName}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  →
                </Text>
                <Link
                  as={RouterLink}
                  to={`/skater/id/${request.skaterId}`}
                  color="blue.500"
                  fontSize="sm"
                >
                  {request.skaterName}
                </Link>
                <Badge colorScheme={statusColors[request.status]} ml="auto">
                  {statusLabels[request.status]}
                </Badge>
              </HStack>
            ) : (
              // Full view for pending/rejected requests
              <HStack align="start" justify="space-between">
                <VStack align="stretch" spacing={3} flex={1}>
                  {/* User Info */}
                  <Box>
                    <Text fontWeight="medium">{request.userName}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {request.email}
                    </Text>
                  </Box>

                  {/* Skater Info */}
                  <Box>
                    <Link
                      as={RouterLink}
                      to={`/skater/id/${request.skaterId}`}
                      color="blue.500"
                      fontWeight="medium"
                    >
                      {request.skaterName}
                    </Link>
                    <Text fontSize="sm" color="gray.600">
                      USFS: {request.usfsNumber}
                    </Text>
                  </Box>

                  {/* Additional Info if present */}
                  {request.additionalInfo && (
                    <Text fontSize="sm" color="gray.500">
                      Note: {request.additionalInfo}
                    </Text>
                  )}
                </VStack>

                {/* Status and Action */}
                <VStack align="end" spacing={2} minW="120px">
                  <Badge colorScheme={statusColors[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                  <Select
                    value={request.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        requestId: request.id,
                        status: e.target.value as UserStatus,
                      })
                    }
                    size="sm"
                    width="full"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approve</option>
                    <option value="rejected">Reject</option>
                  </Select>
                </VStack>
              </HStack>
            )}
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};
