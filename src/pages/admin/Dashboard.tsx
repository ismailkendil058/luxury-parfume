import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

const monthNamesArabic = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const GroupedWorkerSessions = ({
  period,
  customDate,
  workerSessions,
  stats,
  onSessionClick
}: {
  period: string,
  customDate: Date | undefined,
  workerSessions: { [workerId: string]: any[] },
  stats: any,
  onSessionClick: (s: any) => void
}) => {
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    setExpandedMonth(null);
    setExpandedDay(null);
  }, [period, customDate]);

  if (period === "today" || customDate) {
    return (
      <div className="space-y-3">
        {stats.workerStats.map((w: any, i: number) => {
          const sessions = workerSessions[w.workerId] || [];
          return (
            <div key={i}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">{w.name}</span>
                <div className="text-right tabular-nums">
                  <span>{w.revenue.toLocaleString()} دج</span>
                  <span className="text-muted-foreground ml-2">({w.profit.toLocaleString()} أرباح)</span>
                </div>
              </div>
              {sessions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {sessions.map((session: any) => (
                    <Button
                      key={session.id}
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs bg-background/50 hover:bg-background"
                      onClick={() => onSessionClick(session)}
                    >
                      <Clock className="ml-1 h-3 w-3" />
                      {new Date(session.started_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const allSessions: any[] = [];
  Object.values(workerSessions).forEach(arr => allSessions.push(...arr));

  const getWorkerName = (id: string) => {
    const worker = stats.workerStats.find((w: any) => w.workerId === id);
    return worker ? worker.name : "Unknown";
  };

  const renderDaySessions = (daySessions: any[]) => {
    const byWorker: Record<string, any[]> = {};
    daySessions.forEach(s => {
      if (!byWorker[s.worker_id]) byWorker[s.worker_id] = [];
      byWorker[s.worker_id].push(s);
    });

    return (
      <div className="space-y-3 p-3 bg-muted/20 border border-border/50 rounded-lg animate-in fade-in slide-in-from-top-1 mt-2">
        {Object.entries(byWorker).map(([workerId, sessions]) => (
          <div key={workerId} className="border-b border-border/50 last:border-0 pb-2 last:pb-0">
            <span className="text-sm font-medium mb-2 block">{getWorkerName(workerId)}</span>
            <div className="flex flex-wrap gap-1">
              {sessions.map((session: any) => (
                <Button
                  key={session.id}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-background/80 hover:bg-background"
                  onClick={() => onSessionClick(session)}
                >
                  <Clock className="ml-1 h-3 w-3" />
                  {new Date(session.started_at).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                  <span className="ml-1 text-muted-foreground mr-1 tabular-nums mix-blend-opacity-50">
                    ({Number(session.total_revenue || 0).toLocaleString()} دج)
                  </span>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (period === "month") {
    const byDay: Record<number, any[]> = {};
    allSessions.forEach(s => {
      const d = new Date(s.started_at).getDate();
      if (!byDay[d]) byDay[d] = [];
      byDay[d].push(s);
    });

    const sortedDays = Object.keys(byDay).map(Number).sort((a, b) => a - b);

    return (
      <div className="space-y-2 mt-2">
        <div className="flex flex-wrap gap-1">
          {sortedDays.map(d => (
            <Button
              key={d}
              variant={expandedDay === d ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setExpandedDay(expandedDay === d ? null : d)}
            >
              يوم {d}
            </Button>
          ))}
        </div>

        {expandedDay !== null && byDay[expandedDay] && (
          renderDaySessions(byDay[expandedDay])
        )}
      </div>
    );
  }

  if (period === "year") {
    const byMonth: Record<number, any[]> = {};
    allSessions.forEach(s => {
      const m = new Date(s.started_at).getMonth();
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push(s);
    });

    const sortedMonths = Object.keys(byMonth).map(Number).sort((a, b) => a - b);

    return (
      <div className="space-y-2 mt-2">
        <div className="flex flex-wrap gap-1">
          {sortedMonths.map(m => (
            <Button
              key={m}
              variant={expandedMonth === m ? "default" : "outline"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                setExpandedMonth(expandedMonth === m ? null : m);
                setExpandedDay(null);
              }}
            >
              {monthNamesArabic[m]}
            </Button>
          ))}
        </div>

        {expandedMonth !== null && byMonth[expandedMonth] && (() => {
          const byDay: Record<number, any[]> = {};
          byMonth[expandedMonth].forEach(s => {
            const d = new Date(s.started_at).getDate();
            if (!byDay[d]) byDay[d] = [];
            byDay[d].push(s);
          });

          const sortedDays = Object.keys(byDay).map(Number).sort((a, b) => a - b);

          return (
            <div className="space-y-2 p-3 bg-muted/10 border border-border/50 rounded-lg animate-in fade-in slide-in-from-top-1 mt-2">
              <div className="flex flex-wrap gap-1">
                {sortedDays.map(d => (
                  <Button
                    key={d}
                    variant={expandedDay === d ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs bg-background/50 hover:bg-background"
                    onClick={() => setExpandedDay(expandedDay === d ? null : d)}
                  >
                    يوم {d}
                  </Button>
                ))}
              </div>

              {expandedDay !== null && byDay[expandedDay] && (
                renderDaySessions(byDay[expandedDay])
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  return null;
};

const AdminDashboard = () => {
  const [period, setPeriod] = useState("today");
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [stats, setStats] = useState({ revenue: 0, profit: 0, workerStats: [] as any[] });
  const [chartData, setChartData] = useState<any[]>([]);
  const [workerSessions, setWorkerSessions] = useState<{ [workerId: string]: any[] }>({});
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [sessionProducts, setSessionProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchWorkerSessions();
  }, [period, customDate]);

  useEffect(() => {
    fetchChartData();
  }, [period, customDate]);

  const getDateRange = () => {
    const now = new Date();
    let start: Date;

    if (customDate) {
      // Custom date selected - show just that day
      start = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate());
    } else if (period === "today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }
    return start.toISOString();
  };

  const fetchStats = async () => {
    const since = getDateRange();
    const { data: sales } = await supabase
      .from("sales")
      .select("total, profit, worker_id")
      .gte("created_at", since);

    if (!sales) return;

    const revenue = sales.reduce((s, r) => s + Number(r.total), 0);
    const profit = sales.reduce((s, r) => s + Number(r.profit), 0);

    const { data: workers } = await supabase.from("workers").select("id, name");
    const workerMap = new Map((workers || []).map((w: any) => [w.id, w.name]));

    const byWorker = new Map<string, { revenue: number; profit: number; name: string; workerId: string }>();
    sales.forEach((s) => {
      const existing = byWorker.get(s.worker_id) || { revenue: 0, profit: 0, name: workerMap.get(s.worker_id) || "Unknown", workerId: s.worker_id };
      existing.revenue += Number(s.total);
      existing.profit += Number(s.profit);
      byWorker.set(s.worker_id, existing);
    });

    setStats({
      revenue,
      profit,
      workerStats: Array.from(byWorker.values()),
    });
  };

  const fetchChartData = async () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const date = now.getDate();

    let startDate: string;
    let endDate: string;
    let dataMap: any[] = [];

    // Handle custom date selection
    if (customDate) {
      const customYear = customDate.getFullYear();
      const customMonth = customDate.getMonth();
      const customDay = customDate.getDate();

      const dayStart = new Date(customYear, customMonth, customDay);
      startDate = dayStart.toISOString();
      endDate = new Date(customYear, customMonth, customDay, 23, 59, 59).toISOString();

      // Show 24 hours for custom day
      dataMap = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        revenue: 0,
        profit: 0
      }));
    } else if (period === "today") {
      // Get today's date string
      const today = new Date(year, month, date);
      startDate = today.toISOString();
      endDate = new Date(year, month, date, 23, 59, 59).toISOString();

      // Initialize 24 hours
      dataMap = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        revenue: 0,
        profit: 0
      }));
    } else if (period === "month") {
      // Get first day of month
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();

      startDate = firstDay.toISOString();
      endDate = lastDay.toISOString();

      // Initialize days of month
      dataMap = Array.from({ length: daysInMonth }, (_, i) => ({
        label: `${i + 1}`,
        revenue: 0,
        profit: 0
      }));
    } else {
      // Year view - existing behavior
      startDate = `${year}-01-01`;
      endDate = `${year}-12-31`;

      // Initialize 12 months
      dataMap = Array.from({ length: 12 }, (_, i) => {
        const monthName = new Date(year, i).toLocaleString("default", { month: "short" });
        return { label: monthName, revenue: 0, profit: 0 };
      });
    }

    const { data: sales } = await supabase
      .from("sales")
      .select("total, profit, created_at")
      .gte("created_at", startDate)
      .lte("created_at", endDate);

    if (!sales) return;

    sales.forEach((s) => {
      const saleDate = new Date(s.created_at);

      // For custom date, group by hour
      if (customDate || period === "today") {
        const hour = saleDate.getHours();
        dataMap[hour].revenue += Number(s.total);
        dataMap[hour].profit += Number(s.profit);
      } else if (period === "month") {
        const day = saleDate.getDate() - 1;
        dataMap[day].revenue += Number(s.total);
        dataMap[day].profit += Number(s.profit);
      } else {
        const m = saleDate.getMonth();
        dataMap[m].revenue += Number(s.total);
        dataMap[m].profit += Number(s.profit);
      }
    });

    setChartData(dataMap);
  };

  const fetchWorkerSessions = async () => {
    const since = getDateRange();

    // Fetch sessions for the date range
    const { data: sessions } = await supabase
      .from("sessions")
      .select("id, worker_id, started_at, closed_at, total_revenue")
      .gte("started_at", since)
      .order("started_at", { ascending: false });

    if (!sessions) return;

    // Group sessions by worker
    const sessionsByWorker: { [workerId: string]: any[] } = {};
    sessions.forEach((session) => {
      if (!sessionsByWorker[session.worker_id]) {
        sessionsByWorker[session.worker_id] = [];
      }
      sessionsByWorker[session.worker_id].push(session);
    });

    setWorkerSessions(sessionsByWorker);
  };

  const fetchSessionProducts = async (sessionId: string) => {
    // First get all sales for this session
    const { data: sales } = await supabase
      .from("sales")
      .select("id")
      .eq("session_id", sessionId);

    if (!sales || sales.length === 0) {
      setSessionProducts([]);
      return;
    }

    const saleIds = sales.map(s => s.id);

    // Get all sale items for these sales
    const { data: items } = await supabase
      .from("sale_items")
      .select("product_name, quantity, unit_price")
      .in("sale_id", saleIds);

    if (!items) {
      setSessionProducts([]);
      return;
    }

    // Group by product name and sum quantities
    const productMap = new Map<string, { name: string; quantity: number; price: number }>();
    items.forEach((item) => {
      const existing = productMap.get(item.product_name);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        productMap.set(item.product_name, {
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price
        });
      }
    });

    setSessionProducts(Array.from(productMap.values()));
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">لوحة الإحصائيات</h2>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={customDate ? "default" : "outline"}
                className="h-9 rounded-xl"
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {customDate ? customDate.toLocaleDateString("en-US") : "تاريخ مخصص"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={(date) => {
                  setCustomDate(date);
                  if (date) {
                    setPeriod("today");
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={period} onValueChange={(val) => {
            setPeriod(val);
            if (val !== "today") {
              setCustomDate(undefined);
            }
          }}>
            <SelectTrigger className="w-32 h-9 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">اليوم</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-xl shadow-sm border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">الإيرادات</p>
            <p className="text-xl font-bold mt-1 tabular-nums">{stats.revenue.toLocaleString()} دج</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">الأرباح</p>
            <p className="text-xl font-bold mt-1 tabular-nums">{stats.profit.toLocaleString()} دج</p>
          </CardContent>
        </Card>
      </div>

      {
        stats.workerStats.length > 0 && (
          <Card className="rounded-xl shadow-sm border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">حسب العامل</p>
              <GroupedWorkerSessions
                period={period}
                customDate={customDate}
                workerSessions={workerSessions}
                stats={stats}
                onSessionClick={(session) => {
                  setSelectedSession(session);
                  fetchSessionProducts(session.id);
                }}
              />
            </CardContent>
          </Card>
        )
      }

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الوردية</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>وقت البدء:</span>
                </div>
                <span className="font-medium">
                  {new Date(selectedSession.started_at).toLocaleString("en-US")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>وقت الإغلاق:</span>
                </div>
                <span className="font-medium">
                  {selectedSession.closed_at
                    ? new Date(selectedSession.closed_at).toLocaleString("en-US")
                    : "مفتوحة"}
                </span>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm font-medium mb-2">المنتجات المباعة:</p>
                {sessionProducts.length > 0 ? (
                  <div className="space-y-1">
                    {sessionProducts.map((product, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{product.name}</span>
                        <div className="text-right">
                          <span className="ml-2">×{product.quantity}</span>
                          <span className="text-muted-foreground ml-2">
                            {(product.quantity * product.price).toLocaleString()} دج
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">لا توجد منتجات مباعة</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card className="rounded-xl shadow-sm border-border">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">الإحصائيات</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 91%)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(0, 0%, 15%)" radius={[4, 4, 0, 0]} name="الإيرادات" />
                <Bar dataKey="profit" fill="hsl(0, 0%, 60%)" radius={[4, 4, 0, 0]} name="الأرباح" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div >
  );
};

export default AdminDashboard;
