import axios from "axios";
import { ProfileCustomization } from "../types/auth";
import { trackEvent } from "../utils/analytics";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/dev";

// Create an event emitter for auth events
export const authEvents = new EventTarget();
export const AUTH_UNAUTHORIZED = "auth_unauthorized";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("skater_stats_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling and debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      },
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Dispatch an event to notify that we got an unauthorized response
      authEvents.dispatchEvent(new Event(AUTH_UNAUTHORIZED));
    }

    return Promise.reject(error);
  }
);

export { api };

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
  const { data } = await api.get(`/competition/${year}/${ijsId}/results`, {
    params: { url: eventUrl },
  });
  return data;
}

export interface SearchResult {
  type: "competition" | "skater" | "official" | "club";
  id?: number;
  name: string;
  startDate?: string;
  endDate?: string;
  venue?: string;
  city?: string;
  state?: string;
  timezone?: string;
  year?: string;
  ijsId?: string;
  competition?: string;
  date?: string;
  url?: string;
  function?: string;
  club?: string;
  location?: string;
}

export interface CompetitionSummary {
  type: "upcoming" | "recent" | "in progress";
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
  city: string;
  state: string;
  timezone: string;
  year: string;
  ijsId: string;
  logoRef: string | null;
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
  resultsUrl: string;
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
  resultsUrl: string;
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
  resultsUrl: string;
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
  inProgress: CompetitionSummary[];
  featuredSkaters: {
    id: number;
    name: string;
    club: string | null;
    profileImage: string | null;
    customization?: ProfileCustomization;
  }[];
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

export interface ScoreHistory {
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
  competitionType?: "ijs" | "ijs_nonqual";
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
      secondHalfBonus: boolean;
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

  // 6.0 specific fields
  isSixEvent?: boolean;
  majority?: string;
  tieBreaker?: string;
  judgeScores?: string[];
  club?: string;
  clubId?: number;

  // Additional fields used in Results.tsx
  name?: string;
  skaterId?: number;
  start?: string;
  status?: string;
  eventId?: number;
  competitionId?: number;
  eventCategory?: string;

  // Tossie fields
  id?: number;
  hasTossie?: boolean;
}

export interface SkaterStats {
  name: string;
  club?: string;
  club_id?: number;
  customization?: ProfileCustomization;
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
    placement?: string;
    totalSkaters: number;
    year: number;
    ijsId: string;
    resultsUrl: string;
    status: string;
    eventId: number;
    competitionId: number;
    isSixEvent: boolean;
    majority?: string;
    tieBreaker?: string;
    judgeScores?: string[];
    club?: string;
    judgeDetails?: {
      baseElementsScore: number;
      totalElementScore: number;
      totalComponentScore: number;
      totalDeductions: number;
      totalScore: number;
      elements: any[];
      components: any[];
      deductions: any[];
    };
  }[];
  competitionLocations?: Array<{
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
    type: string;
    description?: string;
  }>;
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
  const { data } = await api.get<OfficialHistoryEntry[]>(
    `/official/${encodeURIComponent(name)}`
  );
  return data;
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
    isSixEvent: boolean;
  }[];
}

export async function getOfficialStats(name: string): Promise<OfficialStats> {
  const { data } = await api.get<OfficialStats>("/official/stats", {
    params: { name },
  });
  return data;
}

