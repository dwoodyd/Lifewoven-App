import Nav from "@/components/Nav";
import { Link } from "wouter";
import { CheckCircle2 } from "lucide-react";

export default function Refunds() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-28 pb-20 max-w-3xl mx-auto">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Legal</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: August 2026</p>

        <div className="p-5 rounded-xl border border-accent/30 bg-accent/5 mb-10">
          <p className="text-sm font-light text-foreground leading-relaxed">
            We want you to feel confident investing in Lifewoven. If the platform does not serve you, we will make it right. Our goal is your transformation — not your money.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl font-light mb-3">Subscription Refunds</h2>
            <p className="text-muted-foreground leading-relaxed text-sm mb-4">We offer a <strong className="text-foreground">7-day full refund</strong> on all new subscriptions (Seeker and Oracle tiers). If you are not satisfied within the first 7 days of your paid subscription, contact us for a full refund — no questions asked.</p>
            <div className="space-y-2">
              {[
                "Refund requests must be submitted within 7 days of the initial charge",
                "Refunds are processed within 5–10 business days",
                "Refunds apply to the most recent charge only",
                "After 7 days, subscriptions are non-refundable but can be cancelled at any time",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">Digital Products and Courses</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">Due to the digital nature of courses, workbooks, and downloadable products, all digital product purchases are final. If you experience a technical issue accessing a product you have purchased, please contact us and we will resolve it promptly.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">To request a refund, please visit our <Link href="/support" className="text-accent hover:underline">Support page</Link> and submit a request with your account email and the reason for your request. We respond to all refund requests within 2 business days.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
