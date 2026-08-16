import { useEffect } from "react";
import { ArrowLeft, Download, BookOpen, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Nav from "@/components/Nav";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export interface ArticleSection {
  heading?: string;
  subheading?: string;
  body?: string;
  quote?: string;
  quoteAttrib?: string;
  list?: string[];
  note?: string; // italic footnote / coda
}

export interface ArticleData {
  slug: string;
  title: string;
  subtitle?: string;
  author?: string;
  category?: string;
  type?: string;
  backHref: string;
  backLabel: string;
  sections: ArticleSection[];
  coda?: string; // closing italic line
  readTime?: string;
  externalLink?: string;
  summary?: string;
}

interface Props {
  article: ArticleData;
}

// Number of sections shown free before the gate
const FREE_SECTIONS = 2;

function renderBody(text: string) {
  // Bold **text**, then line breaks
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

function ArticlePaywall({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="relative mt-0 mb-16">
      {/* Fade overlay over the last visible section */}
      <div
        className="absolute -top-32 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, var(--background))",
        }}
      />
      {/* Gate card */}
      <div className="relative rounded-2xl border border-border bg-card p-8 sm:p-10 text-center shadow-sm">
        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-secondary/60 flex items-center justify-center">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <h3 className="font-serif text-2xl font-light text-foreground mb-3">
          Continue Reading
        </h3>
        <p className="text-base text-muted-foreground font-light mb-7 max-w-sm mx-auto leading-relaxed">
          {isAuthenticated
            ? "This article is part of the Lifewoven library. Get full access with any membership plan."
            : "Sign in to continue reading — or explore a membership plan for unlimited access to the full library."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <>
              <Button asChild size="lg" className="gap-2">
                <Link href="/pricing">
                  <Sparkles className="h-4 w-4" />
                  View Membership Plans
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/audit">Take the Free Audit</Link>
              </Button>
            </>
          ) : (
            <>
              <Button size="lg" className="gap-2" onClick={() => { window.location.href = getLoginUrl(window.location.pathname + window.location.search); }}>
                Sign In to Continue
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/pricing">View Plans</Link>
              </Button>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-5 font-light">
          Explorer plan is free · No credit card required
        </p>
      </div>
    </div>
  );
}

export default function ArticleReader({ article }: Props) {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = false;

  // Admins and oracle/seeker tier users get full access
  const membershipTier = (user as any)?.membershipTier as string | undefined;
  const hasPaidAccess = isAdmin || membershipTier === "oracle" || membershipTier === "seeker";

  // Gate applies when: logged out, or logged in as explorer (free tier)
  const showGate = !hasPaidAccess && article.sections.length > FREE_SECTIONS;

  const visibleSections = showGate
    ? article.sections.slice(0, FREE_SECTIONS)
    : article.sections;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article.slug]);

  const handleDownload = () => {
    if (showGate) return; // prevent download on gated articles
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>${article.title} — Lifewoven</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter',sans-serif;font-size:11pt;line-height:1.75;color:#1a1a1a;background:#fff;padding:0}
  @page{margin:2.2cm 2.8cm;size:A4}
  .cover{page-break-after:always;display:flex;flex-direction:column;justify-content:flex-end;min-height:100vh;padding-bottom:4cm}
  .brand{font-family:'Inter',sans-serif;font-size:8pt;letter-spacing:.18em;text-transform:uppercase;color:#888;margin-bottom:3cm}
  h1{font-family:'Cormorant Garamond',serif;font-size:34pt;font-weight:300;line-height:1.15;color:#111;margin-bottom:.6cm}
  .subtitle{font-family:'Cormorant Garamond',serif;font-size:16pt;font-weight:300;font-style:italic;color:#555;margin-bottom:.4cm}
  .meta{font-size:9pt;color:#888;letter-spacing:.06em}
  .divider{border:none;border-top:1px solid #ddd;margin:1cm 0}
  h2{font-family:'Cormorant Garamond',serif;font-size:18pt;font-weight:400;color:#111;margin-top:1.4cm;margin-bottom:.4cm}
  h3{font-family:'Cormorant Garamond',serif;font-size:14pt;font-weight:400;font-style:italic;color:#333;margin-top:1cm;margin-bottom:.3cm}
  p{margin-bottom:.55cm;orphans:3;widows:3}
  blockquote{border-left:2px solid #c9a96e;padding-left:.7cm;margin:1cm 0;font-family:'Cormorant Garamond',serif;font-size:14pt;font-style:italic;color:#444;line-height:1.5}
  blockquote cite{display:block;font-size:9pt;font-style:normal;color:#888;margin-top:.3cm;font-family:'Inter',sans-serif}
  ul{padding-left:1.2cm;margin-bottom:.55cm}
  li{margin-bottom:.25cm}
  .note{font-style:italic;color:#666;font-size:10pt;border-top:1px solid #eee;padding-top:.5cm;margin-top:1cm}
  .coda{font-style:italic;color:#888;font-size:10pt;margin-top:1.5cm;padding-top:.6cm;border-top:1px solid #eee}
  .footer{position:fixed;bottom:1cm;left:2.8cm;right:2.8cm;display:flex;justify-content:space-between;font-size:8pt;color:#aaa;border-top:1px solid #eee;padding-top:.3cm}
</style>
</head>
<body>
<div class="cover">
  <div class="brand">Lifewoven · Personal Transformation Platform</div>
  <h1>${article.title}</h1>
  ${article.subtitle ? `<p class="subtitle">${article.subtitle}</p>` : ""}
  <p class="meta">${[article.category, article.type, article.author].filter(Boolean).join(" · ")}</p>
</div>
<div class="footer">
  <span>Lifewoven — lifewoven.click</span>
  <span>${article.title}</span>
</div>
${article.sections.map(s => `
  ${s.heading ? `<h2>${s.heading}</h2>` : ""}
  ${s.subheading ? `<h3>${s.subheading}</h3>` : ""}
  ${s.body ? s.body.split("\n\n").map(para => `<p>${para.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`).join("") : ""}
  ${s.quote ? `<blockquote>${s.quote}${s.quoteAttrib ? `<cite>— ${s.quoteAttrib}</cite>` : ""}</blockquote>` : ""}
  ${s.list ? `<ul>${s.list.map(li => `<li>${li.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</li>`).join("")}</ul>` : ""}
  ${s.note ? `<p class="note">${s.note}</p>` : ""}
`).join("")}
${article.coda ? `<p class="coda">${article.coda}</p>` : ""}
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      {/* Print styles */}
      <style>{`@media print { nav, .no-print { display: none !important; } }`}</style>

      <div className="container pt-20 pb-24 max-w-2xl mx-auto px-4 sm:px-6">
        {/* Back + Download bar */}
        <div className="flex items-center justify-between mb-10 no-print">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
            <Link href={article.backHref}>
              <ArrowLeft className="h-4 w-4" />
              {article.backLabel}
            </Link>
          </Button>
          {!showGate && (
            <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={handleDownload}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          )}
        </div>

        {/* Article header */}
        <header className="mb-12">
          {article.category && (
            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-4">{article.category}</p>
          )}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-4">{article.title}</h1>
          {article.subtitle && (
            <p className="font-serif text-xl font-light italic text-muted-foreground mb-4">{article.subtitle}</p>
          )}
          {(article.author || article.type) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{[article.author, article.type].filter(Boolean).join(" · ")}</span>
            </div>
          )}
          {showGate && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/60 text-xs text-muted-foreground font-mono tracking-widest uppercase">
              <Lock className="h-3 w-3" />
              Preview — {FREE_SECTIONS} of {article.sections.length} sections
            </div>
          )}
          <hr className="mt-8 border-border" />
        </header>

        {/* Article body — gated or full */}
        <article className="prose-article">
          {visibleSections.map((s, i) => (
            <section key={i} className="mb-8">
              {s.heading && (
                <h2 className="font-serif text-2xl font-light text-foreground mt-10 mb-4 pb-2 border-b border-border/50">{s.heading}</h2>
              )}
              {s.subheading && (
                <h3 className="font-serif text-lg font-light italic text-muted-foreground mt-6 mb-3">{s.subheading}</h3>
              )}
              {s.body && s.body.split("\n\n").map((para, j) => (
                <p key={j} className="text-foreground/90 text-base sm:text-lg font-light leading-relaxed mb-5">{renderBody(para)}</p>
              ))}
              {s.quote && (
                <blockquote className="border-l-2 border-accent pl-6 my-8">
                  <p className="font-serif text-xl font-light italic text-foreground/80 leading-relaxed">{s.quote}</p>
                  {s.quoteAttrib && <cite className="block text-sm text-muted-foreground mt-2 not-italic">— {s.quoteAttrib}</cite>}
                </blockquote>
              )}
              {s.list && (
                <ul className="space-y-2 my-5 pl-4">
                  {s.list.map((item, j) => (
                    <li key={j} className="text-base sm:text-lg font-light text-foreground/90 leading-relaxed flex gap-3">
                      <span className="text-accent mt-1.5 shrink-0">·</span>
                      <span>{renderBody(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.note && (
                <p className="text-base italic text-muted-foreground border-t border-border pt-4 mt-6">{s.note}</p>
              )}
            </section>
          ))}

          {/* Paywall gate */}
          {showGate && <ArticlePaywall isAuthenticated={isAuthenticated} />}

          {/* Coda — only shown when full access */}
          {!showGate && article.coda && (
            <p className="text-base italic text-muted-foreground border-t border-border pt-6 mt-8">{article.coda}</p>
          )}
        </article>

        {/* Back link bottom — only when full access */}
        {!showGate && (
          <div className="mt-16 pt-8 border-t border-border no-print">
            <Button asChild variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground -ml-2">
              <Link href={article.backHref}>
                <ArrowLeft className="h-4 w-4" />
                {article.backLabel}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
