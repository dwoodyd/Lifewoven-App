import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Public pages
import Home from "./pages/Home";
import AlignmentAudit from "./pages/AlignmentAudit";
import Pricing from "./pages/Pricing";
import About from "./pages/About";

// Auth
import AuthCallback from "./pages/AuthCallback";

// Dashboard & core
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// 5S Modules
import StateModule from "./pages/modules/StateModule";
import StoryModule from "./pages/modules/StoryModule";
import StandardsModule from "./pages/modules/StandardsModule";
import StrategyModule from "./pages/modules/StrategyModule";
import StewardshipModule from "./pages/modules/StewardshipModule";

// Pathways
import PathwayPage from "./pages/PathwayPage";

// Journal
import Journal from "./pages/Journal";
import JournalEntry from "./pages/JournalEntry";

// Oracle
import Oracle from "./pages/Oracle";

// Commerce
import Store from "./pages/Store";
import CourseDetail from "./pages/CourseDetail";

// Community
import Community from "./pages/Community";

// Resources
import ResourceLibrary from "./pages/ResourceLibrary";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/audit" component={AlignmentAudit} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />

      {/* Auth */}
      <Route path="/auth/callback" component={AuthCallback} />

      {/* App */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />

      {/* 5S Modules */}
      <Route path="/state" component={StateModule} />
      <Route path="/story" component={StoryModule} />
      <Route path="/standards" component={StandardsModule} />
      <Route path="/strategy" component={StrategyModule} />
      <Route path="/stewardship" component={StewardshipModule} />

      {/* Pathways */}
      <Route path="/pathway/:slug" component={PathwayPage} />

      {/* Journal */}
      <Route path="/journal" component={Journal} />
      <Route path="/journal/:id" component={JournalEntry} />

      {/* Oracle */}
      <Route path="/oracle" component={Oracle} />

      {/* Commerce */}
      <Route path="/store" component={Store} />
      <Route path="/courses/:slug" component={CourseDetail} />

      {/* Community */}
      <Route path="/community" component={Community} />

      {/* Resources */}
      <Route path="/library" component={ResourceLibrary} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
