import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plane, 
  Users, 
  DollarSign, 
  Building2, 
  TrendingUp,
  Clock,
  MapPin,
  BarChart3,
  Plus
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { reportService } from "@/services/reportService";
import { flightService } from "@/services/flightService";
import { useAuth } from "@/hooks/useAuth";
import AddWorkerModal from "@/components/AddWorkerModal";



const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<any[]>([]);
  const [recentFlights, setRecentFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWorker, setShowAddWorker] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadDashboardData();
    }
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      const [dashboardStats, flights] = await Promise.all([
        reportService.getDashboardStats(user?.role || "Staff"),
        flightService.getAllFlights({ status: "scheduled,boarding,departed" }),
      ]);

      // Map stats based on role
      const statsArray = [
        { title: "Total Flights Today", value: dashboardStats.totalFlights?.toString() || "0", icon: Plane, trend: { value: 12, positive: true } },
        { title: "Active Passengers", value: dashboardStats.activePassengers?.toLocaleString() || "0", icon: Users, trend: { value: 8, positive: true } },
        { title: "Revenue (This Week)", value: `₹${(dashboardStats.weeklyRevenue / 1000).toFixed(1)}K` || "₹0", icon: DollarSign, trend: { value: 15, positive: true } },
        { title: "Airport Workers", value: dashboardStats.totalWorkers?.toString() || "0", icon: Building2, trend: { value: 3, positive: false } },
      ];

      setStats(statsArray);
      setRecentFlights(flights.slice(0, 5));
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Using offline mode.",
        variant: "destructive",
      });
      // Fallback to mock data
      setStats([
        { title: "Total Flights Today", value: "42", icon: Plane, trend: { value: 12, positive: true } },
        { title: "Active Passengers", value: "2,847", icon: Users, trend: { value: 8, positive: true } },
        { title: "Revenue (This Week)", value: "₹124.5K", icon: DollarSign, trend: { value: 15, positive: true } },
        { title: "Airport Workers", value: "156", icon: Building2, trend: { value: 3, positive: false } },
      ]);
      setRecentFlights([
        { flight_number: "AI101", departure_airport: "BLR", arrival_airport: "DEL", departure_time: "10:30", status: "boarding", available_seats: 45 },
        { flight_number: "6E202", departure_airport: "DEL", arrival_airport: "BOM", departure_time: "11:15", status: "scheduled", available_seats: 120 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SkyHub</h1>
              <p className="text-xs text-muted-foreground">Airport Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user.role}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div className="flex gap-2">
                {user.role === "Manager" && (
                    <Button size="sm" onClick={() => setShowAddWorker(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Worker
                    </Button>
                )}
                {(user.role === "Admin" || user.role === "Manager" || user.role === "Staff") && (
                    <Button size="sm" onClick={() => navigate("/book-ticket")} className="gap-2">
                    Book Ticket
                    </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 space-y-8">
        {/* Welcome Section */}
        <div className="animate-fade-in">
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            Welcome back, {user.role}!
          </h2>
          <p className="text-muted-foreground">
            Here's what's happening with your airport today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-slide-in">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Flights */}
          <Card className="animate-slide-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recent Flights
                  </CardTitle>
                  <CardDescription>Today's flight schedule</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/flights")}
                >
                  View all →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFlights.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No recent flights</p>
                ) : (
                  recentFlights.map((flight) => (
                    <div
                      key={flight.flight_number}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-primary rounded-md">
                          <Plane className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{flight.flight_number}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {flight.departure_airport} → {flight.arrival_airport}
                        </p>

                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{flight.departure_time}</p>
                        <Badge variant={flight.status as any} className="text-xs">
                          {flight.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="animate-slide-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Performance Overview
              </CardTitle>
              <CardDescription>Key metrics at a glance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Flight Occupancy</span>
                  <span className="font-semibold">78%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-primary w-[78%] transition-all" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">On-Time Performance</span>
                  <span className="font-semibold">92%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success w-[92%] transition-all" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Customer Satisfaction</span>
                  <span className="font-semibold">88%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[88%] transition-all" />
                </div>
              </div>

              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-xs text-muted-foreground">Arrived</p>
                  <p className="text-2xl font-bold text-success">24</p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-xs text-muted-foreground">Delayed</p>
                  <p className="text-2xl font-bold text-warning">3</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {showAddWorker && (
        <AddWorkerModal
            onClose={() => setShowAddWorker(false)}
            onWorkerAdded={() => {
            toast({
                title: "Worker list updated",
                description: "Dashboard refreshed with new worker info.",
            });
            loadDashboardData(); // 🔹 refresh data instantly
            }}
        />
        )}
    </div>
  );
};

export default Dashboard;
