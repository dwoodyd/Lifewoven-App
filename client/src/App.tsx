import { Toaster } from "@/components/ui/sonner";
import FeedbackWidget from "./components/FeedbackWidget";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "./_core/hooks/useAuth";
import OnboardingModal from "./components/OnboardingModal";

import { BetaExpiredModal } from "./components/BetaExpiredModal";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";

// Route modules are intentionally lazy. Loading every feature (including the
// rich reader) on the public first paint delayed interaction on mobile.
const NotFound = lazy(() => import("@/pages/NotFound"));
const Home = lazy(() => import("./pages/Home"));
const AlignmentAudit = lazy(() => import("./pages/AlignmentAudit"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Sources = lazy(() => import("./pages/Sources"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const AuthComplete = lazy(() => import("./pages/AuthComplete"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const StateModule = lazy(() => import("./pages/modules/StateModule"));
const StoryModule = lazy(() => import("./pages/modules/StoryModule"));
const StandardsModule = lazy(() => import("./pages/modules/StandardsModule"));
const StrategyModule = lazy(() => import("./pages/modules/StrategyModule"));
const StewardshipModule = lazy(() => import("./pages/modules/StewardshipModule"));
const PathwayPage = lazy(() => import("./pages/PathwayPage"));
const PathwaysListing = lazy(() => import("./pages/PathwaysListing"));
const Journal = lazy(() => import("./pages/Journal"));
const JournalEntry = lazy(() => import("./pages/JournalEntry"));
const Goals = lazy(() => import("./pages/Goals"));
const Oracle = lazy(() => import("./pages/Oracle"));
const Store = lazy(() => import("./pages/Store"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Community = lazy(() => import("./pages/Community"));
const ResourceLibrary = lazy(() => import("./pages/ResourceLibrary"));
const LibraryArticlePage = lazy(() => import("./pages/LibraryArticlePage"));
const Settings = lazy(() => import("./pages/Settings"));
const Downloads = lazy(() => import("./pages/Downloads"));
const Referrals = lazy(() => import("./pages/Referrals"));
const BetaAccess = lazy(() => import("./pages/BetaAccess"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const InviteRedeem = lazy(() => import("./pages/InviteRedeem"));
const Character = lazy(() => import("./pages/Character"));
const CharacterBook = lazy(() => import("./pages/CharacterBook"));
const MoodRhythmChart = lazy(() => import("./pages/MoodRhythmChart"));
const FirstHonestWeek = lazy(() => import("./pages/FirstHonestWeek"));
const Dimensions = lazy(() => import("./pages/Dimensions"));
const MyLibrary = lazy(() => import("./pages/MyLibrary"));
const LibraryReader = lazy(() => import("./pages/LibraryReader"));
const ReadingBridge = lazy(() => import("./pages/ReadingBridge"));
const BTWLanding = lazy(() => import("./pages/btw/BTWLanding"));
const GroundCheck = lazy(() => import("./pages/btw/GroundCheck"));
const EnterTheGround = lazy(() => import("./pages/btw/EnterTheGround"));
const ReturnToGround = lazy(() => import("./pages/btw/ReturnToGround"));
const StateYouEnter = lazy(() => import("./pages/btw/StateYouEnter"));
const LivingAsHeard = lazy(() => import("./pages/btw/LivingAsHeard"));
const ThankingFromThere = lazy(() => import("./pages/btw/ThankingFromThere"));
const WordsWithWeight = lazy(() => import("./pages/btw/WordsWithWeight"));
const ClosingTheGap = lazy(() => import("./pages/btw/ClosingTheGap"));
const BTWLibrary = lazy(() => import("./pages/btw/BTWLibrary"));
const BTWArticlePage = lazy(() => import("./pages/btw/BTWArticlePage"));
const Terms = lazy(() => import("./pages/legal/Terms"));
const Privacy = lazy(() => import("./pages/legal/Privacy"));
const Refunds = lazy(() => import("./pages/legal/Refunds"));
const Support = lazy(() => import("./pages/Support"));
const Admin = lazy(() => import("./pages/Admin"));

function RouteSkeleton() {
  return (
    <main className="screen-safe bg-background">
      <div className="mx-auto max-w-5xl space-y-4 pt-20">
        <div className="h-5 w-28 animate-pulse rounded-full bg-secondary" />
        <div className="h-10 w-3/4 max-w-md animate-pulse rounded-xl bg-secondary" />
        <div className="h-20 max-w-2xl animate-pulse rounded-[var(--radius-surface)] bg-secondary" />
        <div className="h-44 max-w-2xl animate-pulse rounded-[var(--radius-surface)] bg-secondary" />
      </div>
    </main>
  );
}

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
      <Route path="/login" component={Login} />
      <Route path="/signin"><Redirect to="/login" replace /></Route>
      <Route path="/signup" component={Login} />
      <Route path="/auth" component={Login} />
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
      <Route path="/mood"><Redirect to="/mood-rhythm" replace /></Route>

      {/* Resources */}
      <Route path="/library" component={ResourceLibrary} />
      <Route path="/library/:slug" component={LibraryArticlePage} />
      <Route path="/resources"><Redirect to="/library" replace /></Route>

      {/* Legacy reader and app vocabulary */}
      <Route path="/today"><Redirect to="/dashboard" replace /></Route>
      <Route path="/assessment"><Redirect to="/audit" replace /></Route>
      <Route path="/survey"><Redirect to="/audit" replace /></Route>
      <Route path="/ground-check"><Redirect to="/ground/ground-check" replace /></Route>
      <Route path="/check-in"><Redirect to="/dashboard" replace /></Route>

      {/* Settings */}
      <Route path="/settings" component={Settings} />
      <Route path="/downloads" component={Downloads} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/beta" component={BetaAccess} />
      <Route path="/apply"><Redirect to="/signup" replace /></Route>
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
    const priorRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => { window.history.scrollRestoration = priorRestoration; };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    return () => window.cancelAnimationFrame(frame);
  }, [location]);
  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteSkeleton />}>
        <RouterSwitch />
      </Suspense>
    </>
  );
}

function App() {
  const { user } = useAuth();
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster duration={3000} />
          <BetaExpiredModal />
          <FeedbackWidget />
          <PWAInstallPrompt />
          <OnboardingModal userId={user?.id} />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
