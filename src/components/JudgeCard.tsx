import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Grid,
  GridItem,
  Divider,
  VStack,
} from "@chakra-ui/react";
import { getSymbolInfo } from "../utils/ijsSymbols";
import HoverTooltip from "./shared/HoverTooltip";

type JudgeDetails = {
  baseElementsScore: number;
  totalElementScore: number;
  totalComponentScore: number;
  totalDeductions: number;
  totalScore: number;
  elements: {
    number: number;
    elementCode: string;
    info?: string;
    baseValue: number;
    credit: boolean;
    goe: number;
    judgesGoe: number[];
    value: number;
    plannedElement: string;
    executedElement: string;
    secondHalfBonus?: boolean;
  }[];
  components: {
    name: string;
    factor: number;
    judgesScores: number[];
    value: number;
  }[];
  deductions: {
    name: string;
    value: number;
  }[];
};

interface JudgeCardProps {
  details: JudgeDetails;
}

function ElementTooltip({ element }: { element: JudgeDetails["elements"][0] }) {
  if (!element.plannedElement && !element.executedElement) {
    return <>{element.elementCode}</>;
  }

  const hasChange = element.plannedElement !== element.executedElement;

  return (
    <HoverTooltip
      text={
        <VStack align="start" spacing={1} p={2}>
          {element.plannedElement && (
            <Text fontSize="sm">
              <Text as="span" fontWeight="bold" color="blue.400">
                Planned:{" "}
              </Text>
              {element.plannedElement}
            </Text>
          )}
          {element.executedElement && hasChange && (
            <Text fontSize="sm">
              <Text
                as="span"
                fontWeight="bold"
                color={hasChange ? "orange.400" : "blue.400"}
              >
                Executed:{" "}
              </Text>
              {element.executedElement}
            </Text>
          )}
        </VStack>
      }
    >
      {element.elementCode}
    </HoverTooltip>
  );
}

function SecondHalfBonusTooltip() {
  return (
    <HoverTooltip label="Second Half Bonus">
      <Text as="span" fontSize="xs" color="gray.500">
        x
      </Text>
    </HoverTooltip>
  );
}

function InfoTooltip({ info }: { info: string }) {
  const symbolInfo = getSymbolInfo(info);

  if (!symbolInfo) {
    return <>{info}</>;
  }

  return (
    <HoverTooltip
      text={
        <VStack align="start" spacing={1} p={2}>
          <Text fontSize="sm">
            <Text as="span" fontWeight="bold" color="blue.400">
              {symbolInfo.symbol}:{" "}
            </Text>
            {symbolInfo.description}
          </Text>
        </VStack>
      }
    >
      {info}
    </HoverTooltip>
  );
}

