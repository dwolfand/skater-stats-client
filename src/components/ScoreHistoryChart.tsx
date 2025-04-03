import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Box, Card } from "@chakra-ui/react";
import dayjs from "../utils/date";
import { SkaterStats } from "../api/client";

interface ScoreHistoryChartProps {
  filteredHistory: SkaterStats["history"];
  themeColors: {
    bg: string;
    accent: string;
    font: string;
  };
  isMobile: boolean;
}

// Helper function to get the effective score
function getEffectiveScore(result: SkaterStats["history"][0]): number {
  if (result.isSixEvent) {
    // For 6.0 scoring, majority is in format "4/1" where 1 is the actual score
    if (result.majority) {
      try {
        const parts = result.majority.split("/");
        return parts.length > 1 ? parseFloat(parts[1]) : 0;
      } catch (error) {
        console.error("Error parsing majority score:", error);
        return 0;
      }
    }
    return 0;
  }
  return result.segmentScore && result.segmentScore > 0
    ? result.segmentScore
    : result.score || 0;
}

const ScoreHistoryChart: React.FC<ScoreHistoryChartProps> = ({
  filteredHistory,
  themeColors,
  isMobile,
}) => {
  // Prepare chart data
  const chartOptions = useMemo(() => {
    if (!filteredHistory.length) return {};

    // Get unique event types
    const eventTypes = Array.from(
      new Set(filteredHistory.map((h) => h.eventType))
    );

    // Group data by event type
    const series = eventTypes.map((eventType, index) => {
      const eventData = filteredHistory
        .filter((h) => h.eventType === eventType)
        // Filter out entries with missing or zero scores
        .filter((h) => {
          const score = getEffectiveScore(h);
          return score !== undefined && score !== null && score > 0;
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((h) => ({
          x: new Date(h.date).getTime(),
          y: getEffectiveScore(h),
          event: h.event,
          competition: h.competition,
          date: h.date,
          placement: h.placement
            ? `${h.placement}${getOrdinalSuffix(h.placement)}`
            : "N/A",
        }));

      // Define colors for different series
      const colors = [
        "#319795", // teal.500
        "#4299E1", // blue.400
        "#9F7AEA", // purple.400
        "#00B5D8", // cyan.500
        "#667EEA", // indigo.400
        "#B794F4", // purple.300
      ];

      return {
        name: eventType,
        data: eventData,
        color: colors[index % colors.length],
        marker: {
          symbol: "circle",
          radius: 4,
        },
      };
    });

    // Filter out series with no valid data points
    const filteredSeries = series.filter((s) => s.data.length > 0);

    return {
      chart: {
        type: "line",
        height: 400,
        zooming: {
          type: "x",
        },
        style: {
          fontFamily: themeColors.font || "inherit",
        },
      },
      title: {
        text: undefined,
      },
      xAxis: {
        type: "datetime",
        labels: {
          format: "{value:%b %Y}",
          rotation: isMobile ? -45 : 0,
          align: isMobile ? "right" : "center",
        },
        tickPixelInterval: isMobile ? 80 : 100,
        startOnTick: true,
        endOnTick: true,
      },
      yAxis: {
        title: {
          text: "Score",
        },
        min: 0,
      },
      tooltip: {
        headerFormat: "<b>{point.x:%b %d, %Y}</b><br/>",
        pointFormat:
          "{point.event}<br/>{point.competition}<br/>{series.name}: <b>{point.y:.2f}</b><br/>Placement: {point.placement}",
        shared: false,
      },
      legend: {
        enabled: true,
        align: "center",
        verticalAlign: "bottom",
      },
      plotOptions: {
        line: {
          marker: {
            enabled: true,
          },
          connectNulls: true,
        },
        series: {
          animation: true,
          states: {
            hover: {
              lineWidthPlus: 0,
              halo: {
                size: 5,
              },
            },
          },
        },
      },
      credits: {
        enabled: false,
      },
      series: filteredSeries,
    };
  }, [filteredHistory, themeColors.font, isMobile]);

  return (
    <Box mb={6}>
      <Card
        p={6}
        border="none"
        bg="white"
        fontFamily={themeColors.font}
        borderWidth="0"
      >
        <Box h="400px">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </Box>
      </Card>
    </Box>
  );
};

// Helper function to format ordinal suffix
function getOrdinalSuffix(placement: string): string {
  const num = parseInt(placement, 10);
  if (isNaN(num)) return "";
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return "th";
  switch (lastDigit) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export default ScoreHistoryChart;
