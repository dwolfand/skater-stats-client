export interface JudgeDetails {
  baseElementsScore: number;
  totalElementScore: number;
  totalComponentScore: number;
  totalDeductions: number;
  totalScore: number;
  elements: Array<{
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
  }>;
  components: Array<{
    name: string;
    factor: number;
    judgesScores: number[];
    value: number;
  }>;
  deductions: Array<{
    name: string;
    value: number;
  }>;
}

export interface SkaterHistoryEntry {
  date: string;
  competition: string;
  event: string;
  eventType: string;
  eventLevel: string;
  score: number;
  segmentScore?: number;
  placement?: string;
  totalSkaters: number;
  year: number | string;
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
  judgeDetails?: JudgeDetails;
}
