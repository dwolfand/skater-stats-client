import { ImageData } from "../types/auth";

// Key for recently uploaded images in localStorage
const RECENTLY_UPLOADED_KEY = "recently_uploaded_images";

/**
 * Cache the fact that an image was just uploaded
 * This is used to prefer the main image URL for recently uploaded images
 * while CloudFront thumbnail distribution is still in progress
 */
export function flagRecentlyUploaded(imageUrl: string): void {
  try {
    // Store image URLs with a timestamp
    const recentlyUploaded = getRecentlyUploaded();
    recentlyUploaded[imageUrl] = Date.now();

    // Prune old entries (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const url in recentlyUploaded) {
      if (recentlyUploaded[url] < oneHourAgo) {
        delete recentlyUploaded[url];
      }
    }

    localStorage.setItem(
      RECENTLY_UPLOADED_KEY,
      JSON.stringify(recentlyUploaded)
    );
  } catch (e) {
    // Ignore errors with localStorage
    console.warn("Failed to save recently uploaded image", e);
  }
}

/**
 * Get the map of recently uploaded images
 */
function getRecentlyUploaded(): Record<string, number> {
  try {
    const stored = localStorage.getItem(RECENTLY_UPLOADED_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Check if an image was recently uploaded
 */
function isRecentlyUploaded(imageUrl: string): boolean {
  const recentlyUploaded = getRecentlyUploaded();
  return !!recentlyUploaded[imageUrl];
}

/**
 * Get image URL, preferring the full image for recently uploaded images
 * and the thumbnail otherwise
 */
export function getImageUrl(imageData: ImageData | undefined): string {
  if (!imageData) return "";
  return imageData.url;
}

/**
 * Get thumbnail URL for an image, falling back to the full image
 * if thumbnails aren't available or if the image was recently uploaded
 */
export function getThumbnailUrl(
  imageData: ImageData | string | undefined | null,
  size: "small" | "medium"
): string {
  if (!imageData) return "";

  // If imageData is a string, return it directly
  if (typeof imageData === "string") {
    return imageData;
  }

  // If this is a recently uploaded image, use the full URL
  // This is because CloudFront distribution of thumbnails may take some time
  if (isRecentlyUploaded(imageData.url)) {
    return imageData.url;
  }

  // Otherwise use the thumbnail if available
  if (imageData.thumbnails && imageData.thumbnails[size]) {
    return imageData.thumbnails[size];
  }

  // Fall back to the full image
  return imageData.url;
}
