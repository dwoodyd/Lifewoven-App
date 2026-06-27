import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Moon, Sun, Menu, X, CheckSquare, ClipboardList, BookOpen,
  BookMarked, BarChart2, ShoppingBag, CreditCard, Info, Settings,
  HelpCircle, LogOut, ExternalLink, Target, Layers,
} from "lucide-react";
import { replayOnboarding } from "@/components/OnboardingModal";
import { trpc } from "@/lib/trpc";

// Primary nav links — always visible on desktop
const primaryLinks = [
  { label: "Pathways", href: "/pathways" },
  { label: "The Ground", href: "/ground" },
  { label: "The Weave", href: "/weave" },
  { label: "Oracle", href: "/oracle" },
  { label: "Resources", href: "/library" },
];

export default function Nav() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); window.location.href = "/"; },
  });

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border" style={{ viewTransitionName: 'nav-bar' }}>
      <div className="container flex items-center justify-between h-16 px-4 sm:px-6">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0" onClick={closeMobile} style={{ viewTransitionName: 'nav-brand' }}>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663270045694/kRrwoPFbyNWaiJXLmscJ4t/app-icon_e26b6bab.png"
            alt="Lifewoven"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover"
          />
          <span className="font-sans text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            Lifewoven
          </span>
        </Link>

        {/* Desktop Primary Nav */}
        <nav className="hidden md:flex items-center gap-5 xl:gap-7" aria-label="Main navigation">
          {primaryLinks.map((link) => {
            const isActive = (() => {
              // Root link — exact match only
              if (link.href === "/") return location === "/";
              // Regular path — exact match or sub-route
              const basePath = link.href.split("?")[0];
              return location === basePath || location.startsWith(basePath + "/");
            })();
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-sans whitespace-nowrap relative group transition-colors duration-150 ${
                  isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {/* Animated underline */}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-200 ${
                    isActive ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme + User */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground w-9 h-9 transition-colors duration-150 hover:bg-accent/10 group"
            aria-label="Toggle theme"
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
              : <Moon className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />}
          </Button>

          {isAuthenticated ? (
            /* ── Authenticated: DW avatar dropdown ── */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border border-border hover:border-accent transition-colors" style={{ viewTransitionName: 'user-avatar' } as React.CSSProperties}>
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                {/* User identity */}
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />

                {/* Practice Tools */}
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                  Practice tools
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <CheckSquare className="h-3.5 w-3.5" />Today's Check-in
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/audit" className="flex items-center gap-2">
                    <ClipboardList className="h-3.5 w-3.5" />The Audit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/ground" className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />The Ground
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/weave" className="flex items-center gap-2">
                    <BookMarked className="h-3.5 w-3.5" />The Weave
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mood-rhythm" className="flex items-center gap-2">
                    <BarChart2 className="h-3.5 w-3.5" />Mood Rhythm
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/goals" className="flex items-center gap-2">
                    <Target className="h-3.5 w-3.5" />Goals
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dimensions" className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />Life Map
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-library" className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />My Library
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/reading-bridge" className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />Reading Bridge
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* More from Soul Engineer */}
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                  More from Soul Engineer
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <a
                    href="https://www.soulengineer.online/books"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />Books
                    <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {/* Account */}
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1">
                  Account
                </DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/pricing" className="flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" />Subscription
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about" className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5" />About
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" />Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/support" className="flex items-center gap-2">
                    <HelpCircle className="h-3.5 w-3.5" />Help
                  </Link>
                </DropdownMenuItem>

                {user?.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-2">
                        <Settings className="h-3.5 w-3.5" />Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => logoutMutation.mutate()}
                >
                  <LogOut className="h-3.5 w-3.5" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* ── Unauthenticated ── */
            <>
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <a href={getLoginUrl(window.location.pathname + window.location.search)}>Sign in</a>
              </Button>
              <Button size="sm" asChild className="hidden sm:flex">
                <Link href="/audit">Take the Assessment</Link>
              </Button>
            </>
          )}

          {/* Mobile hamburger — only on small screens */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden w-9 h-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-md"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Primary links */}
          <div className="px-4 py-3 space-y-0.5">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center py-3 px-2 text-base rounded-lg transition-colors hover:bg-secondary/50 ${
                  location === link.href ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
                onClick={closeMobile}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth section */}
          <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2 mb-1">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarFallback className="bg-secondary text-xs font-medium">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground px-2 pt-1 font-medium uppercase tracking-wide">Practice tools</p>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/dashboard" onClick={closeMobile}><CheckSquare className="h-4 w-4" />Today's Check-in</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/audit" onClick={closeMobile}><ClipboardList className="h-4 w-4" />The Audit</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/ground" onClick={closeMobile}><BookOpen className="h-4 w-4" />The Ground</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/weave" onClick={closeMobile}><BookMarked className="h-4 w-4" />The Weave</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/mood-rhythm" onClick={closeMobile}><BarChart2 className="h-4 w-4" />Mood Rhythm</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/goals" onClick={closeMobile}><Target className="h-4 w-4" />Goals</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/dimensions" onClick={closeMobile}><Layers className="h-4 w-4" />Life Map</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/reading-bridge" onClick={closeMobile}><BookOpen className="h-4 w-4" />Reading Bridge</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/my-library" onClick={closeMobile}><BookOpen className="h-4 w-4" />My Library</Link>
                </Button>

                <p className="text-xs text-muted-foreground px-2 pt-2 font-medium uppercase tracking-wide">More from Soul Engineer</p>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <a href="https://www.soulengineer.online/books" target="_blank" rel="noopener noreferrer" onClick={closeMobile}>
                    <ShoppingBag className="h-4 w-4" />Books <ExternalLink className="h-3 w-3 ml-auto" />
                  </a>
                </Button>

                <p className="text-xs text-muted-foreground px-2 pt-2 font-medium uppercase tracking-wide">Account</p>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/pricing" onClick={closeMobile}><CreditCard className="h-4 w-4" />Subscription</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/about" onClick={closeMobile}><Info className="h-4 w-4" />About</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/settings" onClick={closeMobile}><Settings className="h-4 w-4" />Settings</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                  <Link href="/support" onClick={closeMobile}><HelpCircle className="h-4 w-4" />Help</Link>
                </Button>

                {user?.role === "admin" && (
                  <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground justify-start">
                    <Link href="/admin" onClick={closeMobile}><Settings className="h-4 w-4" />Admin Panel</Link>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="default"
                  className="w-full gap-2 text-destructive justify-start"
                  onClick={() => { logoutMutation.mutate(); closeMobile(); }}
                >
                  <LogOut className="h-4 w-4" />Sign out
                </Button>
              </>
            ) : (
              <>
                <Button size="default" asChild className="w-full">
                  <Link href="/audit" onClick={closeMobile}>Take the Soul Engineer Assessment</Link>
                </Button>
                <Button variant="outline" size="default" asChild className="w-full bg-transparent">
                  <a href={getLoginUrl(window.location.pathname + window.location.search)} onClick={closeMobile}>Sign in</a>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
