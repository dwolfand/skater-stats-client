import fs from "fs";
import path from "path";
import axios from "axios";

const BASE_URL = "https://skater-stats.com";
const API_BASE_URL =
  "https://g42ilwev92.execute-api.us-east-1.amazonaws.com/prod";
const COMPETITIONS_URL = `${API_BASE_URL}/competitions`;
const SKATERS_URL = `${API_BASE_URL}/skaters`;

// Static routes that don't change
const staticRoutes = ["/", "/competitions", "/results", "/overall-stats"];

interface Competition {
  id: number;
  ijsId: string;
  year: string;
  name: string;
  startDate: string;
  endDate: string;
  timezone: string;
  venue: string;
  city: string;
  state: string;
}

interface Skater {
  id: string;
  name: string;
}

function generateSitemapXML(urls: string[]) {
  const xmlUrls = urls
    .map(
      (url) => `
    <url>
      <loc>${BASE_URL}${url}</loc>
      <changefreq>daily</changefreq>
      <priority>0.8</priority>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${xmlUrls}
</urlset>`;
}

async function fetchCompetitions(): Promise<Competition[]> {
  try {
    const response = await axios.get(COMPETITIONS_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching competitions:", error);
    return [];
  }
}

async function fetchSkaters(): Promise<Skater[]> {
  try {
    const response = await axios.get(SKATERS_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching skaters:", error);
    return [];
  }
}

async function generateCompetitionUrls(): Promise<string[]> {
  const competitions = await fetchCompetitions();
  return competitions.map(
    (competition) => `/competition/${competition.year}/${competition.ijsId}`
  );
}

async function generateSkaterUrls(): Promise<string[]> {
  const skaters = await fetchSkaters();
  return skaters.map((skater) => `/skater/id/${skater.id}`);
}

async function generateSitemap() {
  console.log("Fetching competition URLs...");
  const competitionUrls = await generateCompetitionUrls();
  console.log(`Found ${competitionUrls.length} competition URLs`);

  console.log("Fetching skater URLs...");
  const skaterUrls = await generateSkaterUrls();
  console.log(`Found ${skaterUrls.length} skater URLs`);

  const urls = [...staticRoutes, ...competitionUrls, ...skaterUrls];
  const xml = generateSitemapXML(urls);

  // Ensure the public directory exists
  const publicDir = path.join(process.cwd(), "dist");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write the sitemap
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml);
  console.log("Sitemap generated successfully!");
  console.log(`Total URLs: ${urls.length}`);
}

generateSitemap().catch(console.error);
