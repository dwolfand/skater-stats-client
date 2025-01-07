const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/dev";

export async function getCompetitions() {
  const response = await fetch(`${API_URL}/competitions`);
  if (!response.ok) {
    throw new Error("Failed to fetch competitions");
  }
  return response.json();
}

export async function getCompetition(year: string, ijsId: string) {
  const response = await fetch(`${API_URL}/competitions/${year}/${ijsId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch competition");
  }
  return response.json();
}

export async function getResults(resultsUrl: string) {
  const response = await fetch(
    `${API_URL}/results?url=${encodeURIComponent(resultsUrl)}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch results");
  }
  return response.json();
}
