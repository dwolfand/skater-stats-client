// @jest-environment jsdom
import { getImageUrl, getThumbnailUrl, flagRecentlyUploaded } from "../images";
import { ImageData } from "../../types/auth";

// Add Jest types and disable linting errors
/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="jest" />

describe("Image utilities", () => {
  describe("getImageUrl", () => {
    it("should return undefined for undefined input", () => {
      expect(getImageUrl(undefined)).toBeUndefined();
    });

    it("should return the string URL directly", () => {
      const url = "https://example.com/image.jpg";
      expect(getImageUrl(url)).toBe(url);
    });

    it("should extract the URL from an ImageData object", () => {
      const imageData: ImageData = {
        url: "https://example.com/image.jpg",
        thumbnails: {
          small: "https://example.com/thumbnails/small/image.jpg",
          medium: "https://example.com/thumbnails/medium/image.jpg",
        },
      };
      expect(getImageUrl(imageData)).toBe(imageData.url);
    });
  });

  describe("getThumbnailUrl", () => {
    it("should return undefined for undefined input", () => {
      expect(getThumbnailUrl(undefined, "small")).toBeUndefined();
    });

    it("should return the string URL directly", () => {
      const url = "https://example.com/image.jpg";
      expect(getThumbnailUrl(url, "small")).toBe(url);
    });

    it("should return the small thumbnail URL when available", () => {
      const imageData: ImageData = {
        url: "https://example.com/image.jpg",
        thumbnails: {
          small: "https://example.com/thumbnails/small/image.jpg",
          medium: "https://example.com/thumbnails/medium/image.jpg",
        },
      };
      expect(getThumbnailUrl(imageData, "small")).toBe(
        imageData.thumbnails.small
      );
    });

    it("should return the medium thumbnail URL when available", () => {
      const imageData: ImageData = {
        url: "https://example.com/image.jpg",
        thumbnails: {
          small: "https://example.com/thumbnails/small/image.jpg",
          medium: "https://example.com/thumbnails/medium/image.jpg",
        },
      };
      expect(getThumbnailUrl(imageData, "medium")).toBe(
        imageData.thumbnails.medium
      );
    });

    it("should return the original URL when thumbnails are not available", () => {
      const imageData: ImageData = {
        url: "https://example.com/image.jpg",
      };
      expect(getThumbnailUrl(imageData, "small")).toBe(imageData.url);
    });

    it("should return the original URL for recently uploaded images", () => {
      const imageData: ImageData = {
        url: "https://example.com/new-image.jpg",
        thumbnails: {
          small: "https://example.com/thumbnails/small/new-image.jpg",
          medium: "https://example.com/thumbnails/medium/new-image.jpg",
        },
      };

      // Flag the image as recently uploaded
      flagRecentlyUploaded(imageData.url);

      // Should use original URL even though thumbnails are available
      expect(getThumbnailUrl(imageData, "small")).toBe(imageData.url);
      expect(getThumbnailUrl(imageData, "medium")).toBe(imageData.url);
    });

    it("should use thumbnails after the timeout expires", async () => {
      const imageData: ImageData = {
        url: "https://example.com/timeout-image.jpg",
        thumbnails: {
          small: "https://example.com/thumbnails/small/timeout-image.jpg",
          medium: "https://example.com/thumbnails/medium/timeout-image.jpg",
        },
      };

      // Flag with a very short timeout (100ms)
      flagRecentlyUploaded(imageData.url, 100);

      // Should use original URL initially
      expect(getThumbnailUrl(imageData, "small")).toBe(imageData.url);

      // Wait for the timeout to expire
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should now use the thumbnail URL
      expect(getThumbnailUrl(imageData, "small")).toBe(
        imageData.thumbnails.small
      );
    });
  });
});
