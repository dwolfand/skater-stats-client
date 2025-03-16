import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import CompetitionList from "./pages/CompetitionList";
import Competition from "./pages/Competition";
import Results from "./pages/Results";
import SixEventDetails from "./pages/SixEventDetails";
import Skater from "./pages/Skater";
import Official from "./pages/Official";
import Layout from "./components/Layout";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/competitions" element={<CompetitionList />} />
                <Route
                  path="/competition/:year/:ijsId"
                  element={<Competition />}
                />
                <Route
                  path="/competition/:year/:ijsId/event/:eventId"
                  element={<Results />}
                />
                <Route
                  path="/competition/:year/:ijsId/six-event/:resultsUrl"
                  element={<SixEventDetails />}
                />
                <Route path="/skater/:name" element={<Skater />} />
                <Route path="/skater/id/:skaterId" element={<Skater />} />
                <Route path="/official/:name" element={<Official />} />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
