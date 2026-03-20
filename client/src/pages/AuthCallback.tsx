import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const [, navigate] = useLocation();
  useEffect(() => {
    const timer = setTimeout(() => navigate("/dashboard"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="font-serif text-lg font-light text-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
