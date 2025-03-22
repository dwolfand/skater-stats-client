import React from "react";
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
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAdminInfo, updateLinkRequestStatus } from "../api/auth";
import { UserStatus } from "../types/auth";

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

      <VStack spacing={4} align="stretch">
        {adminInfo?.linkRequests.map((request) => (
          <Box
            key={request.id}
            p={4}
            borderWidth="1px"
            borderRadius="md"
            bg="white"
          >
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
                  <Text fontWeight="medium">{request.skaterName}</Text>
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
          </Box>
        ))}
      </VStack>
    </VStack>
  );
};
