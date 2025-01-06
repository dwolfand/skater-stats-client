import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CompetitionList from "./pages/CompetitionList";
import CompetitionDetail from "./pages/CompetitionDetail";
import EventDetail from "./pages/EventDetail";
import Results from "./pages/Results";

const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<CompetitionList />} />
            <Route path="/competition/:id" element={<CompetitionDetail />} />
            <Route
              path="/competition/:id/event/:eventId"
              element={<EventDetail />}
            />
            <Route path="/competition/:id/results" element={<Results />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </ChakraProvider>
  );
}

export default App;
