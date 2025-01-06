export interface Competition {
  id: string;
  name: string;
  date: string;
}

export interface Event {
  date: string;
  time: string;
  event: string;
  status: string;
  resultsUrl: string;
}

export interface SixEvent {
  event: string;
  segment: string;
  resultsUrl: string;
}

export interface CompetitionData {
  events: Event[];
  sixEvents: SixEvent[];
  competitionId: string;
}

export interface Element {
  planned: string;
  executed: string;
  baseValue: string;
  goe: string;
  score: string;
}

export interface Component {
  name: string;
  score: string;
  factor: string;
}

export interface Deduction {
  name: string;
  value: string;
}

export interface ProgramDetails {
  totalScore: string;
  executedElements: string;
  programComponents: string;
  deductions: string;
  elements: Element[];
  components: Component[];
  deductionDetails: Deduction[];
}

export interface Result {
  place: string;
  start: string;
  name: string;
  club: string;
  score: string;
  details: ProgramDetails;
}

export interface EventResults {
  eventName: string;
  results: Result[];
  competitionId: string;
}
