import {
  Box,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

interface SixJudgeCardProps {
  judgeScores?: string[];
  club?: string | null;
  majority?: string | null;
  tieBreaker?: string;
}

export default function SixJudgeCard({
  judgeScores,
  club,
  majority,
  tieBreaker,
}: SixJudgeCardProps) {
  return (
    <Box p={4} bg="gray.50">
      <VStack align="start" spacing={4}>
        {judgeScores && (
          <Box width="fit-content">
            <Table size="sm" variant="simple" colorScheme="gray">
              <Thead>
                <Tr bg="gray.100">
                  {judgeScores.map((_, index) => (
                    <Th
                      key={index}
                      textAlign="center"
                      width="40px"
                      px={2}
                      color="gray.700"
                    >
                      J{index + 1}
                    </Th>
                  ))}
                  <Th textAlign="center" width="40px" px={2} color="gray.700">
                    Maj.
                  </Th>
                  {tieBreaker && (
                    <Th textAlign="center" width="40px" px={2} color="gray.700">
                      Tie Br.
                    </Th>
                  )}
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  {judgeScores.map((score, index) => (
                    <Td
                      key={index}
                      textAlign="center"
                      fontWeight="medium"
                      px={2}
                      color="gray.900"
                    >
                      {score}
                    </Td>
                  ))}
                  <Td
                    textAlign="center"
                    fontWeight="medium"
                    px={2}
                    color="gray.900"
                  >
                    {majority || "-"}
                  </Td>
                  {tieBreaker && (
                    <Td textAlign="center" px={2} color="gray.900">
                      {tieBreaker}
                    </Td>
                  )}
                </Tr>
              </Tbody>
            </Table>
          </Box>
        )}
        {club && (
          <Text color="gray.900">
            <Text as="span" fontWeight="bold" color="gray.700">
              Club:
            </Text>{" "}
            {club}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
