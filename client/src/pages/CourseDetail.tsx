import { useLocation, useRoute } from "wouter";
import DOMPurify from "dompurify";
import Nav from "@/components/Nav";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Clock, BookOpen, PenLine, CheckCircle2, Download, Loader2, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAdminPreview } from "@/contexts/AdminPreviewContext";
import { useState } from "react";
import { alignmentFundamentals, meaningFoundation, alignmentCurrent, identityInMotion, type CourseData } from "@/data/courseData";

const COURSES: Record<string, CourseData> = {
  "alignment-fundamentals": alignmentFundamentals,
  "meaning-foundation": meaningFoundation,
  "alignment-current": alignmentCurrent,
  "identity-in-motion": identityInMotion,
};

// Course PDFs are served exclusively through the server token endpoint.
// No raw CDN/S3 URLs are exposed in the client bundle.
const COURSE_PDF_SLUGS = new Set([
  "alignment-fundamentals",
  "alignment-current",
  "identity-in-motion",
  "meaning-foundation",
]);

const COURSE_PREVIEWS: Record<string, { label: string; excerpts: string[] }> = {
  "alignment-fundamentals": {
    label: "From Lesson 1.1",
    excerpts: [
      "The gap between knowing and living is not a knowledge problem. It is a systems problem. Human beings are not collections of separate problems to be solved one at a time. They are systems — interconnected dimensions of experience in which everything affects everything else.",
      "The 5S Framework does not add another thing to work on. It reorganizes the work you are already doing into a coherent system — one that is greater than the sum of its parts because it addresses the actual structure of a human life.",
    ],
  },
  "alignment-current": {
    label: "From Lesson 1.1",
    excerpts: [
      "The current — the sustained state of interior alignment — is not a condition you achieve once and maintain automatically. It is a practice — an ongoing, daily engagement with the quality of your interior state.",
      "Precision in working with the scale means three things: accurate location, pattern recognition, and gradient sensitivity. The current is built from small, consistent upward movements.",
    ],
  },
  "identity-in-motion": {
    label: "From Lesson 1.1",
    excerpts: [
      "The invisible architecture is the set of beliefs you hold about who you are, specifically in relation to the behavior in question. When these identity specifications and the desired habit are in conflict, the identity wins.",
      "This is not weakness of character. It is the predictable operation of a coherent system. The problem is not the system — it is the identity the system is maintaining consistency with.",
    ],
  },
  "meaning-foundation": {
    label: "From Lesson 1.1",
    excerpts: [
      "The Lifewoven framework holds that the question 'what is your life for?' is not optional. The human organism is structured to seek meaning, in the same way it is structured to seek food and shelter.",
      "What is missing is a genuine, personal, specific answer to the question. Not a borrowed answer — but the answer that emerges from honest attention to what your particular life is asking of you.",
    ],
  },
};

