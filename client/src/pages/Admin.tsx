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
import { Users, ShoppingBag, BookOpen, Activity, Shield, Loader2, Copy, Check, KeyRound, TrendingDown } from "lucide-react";
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
    generateCodes.mutate({ count: n });
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
            <div className="mt-4 p-3 bg-muted rounded-lg">
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
        <Tabs defaultValue="users">
          <TabsList className="bg-muted flex-wrap h-auto gap-1">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="beta">Beta Testers</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            <TabsTrigger value="funnel">Onboarding Funnel</TabsTrigger>
          </TabsList>

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

          {/* Beta Testers Tab */}
          <TabsContent value="beta" className="mt-4">
            <BetaTesters />
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="funnel" className="mt-4">
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

function OnboardingFunnel() {
  const { data, isLoading } = trpc.system.getOnboardingFunnel.useQuery();

  const SLIDE_LABELS: Record<string, string> = {
    thesis:    "1 · The Thesis",
    state:     "2 · State",
    framework: "3 · 5S Framework",
    oracle:    "4 · The Oracle",
    btw:       "5 · Before the Words",
    reset:     "6 · The Reset",
    close:     "7 · Begin",
  };

  const total = data?.[0]?.count ?? 0;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2 flex flex-row items-center gap-2">
        <TrendingDown className="h-5 w-5 text-amber-500" />
        <CardTitle className="text-base">Onboarding Drop-off Funnel</CardTitle>
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
              return (
                <div key={row.slide}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{SLIDE_LABELS[row.slide] ?? row.slide}</span>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {i > 0 && dropPct > 0 && (
                        <span className="text-red-400">-{dropPct}%</span>
                      )}
                      <span className="font-semibold text-foreground">{row.count.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: `hsl(${38 - i * 4}, ${70 - i * 4}%, ${55 - i * 3}%)`,
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
