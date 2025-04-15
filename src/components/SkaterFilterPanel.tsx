import React from "react";
import {
  Box,
  ButtonGroup,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Select,
  Flex,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DownloadButton from "./DownloadButton";

interface SkaterFilterPanelProps {
  isLoadingAnalysis: boolean;
  loadingMessageIndex: number;
  loadingMessages: string[];
  aiAnalysis: any;
  isAnalysisError: boolean;
  refetchAnalysis: () => void;
  uniqueValues: {
    eventTypes: string[];
    eventLevels: string[];
  };
  selectedEventTypes: string[];
  setSelectedEventTypes: React.Dispatch<React.SetStateAction<string[]>>;
  selectedEventLevels: string[];
  setSelectedEventLevels: React.Dispatch<React.SetStateAction<string[]>>;
  stats: any;
  filename: string;
}

const SkaterFilterPanel: React.FC<SkaterFilterPanelProps> = ({
  isLoadingAnalysis,
  loadingMessageIndex,
  loadingMessages,
  aiAnalysis,
  isAnalysisError,
  refetchAnalysis,
  uniqueValues,
  selectedEventTypes,
  setSelectedEventTypes,
  selectedEventLevels,
  setSelectedEventLevels,
  stats,
  filename,
}) => {
  return (
    <Box mb={1} mt={0} pt={0}>
      <ButtonGroup mb={3} spacing={2}>
        <Button
          colorScheme="blue"
          isLoading={isLoadingAnalysis}
          onClick={() => refetchAnalysis()}
          leftIcon={isLoadingAnalysis ? <Spinner size="sm" /> : undefined}
          isDisabled={!!aiAnalysis}
        >
          {aiAnalysis ? "Analysis Complete" : "Get AI Analysis"}
        </Button>
        <DownloadButton data={stats} filename={filename} />
      </ButtonGroup>
      {isLoadingAnalysis && (
        <Alert status="info" mb={3}>
          <AlertIcon />
          <Box>
            <AlertTitle color="initial">Analyzing Data</AlertTitle>
            <AlertDescription color="initial">
              {loadingMessages[loadingMessageIndex]}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      {aiAnalysis && (
        <Alert
          status="info"
          variant="left-accent"
          flexDirection="column"
          alignItems="flex-start"
          mb={3}
        >
          <AlertTitle mb={1} color="initial">
            AI Analysis
          </AlertTitle>
          <AlertDescription width="100%" color="initial">
            <Box className="markdown-content" color="initial">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiAnalysis.analysis}
              </ReactMarkdown>
            </Box>
          </AlertDescription>
        </Alert>
      )}
      {isAnalysisError && (
        <Alert status="error" mb={3}>
          <AlertIcon />
          <AlertDescription>
            Failed to get AI analysis. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Filter Controls */}
      <Box>
        <Flex gap={4} direction={{ base: "column", md: "row" }}>
          <Box flex={1}>
            <Select
              placeholder="Event Types"
              value=""
              variant="filled"
              focusBorderColor="blue.500"
              bg="white"
              color="gray.800"
              _placeholder={{ color: "gray.500" }}
              boxShadow="md"
              _hover={{ bg: "white" }}
              _focus={{ bg: "white" }}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setSelectedEventTypes([]);
                } else if (!selectedEventTypes.includes(value)) {
                  setSelectedEventTypes([...selectedEventTypes, value]);
                }
              }}
              mb={2}
            >
              {uniqueValues.eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Flex gap={2} flexWrap="wrap">
              {selectedEventTypes.map((type) => (
                <Badge
                  key={type}
                  colorScheme="brand"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  p={1}
                >
                  {type}
                  <IconButton
                    aria-label="Remove filter"
                    icon={<CloseIcon boxSize={2} />}
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      setSelectedEventTypes(
                        selectedEventTypes.filter((t) => t !== type)
                      )
                    }
                  />
                </Badge>
              ))}
            </Flex>
          </Box>
          <Box flex={1}>
            <Select
              placeholder="Event Levels"
              value=""
              variant="filled"
              focusBorderColor="blue.500"
              bg="white"
              color="gray.800"
              _placeholder={{ color: "gray.500" }}
              boxShadow="md"
              _hover={{ bg: "white" }}
              _focus={{ bg: "white" }}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setSelectedEventLevels([]);
                } else if (!selectedEventLevels.includes(value)) {
                  setSelectedEventLevels([...selectedEventLevels, value]);
                }
              }}
              mb={2}
            >
              {uniqueValues.eventLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
            <Flex gap={2} flexWrap="wrap">
              {selectedEventLevels.map((level) => (
                <Badge
                  key={level}
                  colorScheme="brand"
                  display="flex"
                  alignItems="center"
                  gap={1}
                  p={1}
                >
                  {level}
                  <IconButton
                    aria-label="Remove filter"
                    icon={<CloseIcon boxSize={2} />}
                    size="xs"
                    variant="ghost"
                    onClick={() =>
                      setSelectedEventLevels(
                        selectedEventLevels.filter((l) => l !== level)
                      )
                    }
                  />
                </Badge>
              ))}
            </Flex>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
};

export default SkaterFilterPanel;