// Courses map to subscription tiers
export default function CourseDetail() {
  const [, params] = useRoute("/course/:id");
  const courseId = params?.id ?? "";
  const course = COURSES[courseId];
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { data: myOrders } = trpc.paypalOrders.getMyOrders.useQuery(undefined, { enabled: !!user });
  const { data: storeProducts } = trpc.store.getProducts.useQuery();

  const isAdmin = false;
  const { previewAsUser, togglePreview } = useAdminPreview();
  const effectiveAdmin = isAdmin && !previewAsUser;

  // Token-gated download state
  const [downloadToken, setDownloadToken] = useState<string | null>(null);
  const existingOrder = myOrders?.find(o => o.productSlug === courseId);
  const activeToken = downloadToken ?? existingOrder?.downloadToken ?? null;
  const hasPurchasedCourse = !!existingOrder || effectiveAdmin;
  const includedWithMembership = storeProducts?.some((product) => product.slug === courseId && product.isIncluded) ?? false;
  const hasCourseAccess = hasPurchasedCourse || includedWithMembership;

  const reissue = trpc.paypalOrders.reissueDownload.useMutation({
    onSuccess: (data) => {
      setDownloadToken(data.token);
      // Open immediately after token is set
      window.open(`/api/download/${data.token}`, "_blank");
    },
    onError: () => toast.error("Could not generate download link. Please try again."),
  });

  function handleDownloadCourse() {
    if (activeToken) {
      window.open(`/api/download/${activeToken}`, "_blank");
      return;
    }
    // Token missing or expired — re-issue via server
    reissue.mutate({ productSlug: courseId });
  }

  const handleEnroll = () => navigate(`/product/${courseId}`);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/store"><p className="text-base text-muted-foreground mb-6 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Back to Store</p></Link>
          <h1 className="font-serif text-4xl font-light text-foreground mb-3">Course Coming Soon</h1>
          <p className="text-muted-foreground font-light text-base mb-8">This course is currently in development. Check back soon or explore the other available courses.</p>
          <Button asChild variant="outline"><Link href="/store">Browse All Products</Link></Button>
        </div>
      </div>
    );
  }

  const EnrollButton = ({ size = "lg" as "lg" | "default" }) => (effectiveAdmin || includedWithMembership) ? null : (
    <Button type="button" size={size} className="gap-2" onClick={handleEnroll}>
      Get the course PDF — {course.price}
    </Button>
  );

  const DownloadButton = ({ size = "lg" as "lg" | "default" }) => (
    hasCourseAccess && COURSE_PDF_SLUGS.has(courseId) ? (
      <Button size={size} variant="outline" className="gap-2" onClick={handleDownloadCourse} disabled={reissue.isPending}>
        {reissue.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        Download Course PDF
      </Button>
    ) : null
  );

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <div className="container pt-20 pb-24 max-w-3xl mx-auto px-4 sm:px-6">
        <Link href="/store">
          <p className="text-base text-muted-foreground mb-8 hover:text-foreground transition-colors cursor-pointer flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Store
          </p>
        </Link>
        {/* Admin Preview Badge + Toggle */}
        {isAdmin && (
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10">
              <Shield className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-mono tracking-widest text-amber-500 uppercase">
                {previewAsUser ? "Previewing as User" : "Admin Preview — Full Access"}
              </span>
            </div>
            <button
              onClick={togglePreview}
              aria-label={previewAsUser ? "Restore admin access" : "Preview as regular user"}
              className="text-xs font-mono tracking-widest text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {previewAsUser ? "Restore Admin Access" : "Preview as User"}
            </button>
          </div>
        )}
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Course</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground mb-3 break-words">{course.title}</h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-light mb-5">{course.subtitle}</p>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Clock className="h-4 w-4" />{course.duration}</span>
            <span className="text-2xl font-light text-foreground">{includedWithMembership ? "Included with Oracle" : course.price}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <EnrollButton />
            <DownloadButton />
          </div>
        </div>
        {/* Overview */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">Course Overview</h2>
          {course.overview.split("\n\n").map((p, i) => (
            <p key={i} className="text-base text-muted-foreground font-light leading-relaxed mb-3 last:mb-0">{p}</p>
          ))}
        </div>
        {/* Structure */}
        <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-border bg-secondary/20">
          <h2 className="font-serif text-2xl font-light text-foreground mb-4">How Each Lesson Works</h2>
          {course.structure.split("\n\n").map((p, i) => (
            <p key={i} className="text-base text-muted-foreground font-light leading-relaxed mb-3 last:mb-0">{p}</p>
          ))}
        </div>
        {/* Preview Excerpts */}
        {COURSE_PREVIEWS[courseId] && (
          <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-border bg-secondary/10">
            <h2 className="font-serif text-2xl font-light text-foreground mb-5">{COURSE_PREVIEWS[courseId].label}</h2>
            <div className="space-y-4">
              {COURSE_PREVIEWS[courseId].excerpts.map((excerpt, i) => (
                <blockquote key={i} className="border-l-2 border-muted-foreground/30 pl-4 text-base text-muted-foreground font-light leading-relaxed italic">
                  {excerpt}
                </blockquote>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8 p-4 sm:p-6 rounded-2xl border border-violet-400/25 bg-violet-400/5">
          <h2 className="font-serif text-2xl font-light text-foreground mb-3">PDF-first delivery</h2>
          <p className="text-base text-muted-foreground font-light leading-relaxed">This course is delivered as a complete PDF with the full lesson bodies, exercises, and prompts. The outline below is a guide to what is included; use the download above to begin reading.</p>
        </div>
        {/* PDF contents */}
        <div>
          <h2 className="font-serif text-2xl font-light text-foreground mb-6">Inside the PDF</h2>
          <div className="space-y-8">
            {course.weeks.map(week => (
              <div key={week.weekNum} className="border border-border rounded-2xl overflow-hidden">
                <div className="p-5 bg-secondary/30 border-b border-border">
                  <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-1">Week {week.weekNum}</p>
                  <h3 className="font-serif text-xl font-light text-foreground">{week.title}</h3>
                  <p className="text-base text-muted-foreground font-light">{week.subtitle}</p>
                </div>
                <div className="divide-y divide-border">
                  {week.lessons.map(lesson => (
                    <details key={lesson.id} className="group">
                      <summary className="flex items-center justify-between p-4 sm:p-5 cursor-pointer hover:bg-secondary/20 transition-colors list-none">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-mono text-muted-foreground shrink-0">{lesson.id}</span>
                          <span className="text-sm sm:text-base font-medium text-foreground truncate">{lesson.title}</span>
                        </div>
                        <BookOpen className="h-4 w-4 text-muted-foreground group-open:text-foreground transition-colors shrink-0" />
                      </summary>
                      <div className="px-4 sm:px-5 pb-5 pt-2 space-y-5">
                        <div>
                          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3">Teaching</p>
                          <div className="space-y-3">
                            {lesson.teaching.split("\n\n").map((para, i) => (
                              <p key={i} className="text-base text-foreground/80 font-light leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(para.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')) }} />
                            ))}
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border">
                          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-3 flex items-center gap-2"><PenLine className="h-3.5 w-3.5" />Reflection Questions</p>
                          <ol className="space-y-2">
                            {lesson.reflections.map((q, i) => (
                              <li key={i} className="text-base text-foreground/80 font-light leading-relaxed flex gap-3">
                                <span className="text-muted-foreground shrink-0 font-mono text-sm">{i + 1}.</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="p-4 rounded-xl border border-border bg-card">
                          <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-2"><BookOpen className="h-3.5 w-3.5" />Journal Prompt</p>
                          <p className="text-base text-foreground/80 font-light leading-relaxed italic">{lesson.journalPrompt}</p>
                        </div>
                        {lesson.dailyPractice && (
                          <div className="p-4 rounded-xl border border-border bg-card">
                            <p className="text-xs font-mono tracking-widest text-muted-foreground uppercase mb-2 flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5" />Daily Practice</p>
                            <p className="text-base text-foreground/80 font-light leading-relaxed">{lesson.dailyPractice}</p>
                          </div>
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* CTA */}
        <div className="mt-10 p-6 sm:p-8 rounded-2xl border border-border bg-card text-center">
          <h3 className="font-serif text-2xl font-light text-foreground mb-3">Ready to Begin?</h3>
          <p className="text-base text-muted-foreground font-light mb-6 max-w-md mx-auto">
            Enroll now and get immediate access to all lessons, practices, and the full course library.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <EnrollButton />
            <DownloadButton />
          </div>
        </div>
      </div>
    </div>
  );
}
