import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

type Status = "loading" | "success" | "error";

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<Status>("loading");
  const [tier, setTier] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subscriptionId = params.get("subscription_id") ?? params.get("token");
    const plan = params.get("plan") ?? "seeker";

    if (!subscriptionId) {
      setStatus("error");
      setErrorMsg("No subscription ID found in the URL. Please try again.");
      return;
    }

    // Capture the subscription — verify with PayPal and upgrade tier in DB
    fetch("/api/paypal/subscription/capture", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, plan }),
    })
      .then(r => r.json())
      .then((data: { ok?: boolean; tier?: string; error?: string }) => {
        if (data.ok) {
          setTier(data.tier ?? plan);
          setStatus("success");
          // Redirect to dashboard after 3 seconds
          setTimeout(() => navigate("/dashboard"), 3000);
        } else {
          setStatus("error");
          setErrorMsg(data.error ?? "Subscription activation failed. Please contact support.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Network error. Your payment may have been processed — please contact support.");
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 text-amber-400 animate-spin mx-auto" />
            <h1 className="font-serif text-2xl font-light text-foreground">Activating your membership…</h1>
            <p className="text-muted-foreground font-light">Verifying your subscription with PayPal. This takes just a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
            <h1 className="font-serif text-2xl font-light text-foreground">
              Welcome to the {tier.charAt(0).toUpperCase() + tier.slice(1)} plan
            </h1>
            <p className="text-muted-foreground font-light">
              Your membership is now active. You will be redirected to your dashboard in a moment.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="font-serif text-2xl font-light text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground font-light">{errorMsg}</p>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/pricing">Back to Pricing</Link>
              </Button>
              <Button asChild className="flex-1">
                <a href="mailto:hello@lifewoven.com">Contact Support</a>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
