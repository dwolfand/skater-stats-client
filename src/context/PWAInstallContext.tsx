import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { trackPWA } from "../utils/analytics";

// Define the PWA install prompt event interface
declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

interface PWAInstallContextType {
  isInstallable: boolean;
  isPWAInstallBannerVisible: boolean;
  hideBanner: () => void;
  showInstallPrompt: () => Promise<void>;
}

const PWAInstallContext = createContext<PWAInstallContextType>({
  isInstallable: false,
  isPWAInstallBannerVisible: false,
  hideBanner: () => {},
  showInstallPrompt: async () => {},
});

export const usePWAInstall = () => useContext(PWAInstallContext);

interface PWAInstallProviderProps {
  children: React.ReactNode;
}

// Time constants in milliseconds
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Check if the browser supports PWA installation
 * This is a simplified check - the beforeinstallprompt event is the most reliable indicator
 */
const browserSupportsPWA = (): boolean => {
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  // Don't show banner if already installed
  if (isStandalone) return false;

  // Check if it's an iOS device with Safari
  const ua = window.navigator.userAgent;
  const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
  const webkit = !!ua.match(/WebKit/i);
  const iOSSafari = iOS && webkit && !ua.match(/CriOS/i) && !ua.match(/FxiOS/i);

  // Check if it's Chrome on iOS - which doesn't properly support PWA installation
  const isChromeOnIOS = iOS && !!ua.match(/CriOS/i);

  // Don't show banner for Chrome on iOS since it can't properly install PWAs
  if (isChromeOnIOS) return false;

  // iOS Safari supports "Add to Home Screen" but doesn't support beforeinstallprompt
  if (iOSSafari) return true;

  // For other browsers, we'll rely on the beforeinstallprompt event
  // which will be captured in the useEffect
  return "serviceWorker" in navigator;
};

export function PWAInstallProvider({ children }: PWAInstallProviderProps) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isPWAInstallBannerVisible, setIsPWAInstallBannerVisible] =
    useState(false);
  const [visitedPages, setVisitedPages] = useState<Set<string>>(new Set());
  const [dismissCount, setDismissCount] = useState(0);
  const [lastDismissTime, setLastDismissTime] = useState<number | null>(null);
  const [isSupportedBrowser, setIsSupportedBrowser] = useState(false);
  const location = useLocation();

  // Check browser support on mount
  useEffect(() => {
    setIsSupportedBrowser(browserSupportsPWA());
  }, []);

  useEffect(() => {
    // Load state from localStorage
    const loadState = () => {
      const visitedPagesStr = localStorage.getItem("pwa_visited_pages");
      const dismissCountStr = localStorage.getItem("pwa_dismiss_count");
      const lastDismissTimeStr = localStorage.getItem("pwa_last_dismiss_time");

      // Check if it's been more than two weeks since last dismissal
      const parsedLastDismissTime = lastDismissTimeStr
        ? parseInt(lastDismissTimeStr, 10)
        : null;
      const shouldResetDismissCount =
        parsedLastDismissTime &&
        Date.now() - parsedLastDismissTime > TWO_WEEKS_MS;

      if (shouldResetDismissCount) {
        // If it's been more than two weeks, reset the dismiss count
        setDismissCount(0);
        localStorage.removeItem("pwa_dismiss_count");
        console.log("Reset PWA dismiss count after two weeks");
      } else if (dismissCountStr) {
        // Otherwise use the stored dismiss count
        setDismissCount(parseInt(dismissCountStr, 10));
      }

      if (visitedPagesStr) {
        setVisitedPages(new Set(JSON.parse(visitedPagesStr)));
      }

      if (lastDismissTimeStr) {
        setLastDismissTime(parsedLastDismissTime);
      }
    };

    loadState();
  }, []);

  // Track unique page visits
  useEffect(() => {
    const pathname = location.pathname;

    if (!visitedPages.has(pathname)) {
      const newVisitedPages = new Set(visitedPages);
      newVisitedPages.add(pathname);
      setVisitedPages(newVisitedPages);

      // Save to localStorage
      localStorage.setItem(
        "pwa_visited_pages",
        JSON.stringify(Array.from(newVisitedPages))
      );
    }
  }, [location.pathname, visitedPages]);

  // Listen for beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      window.deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Determine if banner should be shown
  useEffect(() => {
    if ((!isInstallable && !isSupportedBrowser) || dismissCount >= 5) {
      setIsPWAInstallBannerVisible(false);
      return;
    }

    // Check if we should reset the dismiss count based on time
    if (lastDismissTime && Date.now() - lastDismissTime > TWO_WEEKS_MS) {
      setDismissCount(0);
      localStorage.removeItem("pwa_dismiss_count");
    }

    const shouldShowBanner =
      visitedPages.size >= 5 &&
      (lastDismissTime === null || Date.now() - lastDismissTime > TWO_HOURS_MS);

    if (shouldShowBanner && !isPWAInstallBannerVisible) {
      setIsPWAInstallBannerVisible(true);
      trackPWA.bannerShown();
    } else if (!shouldShowBanner && isPWAInstallBannerVisible) {
      setIsPWAInstallBannerVisible(false);
    }
  }, [
    visitedPages.size,
    isInstallable,
    isSupportedBrowser,
    dismissCount,
    lastDismissTime,
    isPWAInstallBannerVisible,
  ]);

  const hideBanner = () => {
    setIsPWAInstallBannerVisible(false);
    const newDismissCount = dismissCount + 1;
    setDismissCount(newDismissCount);
    setLastDismissTime(Date.now());

    // Save to localStorage
    localStorage.setItem("pwa_dismiss_count", newDismissCount.toString());
    localStorage.setItem("pwa_last_dismiss_time", Date.now().toString());

    // Track banner dismissal
    trackPWA.bannerDismissed();
  };

  const showInstallPrompt = async () => {
    // For iOS Safari which doesn't support the beforeinstallprompt event
    if (isSupportedBrowser && !window.deferredPrompt) {
      trackPWA.installClicked();
      // Just hide the banner - can't programmatically trigger install on iOS
      hideBanner();
      return;
    }

    if (!window.deferredPrompt) {
      return;
    }

    // Track install button click
    trackPWA.installClicked();

    // Show the install prompt
    await window.deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const choiceResult = await window.deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
      trackPWA.installAccepted();
    } else {
      console.log("User dismissed the install prompt");
      trackPWA.installRejected();
    }

    // Clear the saved prompt since it can't be used again
    window.deferredPrompt = null;
    setIsInstallable(false);
    setIsPWAInstallBannerVisible(false);
  };

  return (
    <PWAInstallContext.Provider
      value={{
        isInstallable,
        isPWAInstallBannerVisible,
        hideBanner,
        showInstallPrompt,
      }}
    >
      {children}
    </PWAInstallContext.Provider>
  );
}
