import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:4000/dev";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getCompetitions = async () => {
  const { data } = await api.get("/competitions");
  return data;
};

export const getCompetitionData = async (year: string, ijsId: string) => {
  const { data } = await api.get(`/competition/${year}/${ijsId}`);
  return data;
};

export async function getEventResults(
  year: string,
  ijsId: string,
  eventUrl: string
) {
  console.log("Fetching results for:", { year, ijsId, eventUrl });
  const response = await fetch(
    `${API_BASE_URL}/competition/${year}/${ijsId}/results?url=${encodeURIComponent(
      eventUrl
    )}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch event results");
  }
  return response.json();
}

export interface SearchResult {
  type: "competition" | "skater" | "official";
  name: string;
  id?: number; // skater ID for skater results
  // Competition fields
  startDate?: string;
  endDate?: string;
  venue?: string;
  city?: string;
  state?: string;
  timezone?: string;
  year?: string;
  ijsId?: string;
  // Skater/Official fields
  competition?: string;
  date?: string;
  url?: string;
  function?: string;
}

export interface CompetitionSummary {
  type: "upcoming" | "recent";
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  state: string;
  timezone: string;
  year: string;
  ijsId: string;
}

export interface TopScore {
  skaterName: string;
  skaterId?: number;
  score: number;
  competition: string;
  date: string;
  year: string;
  ijsId: string;
  eventName: string;
}

export interface TopElement {
  skaterName: string;
  skaterId?: number;
  elementName: string;
  goe: number;
  competition: string;
  date: string;
  year: string;
  ijsId: string;
  eventName: string;
}

export interface TopComponent {
  skaterName: string;
  skaterId?: number;
  componentName: string;
  score: number;
  competition: string;
  date: string;
  year: string;
  ijsId: string;
  eventName: string;
}

export interface TopStats {
  bestScores: TopScore[];
  bestGOEs: {
    [elementType: string]: TopElement[];
  };
  bestComponents: {
    [componentName: string]: TopComponent[];
  };
}

export interface OverallStats {
  upcoming: CompetitionSummary[];
  recent: CompetitionSummary[];
  topStats: TopStats;
}

export const searchEvents = async (
  query: string,
  type?: "competition" | "skater"
) => {
  const { data } = await api.get<SearchResult[]>("/search", {
    params: { query, type },
  });
  return data;
};

export const getOverallStats = async () => {
  const { data } = await api.get<OverallStats>("/overallStats");
  return data;
};

export interface SkaterStats {
  name: string;
  totalEvents: number;
  totalCompetitions: number;
  averageScore: number | null;
  history: {
    date: string;
    competition: string;
    event: string;
    eventType: string;
    eventLevel: string;
    score: number;
    segmentScore?: number;
    placement: string;
    totalSkaters: number;
    year: string;
    ijsId: string;
    resultsUrl: string;
    judgeDetails?: {
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
  }[];
  placementDistribution: {
    range: string;
    count: number;
  }[];
}

export const getSkaterStats = async (params: {
  name?: string;
  skaterId?: number;
}) => {
  const { data } = await api.get<SkaterStats>("/skater", {
    params,
  });
  return data;
};

export interface OfficialHistoryEntry {
  date: string;
  competition: string;
  function: string;
}

export async function getOfficialHistory(
  name: string
): Promise<OfficialHistoryEntry[]> {
  const response = await fetch(
    `${API_BASE_URL}/official/${encodeURIComponent(name)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch official history");
  }
  return response.json();
}

export interface OfficialStats {
  name: string;
  totalEvents: number;
  totalCompetitions: number;
  mostRecentLocation: string;
  firstEventDate: string;
  averageGOE: number;
  elementStats: {
    totalElements: number;
    averageGOE: number;
    goeDistribution: {
      range: string;
      count: number;
    }[];
  };
  componentAverages: {
    name: string;
    average: number;
    count: number;
  }[];
  history: {
    date: string;
    competition: string;
    function: string;
    location: string;
    year: string;
    ijsId: string;
    eventName: string;
    resultsUrl: string;
  }[];
}

export async function getOfficialStats(name: string): Promise<OfficialStats> {
  const { data } = await api.get<OfficialStats>("/official/stats", {
    params: { name },
  });
  return data;
}

export interface Result {
  place: string;
  start: string;
  name: string;
  club: string;
  score: string;
  skaterId?: number;
  details: {
    totalScore: string;
    executedElements: string;
    programComponents: string;
    deductions: string;
    baseElements: string;
    bonus?: string | null;
    elements: {
      planned: string;
      executed: string;
      baseValue: string;
      goe: string;
      score: string;
    }[];
    components: {
      name: string;
      factor: string;
      score: string;
    }[];
    deductionDetails: {
      name: string;
      value: string;
    }[];
  };
  judgeDetailsUrl?: string;
  judgeDetails?: JudgeDetails;
}

export interface EventResults {
  eventName: string;
  competitionTitle: string;
  results: Result[];
  competitionId: string;
  judgeDetailsUrl?: string | null;
  officials: Official[];
  segments: Array<{
    title: string;
    isActive: boolean;
    url: string;
    status: string;
  }>;
}

export interface SkaterAIAnalysis {
  analysis: string;
}

export const getSkaterAIAnalysis = async (name: string) => {
  const { data } = await api.get<SkaterAIAnalysis>("/skater/analysis", {
    params: { name },
  });
  return data;
};

export interface JudgeDetails {
  event: {
    name: string;
    date: string;
    category: string;
    segment: string;
  };
  skater: {
    place: number;
    name: string;
    club: string;
    totalScore: number;
    elementScore: number;
    componentScore: number;
    deductions: number;
    baseElements: number;
    totalBonus: number;
  };
  elements: JudgeElement[];
  components: JudgeComponent[];
  deductionDetails: JudgeDeduction[];
}

export interface JudgeElement {
  number: number;
  name: string;
  info: string;
  baseValue: number;
  goe: number;
  judges: number[];
  score: number;
  secondHalfBonus: boolean;
  refValue: string | null;
}

export interface JudgeComponent {
  name: string;
  factor: number;
  judges: number[];
  score: number;
}

export interface JudgeDeduction {
  name: string;
  value: number;
}

export interface Official {
  function: string;
  name: string;
  location: string;
}
