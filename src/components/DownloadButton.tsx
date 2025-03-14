import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Icon,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { FiDownload } from "react-icons/fi";
import { SkaterStats } from "../api/client";
import {
  downloadAsJSON,
  downloadAsCSV,
  convertSkaterStatsToCSV,
} from "../utils/download";

interface DownloadButtonProps {
  data: SkaterStats;
  filename: string;
  colorScheme?: string;
}

export default function DownloadButton({
  data,
  filename,
  colorScheme = "green",
}: DownloadButtonProps) {
  const handleJSONDownload = () => {
    downloadAsJSON(data, `${filename}.json`);
  };

  const handleCSVDownload = () => {
    downloadAsCSV(convertSkaterStatsToCSV(data), `${filename}.csv`);
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        leftIcon={<Icon as={FiDownload} />}
        colorScheme={colorScheme}
      >
        Download Data
      </MenuButton>
      <MenuList>
        <MenuItem onClick={handleJSONDownload}>JSON (Full Data)</MenuItem>
        <MenuItem onClick={handleCSVDownload}>CSV (Summary Data)</MenuItem>
      </MenuList>
    </Menu>
  );
}
