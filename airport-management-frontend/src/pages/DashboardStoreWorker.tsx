import React, { useState, useEffect } from "react";
import { Plane, LogOut, User, DollarSign, Award, TrendingUp, Calendar, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const DashboardStoreWorker = () => {
  const [user, setUser] = useState(null);
  const [workerDetails, setWorkerDetails] = useState(null);
  const [storeInfo, setStoreInfo] = useState(null);
  const [annualEarnings, setAnnualEarnings] = useState(null);
  const [promotionEligible, setPromotionEligible] = useState(null);
  const [revenueContribution, setRevenueContribution] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Revenue entry state
  const [todayRevenue, setTodayRevenue] = useState("");
  const [revenueDate, setRevenueDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingRevenue, setSavingRevenue] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      loadWorkerData(parsed);
    }
  }, []);

  const loadWorkerData = async (userData) => {
    try {
      setLoading(true);

      const workersRes = await fetch("http://localhost:3001/api/workers");
      const workersData = await workersRes.json();
      if (workersData.success) {
        const myDetails = workersData.data.find((w) => w.worker_id === userData.worker_id);
        setWorkerDetails(myDetails);

        if (myDetails?.payment) {
          setRevenueContribution(myDetails.payment * 0.5);
        }
      }

      const storesRes = await fetch("http://localhost:3001/api/stores");
      const storesData = await storesRes.json();
      if (storesData.success) {
        const myStore = storesData.data.find((s) => s.store_id === userData.store_id);
        setStoreInfo(myStore);
      }

      const earningsRes = await fetch(
        `http://localhost:3001/api/workers/${userData.worker_id}/earnings?months=12&bonus=10`
      );
      const earningsData = await earningsRes.json();
      if (earningsData.success) setAnnualEarnings(earningsData.total_earnings);

      const promotionRes = await fetch(
        `http://localhost:3001/api/workers/${userData.worker_id}/promotion`
      );
      const promotionData = await promotionRes.json();
      if (promotionData.success) setPromotionEligible(promotionData.eligible);
    } catch (error) {
      console.error("Error loading worker data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRevenue = async () => {
    if (!todayRevenue || parseFloat(todayRevenue) <= 0) {
      toast.error("Please enter a valid revenue amount");
      return;
    }

    try {
      setSavingRevenue(true);
      
      const response = await fetch("http://localhost:3001/api/workers/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id: user.worker_id,
          store_id: user.store_id,
          revenue: parseFloat(todayRevenue),
          revenue_date: revenueDate
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Revenue logged successfully!");
        setTodayRevenue("");
      } else {
        toast.error(data.message || "Failed to log revenue");
      }
    } catch (error) {
      console.error("Error saving revenue:", error);
      toast.error("Failed to save revenue");
    } finally {
      setSavingRevenue(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-medium">User not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SkyHub</h1>
              <p className="text-xs text-muted-foreground">Store Worker Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Welcome, {user?.name}</span>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p className="text-lg font-semibold">{user?.worker_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="text-lg font-semibold">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Job Title</p>
                <p className="text-lg font-semibold">{user?.job}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Store</p>
                <p className="text-lg font-semibold">{storeInfo?.name || user?.store_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="text-base">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{workerDetails?.payment?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Annual Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{annualEarnings?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">With bonus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue Contribution</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{revenueContribution?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Monthly estimate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Promotion Status</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promotionEligible ? "✅" : "❌"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {promotionEligible ? "Eligible" : "Not yet"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Revenue Entry */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Log Daily Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="revenue-date">Date</Label>
                <Input
                  id="revenue-date"
                  type="date"
                  value={revenueDate}
                  onChange={(e) => setRevenueDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="revenue-amount">Revenue Generated (₹)</Label>
                <Input
                  id="revenue-amount"
                  type="number"
                  placeholder="Enter amount"
                  value={todayRevenue}
                  onChange={(e) => setTodayRevenue(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <Button 
              onClick={handleSaveRevenue} 
              disabled={savingRevenue}
              className="w-full md:w-auto"
            >
              <Save className="h-4 w-4 mr-2" />
              {savingRevenue ? "Saving..." : "Save Revenue"}
            </Button>
          </CardContent>
        </Card>

        {/* Store Info & Performance */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="text-lg font-semibold">{user?.job}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Store</p>
                <p className="text-lg font-semibold">{storeInfo?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hire Date</p>
                <p className="text-lg font-semibold">
                  {workerDetails?.hire_date ? new Date(workerDetails.hire_date).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Salary</p>
                <p className="text-lg font-semibold">₹{workerDetails?.payment?.toLocaleString() || 0}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Store:</strong> {storeInfo?.name || "N/A"}</li>
                <li><strong>Type:</strong> {storeInfo?.store_type || "N/A"}</li>
                <li><strong>Location:</strong> {storeInfo?.place || "N/A"}</li>
                <li><strong>Airport:</strong> {user?.airport_id}</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardStoreWorker;