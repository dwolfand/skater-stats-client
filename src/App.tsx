import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { LoginModalProvider } from "./components/LoginModal";
import { FeedbackModalProvider } from "./components/FeedbackModal";
import { PWAInstallProvider } from "./context/PWAInstallContext";
import { useEffect } from "react";
import { registerServiceWorkerUpdateHandlers } from "./utils/serviceWorkerUtils";
import theme from "./theme";
import Routes from "./Routes";
import Layout from "./components/Layout";

// Create a client
const queryClient = new QueryClient();

function App() {
  // Register service worker update handlers
  useEffect(() => {
    const cleanup = registerServiceWorkerUpdateHandlers();
    return cleanup;
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoginModalProvider>
              <FeedbackModalProvider>
                <PWAInstallProvider>
                  <Layout>
                    <Routes />
                  </Layout>
                </PWAInstallProvider>
              </FeedbackModalProvider>
            </LoginModalProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
