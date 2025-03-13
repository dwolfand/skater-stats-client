import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Add service worker message handler
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data.type === "RELOAD_PAGE") {
      window.location.reload();
    }
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
