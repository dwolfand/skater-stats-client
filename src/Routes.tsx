import { Routes as RouterRoutes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CompetitionList from "./pages/CompetitionList";
import Competition from "./pages/Competition";
import Results from "./pages/Results";
import SixEventDetails from "./pages/SixEventDetails";
import Skater from "./pages/Skater";
import Official from "./pages/Official";
import Club from "./pages/Club";
import ClubCompetition from "./pages/ClubCompetition";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Featured from "./pages/Featured";
import { DocumentTitle, DEFAULT_TITLE } from "./components/DocumentTitle";
import { useParams } from "react-router-dom";
import { useEffect } from "react";

// Skater title component - handles dynamic title for skaters
function SkaterTitle() {
  const { name, skaterId } = useParams();

  useEffect(() => {
    // Clean up title on unmount to prevent stale title
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);

  return null;
}

// RouteWithTitle component to handle title changes
interface RouteWithTitleProps {
  element: React.ReactElement;
  title?: string;
}

const RouteWithTitle = ({
  element,
  title = DEFAULT_TITLE,
}: RouteWithTitleProps) => {
  return (
    <>
      <DocumentTitle title={title} />
      {element}
    </>
  );
};

export default function Routes() {
  return (
    <RouterRoutes>
      <Route
        path="/"
        element={<RouteWithTitle element={<Home />} title={DEFAULT_TITLE} />}
      />
      <Route
        path="/competitions"
        element={
          <RouteWithTitle
            element={<CompetitionList />}
            title="Competitions - Skater Stats"
          />
        }
      />
      <Route path="/competition/:year/:ijsId" element={<Competition />} />
      <Route
        path="/competition/:year/:ijsId/event/:eventId"
        element={<Results />}
      />
      <Route
        path="/competition/:year/:ijsId/six-event/:resultsUrl"
        element={<SixEventDetails />}
      />
      <Route
        path="/skater/:name"
        element={
          <>
            <SkaterTitle />
            <Skater />
          </>
        }
      />
      <Route
        path="/skater/id/:skaterId"
        element={
          <>
            <SkaterTitle />
            <Skater />
          </>
        }
      />
      <Route path="/official/:name" element={<Official />} />
      <Route path="/official/id/:id" element={<Official />} />
      <Route path="/club/:clubId" element={<Club />} />
      <Route
        path="/club/:clubId/competition/:year/:ijsId"
        element={<ClubCompetition />}
      />
      <Route
        path="/login"
        element={
          <RouteWithTitle element={<Login />} title="Login - Skater Stats" />
        }
      />
      <Route
        path="/profile"
        element={
          <RouteWithTitle
            element={<Profile />}
            title="Profile - Skater Stats"
          />
        }
      />
      <Route
        path="/featured"
        element={
          <RouteWithTitle
            element={<Featured />}
            title="Featured Skaters - Skater Stats"
          />
        }
      />
      <Route
        path="/terms"
        element={
          <RouteWithTitle
            element={<Terms />}
            title="Terms of Service - Skater Stats"
          />
        }
      />
      <Route
        path="/privacy"
        element={
          <RouteWithTitle
            element={<Privacy />}
            title="Privacy Policy - Skater Stats"
          />
        }
      />
    </RouterRoutes>
  );
}