export async function getOfficialStatsById(id: number): Promise<OfficialStats> {
  const { data } = await api.get<OfficialStats>("/official/stats", {
    params: { id },
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
  date?: string;
  time?: string;
  timezone?: string;
  status: string;
  segments?: Array<{
    isActive: boolean;
    status: string;
  }>;
  results: ScoreHistory[];
  officials?: Array<{
    function: string;
    name: string;
    location: string;
    id: number;
  }>;
}

export interface SkaterAIAnalysis {
  analysis: string;
}

export const getSkaterAIAnalysis = async (params: {
  name?: string;
  skaterId?: number;
}) => {
  const { data } = await api.get<SkaterAIAnalysis>("/skater/analysis", {
    params,
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
  id: number;
}

interface FeedbackRequest {
  message: string;
  email?: string;
}

export const submitFeedback = async (data: FeedbackRequest) => {
  const { data: response } = await api.post("/feedback", data);
  return response;
};

export async function getSixEventDetails(
  year: string,
  ijsId: string,
  resultsUrl: string
) {
  const { data } = await api.get<SixEventDetails>(
    `/competition/${year}/${ijsId}/six-event/${encodeURIComponent(resultsUrl)}`
  );
  return data;
}

export interface ClubStats {
  name: string;
  totalSkaters: number;
  totalCompetitions: number;
  competitions: Array<{
    name: string;
    date: string;
    year: string;
    ijsId: string;
    skaterCount: number;
  }>;
}

export interface ClubCompetitionDetails {
  clubName: string;
  competitionName: string;
  date: string;
  skaters: Array<{
    id: number;
    name: string;
    events: Array<{
      name: string;
      segment: string;
      placement: string;
      score: number | null;
      majority?: string;
      resultsUrl: string;
      isSixEvent: boolean;
    }>;
  }>;
}

export const getClubStats = async (
  clubId: string,
  competition?: { year: string; ijsId: string }
): Promise<ClubStats | ClubCompetitionDetails> => {
  const params = competition
    ? `?year=${competition.year}&ijsId=${competition.ijsId}`
    : "";
  const { data } = await api.get<ClubStats | ClubCompetitionDetails>(
    `/club/${clubId}${params}`
  );
  return data;
};

export interface TossieRequest {
  eventResultId?: number;
  sixEventResultId?: number;
}

export interface TossieReceipt {
  id: number;
  fromUserId: string;
  fromUserName: string;
  fromUserPicture?: string;
  customProfileImage?: any;
  fromSkaterId?: number;
  fromSkaterName?: string;
  created_at: string;
  eventId: string;
  eventName: string;
  eventYear: number;
  ijsId: string;
  results_url: string;
  resultType: "event" | "six_event";
  is_opened: boolean;
  tossie_type?: string;
}

export const submitTossie = async (data: TossieRequest) => {
  const { data: response } = await api.post("/tossies", data);
  return response;
};

export const getTossieReceipts = async (params: {
  skaterId?: number;
  name?: string;
}): Promise<TossieReceipt[]> => {
  const { data } = await api.get<TossieReceipt[]>("/skater/tossies", {
    params,
  });
  return data;
};

export interface SixEventDetails {
  id: number;
  name: string;
  segment: string;
  status: string | null;
  resultsUrl: string;
  startDate: string;
  endDate: string;
  type: string;
  results: Array<{
    id: number;
    name: string;
    club: string | null;
    club_id: number | null;
    place: string | null;
    judge_scores: string[] | null;
    majority: string | null;
    tie_breaker: string | null;
    start_number: string | null;
    status: string | null;
    skater_id: number;
    six_event_id: number;
    hasTossie: boolean;
  }>;
  officials: Array<{
    function: string;
    name: string;
    location: string;
    id: number;
  }>;
}

export const trackPageView = {
  home: () => trackEvent("view_page", { page_type: "home" }),
  competition: (year: string, ijsId: string, name: string) =>
    trackEvent("view_page", {
      page_type: "competition",
      competition_year: year,
      competition_id: ijsId,
      competition_name: name,
    }),
  event: (year: string, ijsId: string, eventId: string, name: string) =>
    trackEvent("view_page", {
      page_type: "event",
      competition_year: year,
      competition_id: ijsId,
      event_id: eventId,
      event_name: name,
    }),
  skater: (skaterId?: number, name?: string) =>
    trackEvent("view_page", {
      page_type: "skater",
      skater_id: skaterId,
      skater_name: name,
    }),
  official: (name: string) =>
    trackEvent("view_page", {
      page_type: "official",
      official_name: name,
    }),
  featured: () => trackEvent("view_page", { page_type: "featured" }),
};

export interface FeaturedSkater {
  id: number;
  name: string;
  club: string | null;
  profileImage: string | null;
  customization?: ProfileCustomization;
}

export const getFeaturedSkaters = async () => {
  const { data } = await api.get<FeaturedSkater[]>("/featuredSkaters");
  return data;
};

export const changeSkaterClub = async (clubId: string) => {
  const { data } = await api.post<{ message: string }>("/skater/change-club", {
    clubId,
  });
  return data;
};
