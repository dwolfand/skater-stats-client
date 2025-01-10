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

export interface DefaultEvents {
  upcoming: CompetitionSummary[];
  recent: CompetitionSummary[];
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

export const getDefaultEvents = async () => {
  const { data } = await api.get<DefaultEvents>("/defaultEvents");
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
    eventCategory: string;
    score: number;
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

export const getSkaterStats = async (name: string) => {
  const { data } = await api.get<SkaterStats>("/skater", {
    params: { name },
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
  averageGOE: number;
  componentAverages: {
    name: string;
    average: number;
    count: number;
  }[];
  elementStats: {
    totalElements: number;
    averageGOE: number;
    goeDistribution: {
      range: string;
      count: number;
    }[];
  };
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
