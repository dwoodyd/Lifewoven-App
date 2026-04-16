import Nav from "@/components/Nav";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-28 pb-20 max-w-3xl mx-auto">
        <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">Legal</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-light text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

        <div className="prose prose-sm max-w-none text-foreground space-y-8">
          <section>
            <h2 className="font-serif text-xl font-light mb-3">1. Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using Lifewoven ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. Lifewoven is a personal transformation and self-development platform — it is not a substitute for professional medical, psychological, financial, or legal advice.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">2. Use of the Platform</h2>
            <p className="text-muted-foreground leading-relaxed">You must be at least 18 years of age to use Lifewoven. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree not to use the Platform for any unlawful purpose or in any way that could harm other users or the integrity of the Platform.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">3. Membership and Billing</h2>
            <p className="text-muted-foreground leading-relaxed">Lifewoven offers free and paid membership tiers. Paid subscriptions are billed on a monthly basis. You may cancel your subscription at any time; cancellation takes effect at the end of the current billing period. We reserve the right to change pricing with 30 days notice to active subscribers.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">4. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">All original content on Lifewoven — including the 5S Framework, branded pathways, AI Oracle system, course materials, and platform design — is the intellectual property of Lifewoven. Public domain texts used within the platform are attributed accordingly. You may not reproduce, distribute, or create derivative works from Lifewoven original content without written permission.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">5. User Content</h2>
            <p className="text-muted-foreground leading-relaxed">Journal entries, check-ins, and other content you create on Lifewoven belong to you. We do not sell your personal content to third parties. By using the Platform, you grant Lifewoven a limited license to process your content for the purpose of providing AI-powered features such as the Oracle and pattern recognition.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">6. Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">Lifewoven is provided for personal growth and educational purposes only. The AI Oracle and all platform content are not a substitute for professional mental health, medical, financial, or legal advice. If you are experiencing a mental health crisis, please contact a qualified professional or emergency services.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">To the fullest extent permitted by law, Lifewoven shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">We may update these Terms from time to time. We will notify active users of material changes via email or platform notification. Continued use of the Platform after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-light mb-3">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For questions about these Terms, please visit our <Link href="/support" className="text-accent hover:underline">Support page</Link>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
