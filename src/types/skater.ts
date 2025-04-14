export interface SkaterHistoryEntry {
  eventType: string;
  eventLevel: string;
  isSixEvent: boolean;
  competition: string;
  event: string;
  date: string;
  year: string;
  ijsId: string;
  resultsUrl: string;
  score: number;
  segmentScore?: number;
  placement?: string;
  club?: string;
  majority?: string;
  tieBreaker?: string;
  judgeScores?: any;
  judgeDetails?: {
    elements?: Array<{
      elementCode?: string;
      name?: string;
      plannedElement?: string;
      executedElement?: string;
      value?: number;
      score?: number;
      goe?: number;
      judgesGoe?: any[];
      judges?: any[];
    }>;
  };
}
