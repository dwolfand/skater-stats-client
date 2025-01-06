import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const API_PREFIX = import.meta.env.DEV ? "/dev" : "";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getCompetitions = async () => {
  const { data } = await api.get(`${API_PREFIX}/competitions`);
  return data;
};

export const getCompetitionData = async (competitionId: string) => {
  const { data } = await api.get(`${API_PREFIX}/competitions/${competitionId}`);
  return data;
};

export const getEventResults = async (
  competitionId: string,
  resultsUrl: string
) => {
  const { data } = await api.get(
    `${API_PREFIX}/competitions/${competitionId}/results/${encodeURIComponent(
      resultsUrl
    )}`
  );
  return data;
};
