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
