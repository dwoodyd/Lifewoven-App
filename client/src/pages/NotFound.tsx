import { Button } from "@/components/ui/button";
import { Compass, Home, BookOpen } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen blueprint-grid bg-background text-foreground flex items-center justify-center px-5">
      <main className="max-w-xl w-full border border-border bg-card/90 p-8 sm:p-12 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-accent/50 bg-accent/10 text-accent">
          <Compass className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="font-mono text-xs tracking-[0.22em] text-muted-foreground uppercase mb-3">Page not found · 404</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">This path is not part of the weave.</h1>
        <p className="text-base text-muted-foreground leading-relaxed mb-8">The page you were looking for is not here. Return to your daily practice or find a resource that meets the moment.</p>
        <div id="not-found-button-group" className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleGoHome} className="min-h-11">
            <Home className="w-4 h-4 mr-2" />Today
          </Button>
          <Button variant="outline" className="min-h-11" onClick={() => setLocation("/library")}>
            <BookOpen className="w-4 h-4 mr-2" />Resource Library
          </Button>
        </div>
      </main>
    </div>
  );
}
