import React, { useState, useEffect } from 'react';
import { Plane, LogOut, User, DollarSign, Award, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const DashboardAirportStaff = () => {
  const [user, setUser] = useState(null);
  const [workerDetails, setWorkerDetails] = useState(null);
  const [annualEarnings, setAnnualEarnings] = useState(null);
  const [promotionEligible, setPromotionEligible] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      loadStaffData(parsed);
    }
  }, []);

  const loadStaffData = async (userData) => {
    try {
      setLoading(true);

      const detailsRes = await fetch(`http://localhost:3001/api/workers/${userData.worker_id}/details`);
      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        if (detailsData.success) setWorkerDetails(detailsData.data);
      }

      const earningsRes = await fetch(`http://localhost:3001/api/workers/${userData.worker_id}/earnings?months=12&bonus=10`);
      const earningsData = await earningsRes.json();
      if (earningsData.success) setAnnualEarnings(earningsData.total_earnings);

      const promotionRes = await fetch(`http://localhost:3001/api/workers/${userData.worker_id}/promotion`);
      const promotionData = await promotionRes.json();
      if (promotionData.success) setPromotionEligible(promotionData.eligible);

    } catch (error) {
      console.error('Error loading staff data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
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
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Plane className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SkyHub</h1>
              <p className="text-xs text-muted-foreground">Airport Staff Portal</p>
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

      {/* Main Dashboard Content */}
      <main className="container px-4 py-8 space-y-6">
        {/* Personal Info Card */}
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
                <p className="text-sm text-muted-foreground">Airport</p>
                <p className="text-lg font-semibold">{user?.airport_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="text-base">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Section */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Salary</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{workerDetails?.payment?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Annual Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{annualEarnings?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">With 10% bonus</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promotion Status</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {promotionEligible ? '✅ Eligible' : '❌ Not Yet'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {promotionEligible ? 'Contact HR' : 'Continue good work'}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardAirportStaff;