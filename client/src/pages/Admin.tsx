import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, ShoppingBag, BookOpen, Activity, Shield, Loader2, Copy, Check, KeyRound, TrendingDown, TrendingUp, ClipboardList, CheckCircle, XCircle, RefreshCw, Package, CreditCard, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Admin() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  if (!user || user.role !== "admin") return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
      <Shield className="h-12 w-12 text-muted-foreground" />
      <h1 className="text-2xl font-semibold">Admin Access Required</h1>
      <p className="text-muted-foreground">You must be an admin to view this page.</p>
      <Link href="/"><Button variant="outline">Return Home</Button></Link>
    </div>
  );

  return <AdminDashboard />;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };
  return (
    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopy}>
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function BetaTesters() {
  const [count, setCount] = useState("5");
  const [emailTo, setEmailTo] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [digestMode, setDigestMode] = useState<"instant"|"daily">(() =>
    (localStorage.getItem("betaNotifyMode") as "instant"|"daily") || "instant"
  );
  const utils = trpc.useUtils();

  const handleDigestToggle = (val: "instant"|"daily") => {
    setDigestMode(val);
    localStorage.setItem("betaNotifyMode", val);
    toast.success(val === "daily" ? "Switched to daily digest (midnight UTC)" : "Switched to instant notifications");
  };

  const { data: codes, isLoading: codesLoading } = trpc.beta.listCodes.useQuery();
  const generateCodes = trpc.beta.generateCodes.useMutation({
    onSuccess: (data) => {
      toast.success(`Generated ${data.codes.length} beta code${data.codes.length !== 1 ? "s" : ""}`);
      utils.beta.listCodes.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to generate codes"),
  });

  const handleGenerate = () => {
    const n = parseInt(count, 10);
    if (!n || n < 1 || n > 100) { toast.error("Enter a number between 1 and 100"); return; }
    setEmailSent(false);
    generateCodes.mutate({ count: n });
  };

  const sendInvites = trpc.beta.sendInvites.useMutation({
    onSuccess: (data) => {
      setEmailSent(true);
      if (data.failed.length > 0) {
        toast.error(`${data.sent} sent, ${data.failed.length} failed: ${data.failed.map(f => f.email).join(", ")}`);
      } else {
        toast.success(`${data.sent} invite email${data.sent !== 1 ? "s" : ""} sent successfully via Resend`);
      }
    },
    onError: (err) => toast.error(err.message || "Failed to send emails"),
  });

  const handleSendEmail = () => {
    const generatedCodes = generateCodes.data?.codes ?? [];
    if (!emailTo.trim() || !generatedCodes.length) return;
    const emails = emailTo.split(",").map(e => e.trim()).filter(Boolean);
    if (!emails.length) { toast.error("Enter at least one email address"); return; }
    sendInvites.mutate({
      emails,
      codes: generatedCodes,
      origin: window.location.origin,
    });
  };

  const statusVariant = (status: string) => {
    if (status === "available") return "secondary";
    if (status === "redeemed") return "default";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      {/* Notification mode */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Redemption Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground flex-1">Choose how you receive alerts when a tester redeems a code.</p>
          <div className="flex gap-2">
            <Button size="sm" variant={digestMode === "instant" ? "default" : "outline"} onClick={() => handleDigestToggle("instant")}>Instant</Button>
            <Button size="sm" variant={digestMode === "daily" ? "default" : "outline"} onClick={() => handleDigestToggle("daily")}>Daily Digest</Button>
          </div>
        </CardContent>
      </Card>

      {/* Generate section */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-400" />
            Generate Beta Codes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Each code grants 45 days of full access. Codes are single-use and expire after redemption period ends.
          </p>
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-28"
              placeholder="Count"
            />
            <Button
              onClick={handleGenerate}
              disabled={generateCodes.isPending}
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0d0d1a" }}
              className="font-semibold"
            >
              {generateCodes.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating…</>
              ) : "Generate Codes"}
            </Button>
          </div>
          {generateCodes.data && (
            <div className="mt-4 space-y-3">
              {/* Email send row */}
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="alice@email.com, bob@email.com, …"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" variant="outline" onClick={handleSendEmail} disabled={!emailTo || emailSent || sendInvites.isPending}>
                  {sendInvites.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Sending…</> : emailSent ? "✓ Sent" : "Send via Email"}
                </Button>
              </div>
              <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Newly generated codes — copy and share:</p>
              <div className="space-y-1">
                {generateCodes.data.codes.map((code) => (
                  <div key={code} className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-foreground">{code}</span>
                    <CopyButton text={code} />
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Codes list */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">All Beta Codes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {codesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Redeemed By</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(codes ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No beta codes yet — generate some above.
                    </TableCell>
                  </TableRow>
                )}
                {(codes ?? []).map((c) => (
                  <TableRow key={c.id} className="border-border">
                    <TableCell className="font-mono text-sm">{c.code}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.redeemedByName || c.redeemedByEmail || (c.redeemedBy ? `User #${c.redeemedBy}` : "—")}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <CopyButton text={c.code} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.admin.users.useQuery();
  const { data: orders, isLoading: ordersLoading } = trpc.admin.orders.useQuery();
  const { data: health } = trpc.admin.contentHealth.useQuery();
  const setRole = trpc.admin.setUserRole.useMutation({
    onSuccess: () => { toast.success("Role updated"); },
    onError: () => { toast.error("Failed to update role"); },
  });
  const utils = trpc.useUtils();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">Lifewoven Admin</span>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">← Back to App</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-400" },
            { label: "Total Orders", value: stats?.totalOrders, icon: ShoppingBag, color: "text-emerald-400" },
            { label: "Journal Entries", value: stats?.totalJournalEntries, icon: BookOpen, color: "text-amber-400" },
            { label: "Enrollments", value: stats?.totalEnrollments, icon: Activity, color: "text-purple-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${color}`} />
                  <div>
                    <p className="text-2xl font-bold">{statsLoading ? "—" : (value ?? 0)}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Health */}
        {health && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Content Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="text-muted-foreground">Audit Results: <strong className="text-foreground">{health.auditResultsCount}</strong></span>
                <span className="text-muted-foreground">Active Habits: <strong className="text-foreground">{health.habitsCount}</strong></span>
                <span className="text-muted-foreground">Course Enrollments: <strong className="text-foreground">{health.enrollmentsCount}</strong></span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="applications">
          <TabsList className="bg-muted flex-wrap h-auto gap-1">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" />Products</TabsTrigger>
            <TabsTrigger value="plans" className="gap-1.5"><CreditCard className="h-3.5 w-3.5" />Plans</TabsTrigger>
            <TabsTrigger value="beta">Beta Testers</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="funnel">Onboarding Funnel</TabsTrigger>
          </TabsList>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-4">
            <ApplicationsPanel />
          </TabsContent>
          {/* Users Tab */}
          <TabsContent value="users" className="mt-4">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {usersLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(users ?? []).map((u) => (
                        <TableRow key={u.id} className="border-border">
                          <TableCell className="font-medium">{u.name || "—"}</TableCell>
                          <TableCell className="text-muted-foreground">{u.email || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={u.role}
                              onValueChange={(role) => {
                                setRole.mutate({ userId: u.id, role: role as "user" | "admin" });
                                utils.admin.users.invalidate();
                              }}
                            >
                              <SelectTrigger className="h-7 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">user</SelectItem>
                                <SelectItem value="admin">admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                {ordersLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(orders ?? []).map((o) => (
                        <TableRow key={o.id} className="border-border">
                          <TableCell className="text-muted-foreground text-sm">#{o.id}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{o.userId}</TableCell>
                          <TableCell className="font-medium">{o.productSlug || "—"}</TableCell>
                          <TableCell>${o.total}</TableCell>
                          <TableCell>
                            <Badge variant={o.status === "completed" ? "default" : o.status === "refunded" ? "destructive" : "secondary"}>
                              {o.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(orders ?? []).length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-4">
            <ProductsPanel />
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="mt-4">
            <PlansPanel />
          </TabsContent>

          {/* Beta Testers Tab */}
          <TabsContent value="beta" className="mt-4">
            <BetaTesters />
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="funnel" className="mt-4 space-y-4">
            <BetaConversionStats />
            <OnboardingFunnel />
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Users</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(stats?.recentUsers ?? []).map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{u.name || "Anonymous"}</p>
                        <p className="text-xs text-muted-foreground">{u.email || "—"}</p>
                      </div>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="text-xs">{u.role}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(stats?.recentOrders ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No orders yet</p>
                  ) : (stats?.recentOrders ?? []).map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-1 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{o.productSlug || "Order #" + o.id}</p>
                        <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={o.status === "completed" ? "default" : "secondary"} className="text-xs">{o.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BetaConversionStats() {
  const { data, isLoading } = trpc.system.getBetaConversionStats.useQuery();
  const { data: converted, isLoading: convertedLoading } = trpc.system.getConvertedUsers.useQuery();
  const checkExpiry = trpc.system.checkBetaExpiry.useMutation({
    onSuccess: (d) => toast.success(d.notified > 0 ? `Notified: ${d.notified} expiring user${d.notified > 1 ? "s" : ""}` : "No users expiring in 7 days"),
    onError: () => toast.error("Failed to check expiry"),
  });

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (!data) return null;
  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 flex flex-row items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          <CardTitle className="text-base">Beta → Paid Conversion</CardTitle>
          {data.totalBeta > 0 && (
            <span className="ml-auto text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 px-2.5 py-1 rounded-full">
              {data.conversionRate}% conversion rate
            </span>
          )}
        </CardHeader>
        <CardContent>
          {data.totalBeta === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No beta users yet. Data will appear once testers redeem codes.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-xl bg-muted">
                  <p className="text-2xl font-bold text-foreground">{data.totalBeta}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Beta Users</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-2xl font-bold text-green-400">{data.converted}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Converted</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted">
                  <p className="text-2xl font-bold text-foreground">{data.totalBeta - data.converted}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Still on Beta</p>
                </div>
              </div>
              {data.byPlan.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Conversions by plan</p>
                  <div className="space-y-1.5">
                    {data.byPlan.map(p => (
                      <div key={p.plan} className="flex items-center justify-between text-sm">
                        <span className="capitalize text-foreground">{p.plan}</span>
                        <span className="font-semibold text-green-400">{p.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => checkExpiry.mutate()} disabled={checkExpiry.isPending}>
                  {checkExpiry.isPending ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Checking…</> : "⏰ Check 7-Day Expiry & Notify"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1.5">Sends you a notification listing beta users whose trial ends within 7 days and haven’t converted.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Converted users table */}
      {converted && converted.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">🏆 Early Adopters — Beta → Paid</CardTitle>
          </CardHeader>
          <CardContent>
            {convertedLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Converted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {converted.map(u => (
                    <TableRow key={u.userId}>
                      <TableCell className="font-medium">{u.name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {u.email ? (
                          <a href={`mailto:${u.email}?subject=Thank%20you%20for%20joining%20Lifewoven&body=Hi%20${encodeURIComponent(u.name || '')}%2C%0A%0AThank%20you%20for%20becoming%20a%20paying%20member%20of%20Lifewoven!%20We%27re%20so%20glad%20you%27re%20here.%0A%0A`} className="underline hover:text-foreground transition-colors">{u.email}</a>
                        ) : "—"}
                      </TableCell>
                      <TableCell><Badge variant="default" className="capitalize">{u.plan}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{new Date(u.convertedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function OnboardingFunnel() {
  const { data, isLoading } = trpc.system.getOnboardingFunnel.useQuery();

  const SLIDE_LABELS: Record<string, string> = {
    thesis:    "1 · The Thesis",
    state:     "2 · State",
    framework: "3 · 5S Framework",
    oracle:    "4 · The Oracle",
    btw:       "5 · The Ground",
    reset:     "6 · The Reset",
    close:     "7 · Begin",
    complete:       "✓ Audit Started",
    beta_converted: "💳 Paid Subscriber", // final conversion metric — shown in green
  };

  const total = data?.[0]?.count ?? 0;
  const completeCount = data?.find(r => r.slide === "complete")?.count ?? 0;
  const conversionRate = total > 0 ? Math.round((completeCount / total) * 100) : 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <TrendingDown className="h-5 w-5 text-amber-500" />
        <CardTitle className="text-base">Onboarding Drop-off Funnel</CardTitle>
        {total > 0 && (
          <span className="ml-auto text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            {conversionRate}% converted to Audit
          </span>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !data || total === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No onboarding events yet. Data will appear once users start the intro.
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {data.map((row, i) => {
              const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
              const dropPct = i > 0 && data[i - 1].count > 0
                ? Math.round(((data[i - 1].count - row.count) / data[i - 1].count) * 100)
                : 0;
              const isComplete = row.slide === "complete";
              const isConverted = row.slide === "beta_converted";
              return (
                <div key={row.slide}>
                  {(isComplete || isConverted) && <div className="border-t border-border my-3" />}
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-medium ${isConverted ? "text-green-400" : isComplete ? "text-amber-400" : "text-foreground"}`}>{SLIDE_LABELS[row.slide] ?? row.slide}</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {i > 0 && dropPct > 0 && !isConverted && (
                        <span className="text-red-400">-{dropPct}%</span>
                      )}
                      <span className={`font-semibold ${isConverted ? "text-green-400" : isComplete ? "text-amber-400" : "text-foreground"}`}>{row.count.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: isConverted ? "rgb(74,222,128)" : isComplete ? "rgb(251,191,36)" : `hsl(${38 - i * 4}, ${70 - i * 4}%, ${55 - i * 3}%)`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground pt-2">
              Total advances tracked: {data.reduce((s, r) => s + r.count, 0).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Applications Panel ───────────────────────────────────────────────────────
function ApplicationsPanel() {
  const utils = trpc.useUtils();
  const { data: apps, isLoading } = trpc.applications.list.useQuery();
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [tierMap, setTierMap] = useState<Record<number, "explorer" | "seeker" | "oracle">>({});

  const approve = trpc.applications.approve.useMutation({
    onSuccess: (data) => {
      toast.success(`Approved! Code: ${data.code}`);
      utils.applications.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Approval failed"),
    onSettled: () => setApprovingId(null),
  });

  const decline = trpc.applications.decline.useMutation({
    onSuccess: () => {
      toast.success("Application declined");
      utils.applications.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to decline"),
  });

  const resend = trpc.applications.resendInvite.useMutation({
    onSuccess: (data) => {
      toast.success(`Resent! New code: ${data.code}`);
      utils.applications.list.invalidate();
    },
    onError: (err) => toast.error(err.message || "Failed to resend"),
  });

  const statusBadge = (status: string) => {
    if (status === "approved") return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">approved</Badge>;
    if (status === "declined") return <Badge variant="destructive">declined</Badge>;
    if (status === "reviewing") return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">reviewing</Badge>;
    return <Badge variant="secondary">new</Badge>;
  };

  const tierColor = (tier: string) => {
    if (tier === "oracle") return "text-violet-400";
    if (tier === "seeker") return "text-amber-400";
    return "text-sky-400";
  };

  const newCount = (apps ?? []).filter(a => a.status === "new").length;

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border">
        <CardHeader className="pb-3 flex flex-row items-center gap-2">
          <ClipboardList className="h-5 w-5 text-amber-400" />
          <CardTitle className="text-base">Founding Member Applications</CardTitle>
          {newCount > 0 && (
            <Badge className="ml-auto bg-amber-500/20 text-amber-400 border-amber-500/30">{newCount} new</Badge>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (apps ?? []).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No applications yet. Share /apply to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Name / Email</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(apps ?? []).map((app) => (
                  <TableRow key={app.id} className="border-border align-top">
                    <TableCell>
                      <p className="font-medium text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-muted-foreground line-clamp-3">{app.answer}</p>
                    </TableCell>
                    <TableCell>{statusBadge(app.status)}</TableCell>
                    <TableCell>
                      {app.status === "new" || app.status === "reviewing" ? (
                        <Select
                          value={tierMap[app.id] ?? "seeker"}
                          onValueChange={(v) => setTierMap(prev => ({ ...prev, [app.id]: v as "explorer" | "seeker" | "oracle" }))}
                        >
                          <SelectTrigger className="h-7 w-28 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="explorer">Explorer</SelectItem>
                            <SelectItem value="seeker">Seeker</SelectItem>
                            <SelectItem value="oracle">Oracle</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className={`text-sm font-medium capitalize ${tierColor(app.tier)}`}>{app.tier}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {(app.status === "new" || app.status === "reviewing") && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              disabled={approve.isPending && approvingId === app.id}
                              onClick={() => {
                                setApprovingId(app.id);
                                approve.mutate({
                                  applicationId: app.id,
                                  tier: tierMap[app.id] ?? "seeker",
                                  origin: window.location.origin,
                                });
                              }}
                            >
                              {approve.isPending && approvingId === app.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : <CheckCircle className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              disabled={decline.isPending}
                              onClick={() => decline.mutate({ applicationId: app.id })}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                        {app.status === "approved" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                            disabled={resend.isPending}
                            onClick={() => resend.mutate({ applicationId: app.id, origin: window.location.origin })}
                            title="Resend invite"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Products Panel ───────────────────────────────────────────────────────────
type ProductRow = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  type: "course" | "workbook" | "card_deck" | "audio_bundle" | "planner" | "guide";
  price: string;
  thumbnailUrl: string | null;
  downloadUrl: string | null;
  isPublished: boolean;
};

const PRODUCT_TYPES = ["course", "workbook", "card_deck", "audio_bundle", "planner", "guide"] as const;

function ProductsPanel() {
  const utils = trpc.useUtils();
  const { data: products, isLoading } = trpc.admin.listProducts.useQuery();
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ slug: "", title: "", description: "", type: "course" as typeof PRODUCT_TYPES[number], price: "", thumbnailUrl: "", downloadUrl: "", isPublished: false });

  const createMutation = trpc.admin.createProduct.useMutation({
    onSuccess: () => { toast.success("Product created"); utils.admin.listProducts.invalidate(); setShowCreate(false); setForm({ slug: "", title: "", description: "", type: "course", price: "", thumbnailUrl: "", downloadUrl: "", isPublished: false }); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.admin.updateProduct.useMutation({
    onSuccess: () => { toast.success("Product updated"); utils.admin.listProducts.invalidate(); setEditProduct(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.deleteProduct.useMutation({
    onSuccess: () => { toast.success("Product deleted"); utils.admin.listProducts.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const openEdit = (p: ProductRow) => {
    setEditProduct(p);
    setForm({ slug: p.slug, title: p.title, description: p.description ?? "", type: p.type, price: p.price, thumbnailUrl: p.thumbnailUrl ?? "", downloadUrl: p.downloadUrl ?? "", isPublished: p.isPublished });
  };

  const handleSave = () => {
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, ...form, price: form.price });
    } else {
      createMutation.mutate({ ...form, price: form.price });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Products</h2>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditProduct(null); setForm({ slug: "", title: "", description: "", type: "course", price: "", thumbnailUrl: "", downloadUrl: "", isPublished: false }); setShowCreate(true); }}>
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(products ?? []).map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono">{p.slug}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{p.type}</Badge></TableCell>
                    <TableCell>${p.price}</TableCell>
                    <TableCell>
                      <Badge variant={p.isPublished ? "default" : "secondary"} className="text-xs">
                        {p.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p as ProductRow)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete "${p.title}"?`)) deleteMutation.mutate({ id: p.id }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(products ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No products yet. Click "Add Product" to create one.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate || !!editProduct} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditProduct(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editProduct ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Alignment Fundamentals" />
              </div>
              <div className="space-y-1">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="alignment-fundamentals" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as typeof PRODUCT_TYPES[number] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Price (USD)</Label>
                <Input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="97.00" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Product description…" />
            </div>
            <div className="space-y-1">
              <Label>Thumbnail URL</Label>
              <Input value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} placeholder="https://…" />
            </div>
            <div className="space-y-1">
              <Label>Download URL</Label>
              <Input value={form.downloadUrl} onChange={e => setForm(f => ({ ...f, downloadUrl: e.target.value }))} placeholder="https://…" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.isPublished} onCheckedChange={v => setForm(f => ({ ...f, isPublished: v }))} id="published-switch" />
              <Label htmlFor="published-switch">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditProduct(null); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="gap-1.5">
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editProduct ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Plans Panel ──────────────────────────────────────────────────────────────
type PlanRow = {
  id: number;
  name: string;
  tier: "explorer" | "seeker" | "oracle";
  billingInterval: "monthly" | "annual";
  priceUsd: string;
  retailPriceUsd: string | null;
  paypalPlanId: string | null;
  isFoundingRate: boolean;
  isActive: boolean;
  features: string[];
  sortOrder: number;
};

const PLAN_TIERS = ["explorer", "seeker", "oracle"] as const;
const BILLING_INTERVALS = ["monthly", "annual"] as const;

function PlansPanel() {
  const utils = trpc.useUtils();
  const { data: plans, isLoading } = trpc.admin.listPlans.useQuery();
  const [editPlan, setEditPlan] = useState<PlanRow | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [featuresText, setFeaturesText] = useState("");
  const [form, setForm] = useState({
    name: "", tier: "seeker" as typeof PLAN_TIERS[number], billingInterval: "monthly" as typeof BILLING_INTERVALS[number],
    priceUsd: "", retailPriceUsd: "", paypalPlanId: "", isFoundingRate: false, isActive: true, sortOrder: 0,
  });

  const createMutation = trpc.admin.createPlan.useMutation({
    onSuccess: () => { toast.success("Plan created"); utils.admin.listPlans.invalidate(); setShowCreate(false); resetForm(); },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = trpc.admin.updatePlan.useMutation({
    onSuccess: () => { toast.success("Plan updated"); utils.admin.listPlans.invalidate(); setEditPlan(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.admin.deletePlan.useMutation({
    onSuccess: () => { toast.success("Plan deleted"); utils.admin.listPlans.invalidate(); },
    onError: (e) => toast.error(e.message),
  });

  const resetForm = () => setForm({ name: "", tier: "seeker", billingInterval: "monthly", priceUsd: "", retailPriceUsd: "", paypalPlanId: "", isFoundingRate: false, isActive: true, sortOrder: 0 });

  const openEdit = (p: PlanRow) => {
    setEditPlan(p);
    setFeaturesText((p.features ?? []).join("\n"));
    setForm({ name: p.name, tier: p.tier, billingInterval: p.billingInterval, priceUsd: p.priceUsd, retailPriceUsd: p.retailPriceUsd ?? "", paypalPlanId: p.paypalPlanId ?? "", isFoundingRate: p.isFoundingRate, isActive: p.isActive, sortOrder: p.sortOrder });
  };

  const handleSave = () => {
    const features = featuresText.split("\n").map(s => s.trim()).filter(Boolean);
    if (editPlan) {
      updateMutation.mutate({ id: editPlan.id, ...form, features });
    } else {
      createMutation.mutate({ ...form, features });
    }
  };

  const tierColor: Record<string, string> = { explorer: "bg-slate-500/20 text-slate-300", seeker: "bg-indigo-500/20 text-indigo-300", oracle: "bg-amber-500/20 text-amber-300" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Subscription Plans</h2>
        <Button size="sm" className="gap-1.5" onClick={() => { setEditPlan(null); resetForm(); setFeaturesText(""); setShowCreate(true); }}>
          <Plus className="h-4 w-4" /> Add Plan
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>PayPal Plan ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(plans ?? []).map((p) => (
                  <TableRow key={p.id} className="border-border">
                    <TableCell className="font-medium">
                      {p.name}
                      {p.isFoundingRate && <Badge variant="outline" className="ml-2 text-xs text-amber-400 border-amber-400/30">Founding</Badge>}
                    </TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierColor[p.tier] ?? ""}`}>{p.tier}</span></TableCell>
                    <TableCell className="text-muted-foreground text-sm capitalize">{p.billingInterval}</TableCell>
                    <TableCell>
                      <span className="font-medium">${p.priceUsd}</span>
                      {p.retailPriceUsd && <span className="text-muted-foreground line-through text-xs ml-1">${p.retailPriceUsd}</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">{p.paypalPlanId || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? "default" : "secondary"} className="text-xs">
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p as PlanRow)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => { if (confirm(`Delete plan "${p.name}"?`)) deleteMutation.mutate({ id: p.id }); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(plans ?? []).length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No plans yet. Click "Add Plan" to create one.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={showCreate || !!editPlan} onOpenChange={(open) => { if (!open) { setShowCreate(false); setEditPlan(null); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editPlan ? "Edit Plan" : "Add Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Plan Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Seeker Founding Monthly" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tier</Label>
                <Select value={form.tier} onValueChange={v => setForm(f => ({ ...f, tier: v as typeof PLAN_TIERS[number] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLAN_TIERS.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Billing Interval</Label>
                <Select value={form.billingInterval} onValueChange={v => setForm(f => ({ ...f, billingInterval: v as typeof BILLING_INTERVALS[number] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BILLING_INTERVALS.map(b => <SelectItem key={b} value={b} className="capitalize">{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Price (USD)</Label>
                <Input value={form.priceUsd} onChange={e => setForm(f => ({ ...f, priceUsd: e.target.value }))} placeholder="19.00" />
              </div>
              <div className="space-y-1">
                <Label>Retail Price (crossed out)</Label>
                <Input value={form.retailPriceUsd} onChange={e => setForm(f => ({ ...f, retailPriceUsd: e.target.value }))} placeholder="29.00 (optional)" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>PayPal Plan ID</Label>
              <Input value={form.paypalPlanId} onChange={e => setForm(f => ({ ...f, paypalPlanId: e.target.value }))} placeholder="P-XXXXXXXXXXXXXXXXXXXXXXXX" />
            </div>
            <div className="space-y-1">
              <Label>Features (one per line)</Label>
              <Textarea value={featuresText} onChange={e => setFeaturesText(e.target.value)} rows={5} placeholder={"All 5S Modules\nThe Ground full suite\nGround Guide AI reflection"} />
            </div>
            <div className="space-y-1">
              <Label>Sort Order</Label>
              <Input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))} placeholder="0" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isFoundingRate} onCheckedChange={v => setForm(f => ({ ...f, isFoundingRate: v }))} id="founding-switch" />
                <Label htmlFor="founding-switch">Founding Rate</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} id="active-switch" />
                <Label htmlFor="active-switch">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditPlan(null); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending} className="gap-1.5">
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editPlan ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
