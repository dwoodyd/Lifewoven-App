import { Toaster } from "@/components/ui/sonner";
import OnboardingModal from "./components/OnboardingModal";
import FeedbackWidget from "./components/FeedbackWidget";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";

// Public pages
import Home from "./pages/Home";
import AlignmentAudit from "./pages/AlignmentAudit";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Sources from "./pages/Sources";

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
import PathwaysListing from "./pages/PathwaysListing";

// Journal
import Journal from "./pages/Journal";
import JournalEntry from "./pages/JournalEntry";

// Oracle
import Oracle from "./pages/Oracle";

// Commerce
import Store from "./pages/Store";
import CourseDetail from "./pages/CourseDetail";
import ProductDetail from "./pages/ProductDetail";

// Community
import Community from "./pages/Community";

// Resources
import ResourceLibrary from "./pages/ResourceLibrary";
import LibraryArticlePage from "./pages/LibraryArticlePage";

// Settings
import Settings from "./pages/Settings";
import Downloads from "./pages/Downloads";

// Before the Words (BTW)
import BTWLanding from "./pages/btw/BTWLanding";
import GroundCheck from "./pages/btw/GroundCheck";
import EnterTheGround from "./pages/btw/EnterTheGround";
import ReturnToGround from "./pages/btw/ReturnToGround";
import StateYouEnter from "./pages/btw/StateYouEnter";
import LivingAsHeard from "./pages/btw/LivingAsHeard";
import ThankingFromThere from "./pages/btw/ThankingFromThere";
import WordsWithWeight from "./pages/btw/WordsWithWeight";
import ClosingTheGap from "./pages/btw/ClosingTheGap";
import BTWLibrary from "./pages/btw/BTWLibrary";
import BTWArticlePage from "./pages/btw/BTWArticlePage";

// Legal & Support
import Terms from "./pages/legal/Terms";
import Privacy from "./pages/legal/Privacy";
import Refunds from "./pages/legal/Refunds";
import Support from "./pages/Support";
import Admin from "./pages/Admin";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Home} />
      <Route path="/audit" component={AlignmentAudit} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/about" component={About} />
      <Route path="/sources" component={Sources} />

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
      <Route path="/pathways" component={PathwaysListing} />
      <Route path="/pathway/:slug" component={PathwayPage} />

      {/* Journal */}
      <Route path="/journal" component={Journal} />
      <Route path="/journal/:id" component={JournalEntry} />

      {/* Oracle */}
      <Route path="/oracle" component={Oracle} />

      {/* Commerce */}
      <Route path="/store" component={Store} />
      <Route path="/course/:id" component={CourseDetail} />
      <Route path="/product/:id" component={ProductDetail} />

      {/* Community */}
      <Route path="/community" component={Community} />

      {/* Resources */}
      <Route path="/library" component={ResourceLibrary} />
      <Route path="/library/:slug" component={LibraryArticlePage} />

      {/* Settings */}
      <Route path="/settings" component={Settings} />
      <Route path="/downloads" component={Downloads} />

      {/* Before the Words */}
      <Route path="/btw" component={BTWLanding} />
      <Route path="/btw/ground-check" component={GroundCheck} />
      <Route path="/btw/enter-the-ground" component={EnterTheGround} />
      <Route path="/btw/return" component={ReturnToGround} />
      <Route path="/btw/state" component={StateYouEnter} />
      <Route path="/btw/prayers" component={LivingAsHeard} />
      <Route path="/btw/gratitude" component={ThankingFromThere} />
      <Route path="/btw/words" component={WordsWithWeight} />
      <Route path="/btw/insights" component={ClosingTheGap} />
      <Route path="/btw/library" component={BTWLibrary} />
      <Route path="/btw/library/:slug" component={BTWArticlePage} />

      {/* Legal & Support */}
      <Route path="/legal/terms" component={Terms} />
      <Route path="/legal/privacy" component={Privacy} />
      <Route path="/legal/refunds" component={Refunds} />
      <Route path="/support" component={Support} />

      {/* Admin */}
      <Route path="/admin" component={Admin} />

      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user } = useAuth();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster />
          <OnboardingModal userId={user?.id} />
          <FeedbackWidget />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
