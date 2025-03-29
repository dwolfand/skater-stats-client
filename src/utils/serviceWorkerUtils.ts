export const registerServiceWorkerUpdateHandlers = () => {
  if ("serviceWorker" in navigator) {
    // Check for updates every minute
    const updateInterval = setInterval(() => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.update().catch((error) => {
          console.error("Failed to update service worker:", error);
        });
      });
    }, 60000); // 1 minute

    // Listen for the controllerchange event (new service worker activated)
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;

      // Show notification to user
      if (confirm("New version available! Reload to update?")) {
        window.location.reload();
      }
    });

    return () => {
      clearInterval(updateInterval);
    };
  }

  return () => {}; // Empty cleanup function if service worker not supported
};

// Force clear all caches and unregister service worker
export const clearServiceWorkerCache = async () => {
  if ("serviceWorker" in navigator) {
    // Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }

    // Clear all caches
    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map((key) => caches.delete(key)));
    }

    console.log("Service worker cache cleared");
    return true;
  }
  return false;
};

// Expose cache clear function to window for manual use
if (typeof window !== "undefined") {
  (window as any).clearCache = clearServiceWorkerCache;
}
