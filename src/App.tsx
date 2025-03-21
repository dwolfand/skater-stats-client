import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { LoginModalProvider } from "./components/LoginModal";
import { FeedbackModalProvider } from "./components/FeedbackModal";
import theme from "./theme";
import Routes from "./Routes";
import Layout from "./components/Layout";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <LoginModalProvider>
              <FeedbackModalProvider>
                <Layout>
                  <Routes />
                </Layout>
              </FeedbackModalProvider>
            </LoginModalProvider>
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