export default function JudgeCard({ details }: JudgeCardProps) {
  const hasElements = details.elements.length > 0;
  const hasElementScore = details.totalElementScore > 0;
  const hasInfoContent = details.elements.some((element) => element.info);

  return (
    <Box p={4} bg="gray.50" borderRadius="md" fontSize="sm">
      {/* Total Scores Summary */}
      <Grid
        templateColumns={`repeat(${hasElementScore ? 4 : 3}, 1fr)`}
        gap={4}
        mb={4}
      >
        <GridItem>
          <Text fontWeight="bold" fontSize="sm" color="gray.600">
            Total Segment Score
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {details.totalScore && details.totalScore.toFixed(2)}
          </Text>
        </GridItem>
        {hasElementScore && (
          <GridItem>
            <Text fontWeight="bold" fontSize="sm" color="gray.600">
              Total Element Score
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {details.totalElementScore.toFixed(2)}
            </Text>
          </GridItem>
        )}
        <GridItem>
          <Text fontWeight="bold" fontSize="sm" color="gray.600">
            Total Component Score
          </Text>
          <Text fontSize="xl" fontWeight="bold">
            {details.totalComponentScore.toFixed(2)}
          </Text>
        </GridItem>
        <GridItem>
          <Text fontWeight="bold" fontSize="sm" color="gray.600">
            Deductions
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="red.500">
            -{details.totalDeductions.toFixed(2)}
          </Text>
        </GridItem>
      </Grid>

      <Divider my={4} />

      {/* Elements Table */}
      {hasElements && (
        <>
          <Text fontWeight="bold" mb={2} color="gray.700">
            Elements
          </Text>
          <Box overflowX="auto">
            <Table size="sm" mb={4} variant="simple" colorScheme="gray">
              <Thead>
                <Tr bg="gray.100">
                  <Th>#</Th>
                  <Th>Element</Th>
                  {hasInfoContent && <Th>Info</Th>}
                  <Th isNumeric pr={1}>
                    Base
                  </Th>
                  <Th p={0} width="8px"></Th>
                  <Th isNumeric>GOE</Th>
                  {[...Array(details.elements[0]?.judgesGoe.length || 0)].map(
                    (_, i) => (
                      <Th key={i}>J{i + 1}</Th>
                    )
                  )}
                  <Th isNumeric>Score</Th>
                </Tr>
              </Thead>
              <Tbody>
                {details.elements.map((element, index) => (
                  <Tr key={index}>
                    <Td>{element.number}</Td>
                    <Td>
                      <ElementTooltip element={element} />
                    </Td>
                    {hasInfoContent && (
                      <Td>
                        {element.info ? (
                          <InfoTooltip info={element.info} />
                        ) : (
                          ""
                        )}
                      </Td>
                    )}
                    <Td isNumeric pr={1}>
                      {element.baseValue.toFixed(2)}
                    </Td>
                    <Td p={0}>
                      {element.secondHalfBonus && <SecondHalfBonusTooltip />}
                    </Td>
                    <Td
                      isNumeric
                      color={
                        element.goe < 0
                          ? "red.500"
                          : element.goe > 0
                          ? "green.500"
                          : undefined
                      }
                    >
                      {element.goe > 0 ? "+" : ""}
                      {element.goe.toFixed(2)}
                    </Td>
                    {element.judgesGoe.map((goe, j) => (
                      <Td
                        key={j}
                        color={
                          goe < 0
                            ? "red.500"
                            : goe > 0
                            ? "green.500"
                            : undefined
                        }
                      >
                        {goe > 0 ? "+" : ""}
                        {goe}
                      </Td>
                    ))}
                    <Td isNumeric fontWeight="medium">
                      {element.value.toFixed(2)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}

      {/* Components Table */}
      {details.components.length > 0 && (
        <>
          <Text fontWeight="bold" mb={2} color="gray.700">
            Program Components
          </Text>
          <Box overflowX="auto">
            <Table size="sm" mb={4} variant="simple" colorScheme="gray">
              <Thead>
                <Tr bg="gray.100">
                  <Th>Component</Th>
                  <Th>Factor</Th>
                  {[
                    ...Array(details.components[0]?.judgesScores.length || 0),
                  ].map((_, i) => (
                    <Th key={i}>J{i + 1}</Th>
                  ))}
                  <Th isNumeric>Score</Th>
                </Tr>
              </Thead>
              <Tbody>
                {details.components.map((component, index) => (
                  <Tr key={index}>
                    <Td>{component.name}</Td>
                    <Td>{component.factor.toFixed(2)}</Td>
                    {component.judgesScores.map((score, j) => (
                      <Td key={j}>{score.toFixed(2)}</Td>
                    ))}
                    <Td isNumeric fontWeight="medium">
                      {component.value.toFixed(2)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </>
      )}

      {/* Deductions */}
      {details.deductions.length > 0 && (
        <>
          <Text fontWeight="bold" mb={2} color="gray.700">
            Deductions
          </Text>
          <Table size="sm" variant="simple" colorScheme="gray">
            <Thead>
              <Tr bg="gray.100">
                <Th>Description</Th>
                <Th isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {details.deductions.map((deduction, index) => (
                <Tr key={index}>
                  <Td>{deduction.name}</Td>
                  <Td
                    isNumeric
                    color={deduction.value !== 0 ? "red.500" : undefined}
                    fontWeight="medium"
                  >
                    -{deduction.value.toFixed(2)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      )}
    </Box>
  );
}
