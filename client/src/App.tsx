import { Toaster } from "@/components/ui/sonner";
import OnboardingModal from "./components/OnboardingModal";
import FeedbackWidget from "./components/FeedbackWidget";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { useEffect } from "react";
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
import AuthComplete from "./pages/AuthComplete";

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
import Goals from "./pages/Goals";

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
import Referrals from "./pages/Referrals";
import BetaAccess from "./pages/BetaAccess";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import Apply from "./pages/Apply";
import InviteRedeem from "./pages/InviteRedeem";
import Character from "./pages/Character";
import CharacterBook from "./pages/CharacterBook";
import MoodRhythmChart from "./pages/MoodRhythmChart";
import { BetaExpiredModal } from "./components/BetaExpiredModal";
import FirstHonestWeek from "./pages/FirstHonestWeek";
import Dimensions from "./pages/Dimensions";
import MyLibrary from "./pages/MyLibrary";
import LibraryReader from "./pages/LibraryReader";
import ReadingBridge from "./pages/ReadingBridge";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

// The Ground (formerly Before the Words)
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

function RouterSwitch() {
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
      {/* Client-side fallback for cross-domain OAuth handoff (server handles first; this catches SPA-served cases) */}
      <Route path="/api/auth/complete" component={AuthComplete} />

      {/* App */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />

      {/* 5S Modules */}
      <Route path="/state" component={StateModule} />
      <Route path="/story" component={StoryModule} />
      <Route path="/standards" component={StandardsModule} />
      <Route path="/habits"><Redirect to="/standards" replace /></Route>
      <Route path="/strategy" component={StrategyModule} />
      <Route path="/stewardship" component={StewardshipModule} />

      {/* Pathways */}
      <Route path="/pathways" component={PathwaysListing} />
      <Route path="/pathway/:slug" component={PathwayPage} />

      {/* The Weave (journal) — /weave is canonical; /journal is legacy redirect only */}
      <Route path="/weave" component={Journal} />
      <Route path="/weave/:id" component={JournalEntry} />
      <Route path="/journal"><Redirect to="/weave" replace /></Route>
      <Route path="/journal/:id">{(params: { id: string }) => <Redirect to={`/weave/${params.id}`} replace />}</Route>

      {/* Goals */}
      <Route path="/goals" component={Goals} />

      {/* Oracle */}
      <Route path="/oracle" component={Oracle} />

      {/* Commerce */}
      <Route path="/store" component={Store} />
      <Route path="/course/:id" component={CourseDetail} />
      <Route path="/product/:id" component={ProductDetail} />

      {/* Community */}
      <Route path="/community" component={Community} />

      {/* Character & Growth */}
      <Route path="/character" component={Character} />
      <Route path="/character/:id" component={CharacterBook} />

      {/* Mood Rhythm */}
      <Route path="/mood-rhythm" component={MoodRhythmChart} />

      {/* Resources */}
      <Route path="/library" component={ResourceLibrary} />
      <Route path="/library/:slug" component={LibraryArticlePage} />

      {/* Settings */}
      <Route path="/settings" component={Settings} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/beta" component={BetaAccess} />
      <Route path="/apply" component={Apply} />
      <Route path="/invite/:code" component={InviteRedeem} />
      <Route path="/subscription/success" component={SubscriptionSuccess} />

      {/* First Honest Week */}
      <Route path="/first-honest-week" component={FirstHonestWeek} />

      {/* 6 Dimensions Life Map */}
      <Route path="/dimensions" component={Dimensions} />

      {/* Personal Library */}
      <Route path="/my-library" component={MyLibrary} />
      <Route path="/my-library/:id" component={LibraryReader} />

      {/* Reading Bridge */}
      <Route path="/reading-bridge" component={ReadingBridge} />

      {/* The Ground (formerly Before the Words) */}
      <Route path="/ground" component={BTWLanding} />
      <Route path="/ground/ground-check" component={GroundCheck} />
      <Route path="/ground/enter-the-ground" component={EnterTheGround} />
      <Route path="/ground/return" component={ReturnToGround} />
      <Route path="/ground/state" component={StateYouEnter} />
      <Route path="/ground/prayers" component={LivingAsHeard} />
      <Route path="/ground/gratitude" component={ThankingFromThere} />
      <Route path="/ground/words" component={WordsWithWeight} />
      <Route path="/ground/insights" component={ClosingTheGap} />
      <Route path="/ground/library" component={BTWLibrary} />
      <Route path="/ground/library/:slug" component={BTWArticlePage} />

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

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <RouterSwitch />
    </>
  );
}

function App() {
  const { user } = useAuth();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <OnboardingModal userId={user?.id} />
          <BetaExpiredModal />
          <FeedbackWidget />
          <PWAInstallPrompt />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
