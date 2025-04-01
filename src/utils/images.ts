import { ImageData } from "../types/auth";

// Cache to store the timestamps of recently uploaded images
// Format: { imageUrl: timestamp }
const recentlyUploadedImages: Record<string, number> = {};

/**
 * Flag an image as recently uploaded so we can use the original URL
 * while thumbnails are being generated
 * @param imageUrl - The URL of the uploaded image
 * @param timeoutMs - How long to use the original URL (defaults to 60000ms = 1 min)
 */
export const flagRecentlyUploaded = (
  imageUrl: string,
  timeoutMs: number = 60000
): void => {
  recentlyUploadedImages[imageUrl] = Date.now() + timeoutMs;

  // Set a timeout to clean up the cache entry after the specified time
  setTimeout(() => {
    delete recentlyUploadedImages[imageUrl];
  }, timeoutMs + 1000); // Add 1 second buffer
};

/**
 * Checks if an image was recently uploaded and is still within the timeout period
 * @param imageUrl - The URL of the image to check
 * @returns true if the image is recently uploaded and within timeout period
 */
const isRecentlyUploaded = (imageUrl: string): boolean => {
  const expiryTime = recentlyUploadedImages[imageUrl];
  if (!expiryTime) return false;

  return Date.now() < expiryTime;
};

/**
 * Returns the image URL from either a string or ImageData object
 * @param image - The image source (string URL or ImageData object)
 * @returns The image URL or undefined if image is not provided
 */
export const getImageUrl = (
  image: string | ImageData | undefined
): string | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return addImageOptionsToUrl(image);
  return addImageOptionsToUrl(image.url);
};

/**
 * Returns the thumbnail URL from ImageData object or original URL for string
 * @param image - The image source (string URL or ImageData object)
 * @param size - Thumbnail size ("small" or "medium")
 * @returns The thumbnail URL or original URL if thumbnail is not available
 */
export const getThumbnailUrl = (
  image: string | ImageData | undefined,
  size: "small" | "medium"
): string | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return addImageOptionsToUrl(image);

  // For recently uploaded images, use the original URL while thumbnails are generating
  if (isRecentlyUploaded(image.url)) {
    return addImageOptionsToUrl(image.url);
  }

  // Use thumbnail when available, otherwise fall back to full URL
  if (image.thumbnails && image.thumbnails[size]) {
    return addImageOptionsToUrl(image.thumbnails[size]);
  }
  return addImageOptionsToUrl(image.url);
};

/**
 * Adds options to force proper orientation and prevent caching
 * @param url - The original image URL
 * @returns The URL with additional parameters
 */
function addImageOptionsToUrl(url: string): string {
  // Parse the URL to add a cache-busting timestamp and orientation fix
  try {
    const urlObj = new URL(url);

    // Add a timestamp to prevent caching (for recently uploaded images)
    if (isRecentlyUploaded(url)) {
      urlObj.searchParams.set("_t", Date.now().toString());
    }

    // The auto parameter tells some CDNs (like Cloudinary) to respect orientation
    urlObj.searchParams.set("auto", "format,compress,enhance,orient");

    return urlObj.toString();
  } catch (e) {
    // If the URL can't be parsed, return the original
    return url;
  }
}
