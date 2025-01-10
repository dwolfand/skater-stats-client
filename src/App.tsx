import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Home from "./pages/Home";
import CompetitionList from "./pages/CompetitionList";
import Competition from "./pages/Competition";
import Results from "./pages/Results";
import Skater from "./pages/Skater";
import Header from "./components/Header";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/competitions" element={<CompetitionList />} />
            <Route path="/competition/:year/:ijsId" element={<Competition />} />
            <Route
              path="/competition/:year/:ijsId/event/:eventId"
              element={<Results />}
            />
            <Route path="/skater/:name" element={<Skater />} />
          </Routes>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
