import Nav from "@/components/Nav";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-28 pb-20 max-w-3xl mx-auto">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Legal</p>
        <h1 className="font-serif text-4xl font-light text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="font-serif text-xl font-light mb-3">What We Collect</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">We collect information you provide directly: account details (name, email), journal entries, check-in responses, habit data, audit results, and any content you create within the platform. We also collect usage data (pages visited, features used, session duration) to improve the platform experience.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">Your data is used to: provide and improve the Lifewoven platform, power AI features such as the Oracle and pattern recognition, send you relevant communications about your account and the platform, and analyze aggregate usage trends (never individual user data) to improve our products.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">What We Do Not Do</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">We do not sell your personal data to third parties. We do not share your journal entries or personal content with advertisers. We do not use your data to train general AI models without your explicit consent.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">We use industry-standard encryption and security practices to protect your data. Your journal entries and personal content are stored securely and are only accessible to you and, where necessary for AI features, to our secure processing systems.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">You have the right to access, correct, or delete your personal data at any time. You may export your journal entries and data from your account settings. To request data deletion, please contact us via our <Link href="/support" className="text-accent hover:underline">Support page</Link>.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">We use essential cookies for authentication and session management. We do not use third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">For privacy-related questions, please visit our <Link href="/support" className="text-accent hover:underline">Support page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
