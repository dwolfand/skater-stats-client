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
import Club from "./pages/Club";
import ClubCompetition from "./pages/ClubCompetition";
import Layout from "./components/Layout";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
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
                <Route path="/club/:clubId" element={<Club />} />
                <Route
                  path="/club/:clubId/competition/:year/:ijsId"
                  element={<ClubCompetition />}
                />
                <Route path="/login" element={<Login />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
