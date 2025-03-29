// Google Analytics event tracking utility

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: any) => void;
  }
}

export const trackEvent = (
  eventName: string,
  eventParams: Record<string, any> = {}
) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

// Page view events
export const trackPageView = {
  home: () => {
    trackEvent("view_page", { page_type: "home" });
  },
  competition: (year: string, ijsId: string, name: string) => {
    trackEvent("view_page", {
      page_type: "competition",
      competition_year: year,
      competition_id: ijsId,
      competition_name: name,
    });
  },
  event: (year: string, ijsId: string, eventId: string, name: string) => {
    trackEvent("view_page", {
      page_type: "event",
      competition_year: year,
      competition_id: ijsId,
      event_id: eventId,
      event_name: name,
    });
  },
  skater: (skaterId?: number, name?: string) => {
    trackEvent("view_page", {
      page_type: "skater",
      skater_id: skaterId,
      skater_name: name,
    });
  },
  official: (name: string) => {
    trackEvent("view_page", {
      page_type: "official",
      official_name: name,
    });
  },
};

// Favorite-related events
export const trackFavoriteAction = (
  action: "add" | "remove",
  itemType: "competition" | "event" | "skater",
  itemName: string
) => {
  trackEvent("favorite_action", {
    action,
    item_type: itemType,
    item_name: itemName,
  });
};

// Tossie-related events
export const trackTossieLoginPrompt = (skaterName: string) => {
  trackEvent("tossie_login_prompt", {
    skater_name: skaterName,
  });
};

export const trackTossieLogin = () => {
  trackEvent("tossie_login_success");
};

// Login events
export const trackLogin = (source: "tossie" | "profile" | "other") => {
  trackEvent("user_login", {
    login_source: source,
  });
};

// PWA install tracking
export const trackPWA = {
  bannerShown: () => {
    trackEvent("pwa_banner_shown");
  },
  bannerDismissed: () => {
    trackEvent("pwa_banner_dismissed");
  },
  installClicked: () => {
    trackEvent("pwa_install_clicked");
  },
  installAccepted: () => {
    trackEvent("pwa_install_accepted");
  },
  installRejected: () => {
    trackEvent("pwa_install_rejected");
  },
};
