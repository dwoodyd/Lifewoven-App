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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Moon, Sun, Menu, X, Sparkles, LayoutDashboard, BookOpen, User, Settings, Download, Gift, Play } from "lucide-react";
import { replayOnboarding } from "@/components/OnboardingModal";
import { trpc } from "@/lib/trpc";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Pathways", href: "/#pathways" },
  { label: "Before the Words", href: "/btw" },
  { label: "Library", href: "/library" },
  { label: "Community", href: "/community" },
  { label: "Store", href: "/store" },
  { label: "Pricing", href: "/pricing" },
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0" onClick={closeMobile}>
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663270045694/kRrwoPFbyNWaiJXLmscJ4t/app-icon_e26b6bab.png"
            alt="Lifewoven"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover"
          />
          <span className="font-sans text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            Lifewoven
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-6" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-sans transition-colors hover:text-foreground whitespace-nowrap ${
                location === link.href
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground w-9 h-9"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden md:flex gap-1.5 text-muted-foreground"
              >
                <Link href="/oracle">
                  <Sparkles className="h-4 w-4" />
                  Oracle
                </Link>
              </Button>
              <Button variant="default" size="sm" asChild className="hidden md:flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer border border-border hover:border-accent transition-colors">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2"><LayoutDashboard className="h-3.5 w-3.5" />Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2"><User className="h-3.5 w-3.5" />Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/journal" className="flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" />Journal</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/downloads" className="flex items-center gap-2"><Download className="h-3.5 w-3.5" />My Downloads</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/referrals" className="flex items-center gap-2"><Gift className="h-3.5 w-3.5" />Refer &amp; Earn</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 cursor-pointer" onClick={() => replayOnboarding(user?.id)}>
                    <Play className="h-3.5 w-3.5" />Replay Intro
                  </DropdownMenuItem>
                  {user?.role === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2"><Settings className="h-3.5 w-3.5" />Admin Panel</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => logoutMutation.mutate()}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden md:flex">
                <a href={getLoginUrl()}>Sign in</a>
              </Button>
              <Button size="sm" asChild className="hidden sm:flex">
                <Link href="/audit">Take the Audit</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden w-9 h-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md"
          role="navigation"
          aria-label="Mobile navigation"
        >
          {/* Nav links */}
          <div className="px-4 py-3 space-y-0.5">
            {navLinks.map((link) => (
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

          {/* Auth actions */}
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
                <Button size="default" asChild className="w-full gap-2">
                  <Link href="/dashboard" onClick={closeMobile}><LayoutDashboard className="h-4 w-4" />Dashboard</Link>
                </Button>
                <Button variant="outline" size="default" asChild className="w-full gap-2 bg-transparent">
                  <Link href="/oracle" onClick={closeMobile}><Sparkles className="h-4 w-4" />Oracle</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground">
                  <Link href="/downloads" onClick={closeMobile}><Download className="h-4 w-4" />My Downloads</Link>
                </Button>
                <Button variant="ghost" size="default" asChild className="w-full gap-2 text-muted-foreground">
                  <Link href="/referrals" onClick={closeMobile}><Gift className="h-4 w-4" />Refer &amp; Earn</Link>
                </Button>
                <Button variant="ghost" size="default" className="w-full gap-2 text-muted-foreground" onClick={() => { replayOnboarding(user?.id); closeMobile(); }}>
                  <Play className="h-4 w-4" />Replay Intro
                </Button>
                <Button variant="ghost" size="default" className="w-full text-muted-foreground" onClick={() => { logoutMutation.mutate(); closeMobile(); }}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button size="default" asChild className="w-full">
                  <Link href="/audit" onClick={closeMobile}>Take the Alignment Audit</Link>
                </Button>
                <Button variant="outline" size="default" asChild className="w-full bg-transparent">
                  <a href={getLoginUrl()} onClick={closeMobile}>Sign in</a>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
