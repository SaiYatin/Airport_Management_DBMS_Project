import React, { useState, useEffect } from 'react';
import { Plane, LogOut, Users, DollarSign, TrendingUp, Award, Plus, Store, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const DashboardStoreOwner = () => {
  const [user, setUser] = useState(null);
  const [storeWorkers, setStoreWorkers] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeRating, setStoreRating] = useState('');
  const [totalPayroll, setTotalPayroll] = useState(0);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [dailyWorkerRevenue, setDailyWorkerRevenue] = useState([]);
  const [totalDailyWorkerRevenue, setTotalDailyWorkerRevenue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  // Hire Worker Dialog
  const [workerDialog, setWorkerDialog] = useState(false);
  const [workerForm, setWorkerForm] = useState({
    worker_id: '',
    name: '',
    email: '',
    age: '',
    job: '',
    payment: ''
  });

  // Revenue Dialog
  const [revenueDialog, setRevenueDialog] = useState(false);
  const [revenueForm, setRevenueForm] = useState({
    total_revenue: '',
    supply_cost: '',
    other_costs: '',
    notes: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      loadStoreOwnerData(parsed);
    }
  }, []);

  useEffect(() => {
    if (user?.store_id) {
      loadDailyWorkerRevenue(user.store_id, selectedDate);
    }
  }, [selectedDate, user]);

  const loadStoreOwnerData = async (userData) => {
    try {
      setLoading(true);

      // Validate store_id exists
      if (!userData.store_id) {
        toast.error('Store ID not found in user data');
        return;
      }

      // Get store-specific workers using the new endpoint
      const workersRes = await fetch(`http://localhost:3001/api/stores/${userData.store_id}/workers`);
      const workersData = await workersRes.json();
      if (workersData.success) {
        setStoreWorkers(workersData.data || []);
        const total = (workersData.data || []).reduce((sum, w) => sum + parseFloat(w.payment || 0), 0);
        setTotalPayroll(total);
      }

      // Get store info
      const storesRes = await fetch('http://localhost:3001/api/stores');
      const storesData = await storesRes.json();
      if (storesData.success) {
        const myStore = storesData.data.find(s => s.store_id === userData.store_id);
        setStoreInfo(myStore);
      }

      // Get store rating
      const ratingRes = await fetch(`http://localhost:3001/api/stores/${userData.store_id}/rating`);
      const ratingData = await ratingRes.json();
      if (ratingData.success) setStoreRating(ratingData.performance_rating);

      // Get revenue history
      const revenueRes = await fetch(`http://localhost:3001/api/stores/${userData.store_id}/revenue`);
      if (revenueRes.ok) {
        const revenueData = await revenueRes.json();
        if (revenueData.success) setRevenueHistory(revenueData.data || []);
      }

      // Load today's worker revenue
      loadDailyWorkerRevenue(userData.store_id, selectedDate);

    } catch (error) {
      console.error('Error loading store owner data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadDailyWorkerRevenue = async (storeId, date) => {
    try {
      const res = await fetch(`http://localhost:3001/api/stores/${storeId}/daily-worker-revenue?date=${date}`);
      const data = await res.json();
      if (data.success) {
        setDailyWorkerRevenue(data.data || []);
        setTotalDailyWorkerRevenue(data.total_worker_revenue || 0);
      }
    } catch (error) {
      console.error('Error loading daily worker revenue:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleHireWorker = async () => {
    if (!user?.store_id) {
      toast.error('Store information not found');
      return;
    }

    if (!workerForm.worker_id || !workerForm.name || !workerForm.age || !workerForm.job || !workerForm.payment) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/api/workers/hire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'Manager',
          'x-user-id': user.worker_id
        },
        body: JSON.stringify({
          worker_id: workerForm.worker_id,
          name: workerForm.name,
          email: workerForm.email || null,
          age: parseInt(workerForm.age),
          job: workerForm.job,
          payment: parseFloat(workerForm.payment),
          store_id: user.store_id,
          airport_id: user.airport_id
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Worker hired successfully');
        setWorkerDialog(false);
        setWorkerForm({ worker_id: '', name: '', email: '', age: '', job: '', payment: '' });
        loadStoreOwnerData(user);
      } else {
        toast.error(data.message || data.error || 'Failed to hire worker');
      }
    } catch (error) {
      console.error('Hire worker error:', error);
      toast.error('Error hiring worker');
    }
  };

  const handleSubmitRevenue = async () => {
    if (!revenueForm.total_revenue) {
      toast.error('Please enter total store revenue');
      return;
    }

    if (!user?.store_id) {
      toast.error('Store ID not found');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/stores/${user.store_id}/daily-revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenue_date: selectedDate,
          total_revenue: parseFloat(revenueForm.total_revenue),
          supply_cost: parseFloat(revenueForm.supply_cost || 0),
          other_costs: parseFloat(revenueForm.other_costs || 0),
          notes: revenueForm.notes
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Daily revenue recorded successfully!');
        setRevenueDialog(false);
        setRevenueForm({ total_revenue: '', supply_cost: '', other_costs: '', notes: '' });
        loadStoreOwnerData(user);
      } else {
        toast.error(data.message || 'Failed to record revenue');
      }
    } catch (error) {
      console.error('Revenue submission error:', error);
      toast.error('Error recording revenue');
    }
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
              <p className="text-xs text-muted-foreground">Store Owner Dashboard</p>
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
        {/* Store Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              {storeInfo?.name || 'Your Store'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Store ID</p>
                <p className="text-lg font-semibold">{user?.store_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Store Type</p>
                <p className="text-lg font-semibold capitalize">{storeInfo?.store_type || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Performance Rating</p>
                <Badge className="text-base">{storeRating || 'Loading...'}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Workers</p>
                <p className="text-lg font-semibold">{storeWorkers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalPayroll.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {storeWorkers.length} active workers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Worker Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalDailyWorkerRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Generated on {new Date(selectedDate).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{storeRating || 'N/A'}</div>
              <p className="text-xs text-muted-foreground mt-1">Store rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid gap-4 md:grid-cols-2">
          <Dialog open={workerDialog} onOpenChange={setWorkerDialog}>
            <DialogTrigger asChild>
              <Button className="h-20 text-base">
                <Plus className="h-5 w-5 mr-2" />
                Hire Store Worker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hire Store Worker</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Worker ID *</Label>
                    <Input
                      value={workerForm.worker_id}
                      onChange={(e) => setWorkerForm({...workerForm, worker_id: e.target.value})}
                      placeholder="W030"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={workerForm.name}
                      onChange={(e) => setWorkerForm({...workerForm, name: e.target.value})}
                      placeholder="Worker name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={workerForm.email}
                    onChange={(e) => setWorkerForm({...workerForm, email: e.target.value})}
                    placeholder="worker@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Age *</Label>
                    <Input
                      type="number"
                      value={workerForm.age}
                      onChange={(e) => setWorkerForm({...workerForm, age: e.target.value})}
                      placeholder="25"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Payment (₹) *</Label>
                    <Input
                      type="number"
                      value={workerForm.payment}
                      onChange={(e) => setWorkerForm({...workerForm, payment: e.target.value})}
                      placeholder="22000"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Job Title *</Label>
                  <Input
                    value={workerForm.job}
                    onChange={(e) => setWorkerForm({...workerForm, job: e.target.value})}
                    placeholder="e.g., Sales Associate, Cashier"
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg space-y-1">
                  <p className="text-sm font-medium">Auto-filled Store Info:</p>
                  <p className="text-xs text-muted-foreground">Store: {storeInfo?.name}</p>
                  <p className="text-xs text-muted-foreground">Store ID: {user?.store_id}</p>
                  <p className="text-xs text-muted-foreground">Airport ID: {user?.airport_id}</p>
                </div>
                <Button onClick={handleHireWorker}>Hire Worker</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={revenueDialog} onOpenChange={setRevenueDialog}>
            <DialogTrigger asChild>
              <Button className="h-20 text-base">
                <TrendingUp className="h-5 w-5 mr-2" />
                Record Daily Revenue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Daily Store Revenue</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Worker Generated Revenue:</p>
                  <p className="text-2xl font-bold">₹{totalDailyWorkerRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sum of all worker contributions for {new Date(selectedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Total Store Revenue (₹) *</Label>
                  <Input
                    type="number"
                    value={revenueForm.total_revenue}
                    onChange={(e) => setRevenueForm({...revenueForm, total_revenue: e.target.value})}
                    placeholder="75000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supply/Material Costs (₹)</Label>
                  <Input
                    type="number"
                    value={revenueForm.supply_cost}
                    onChange={(e) => setRevenueForm({...revenueForm, supply_cost: e.target.value})}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Other Expenses (₹)</Label>
                  <Input
                    type="number"
                    value={revenueForm.other_costs}
                    onChange={(e) => setRevenueForm({...revenueForm, other_costs: e.target.value})}
                    placeholder="5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes (Optional)</Label>
                  <Input
                    value={revenueForm.notes}
                    onChange={(e) => setRevenueForm({...revenueForm, notes: e.target.value})}
                    placeholder="Any additional notes"
                  />
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Profit Calculation:</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Revenue - Worker Revenue - Costs = Profit/Loss
                  </p>
                  <p className="text-sm font-bold text-blue-900 mt-2">
                    ₹{(parseFloat(revenueForm.total_revenue || 0) - totalDailyWorkerRevenue - parseFloat(revenueForm.supply_cost || 0) - parseFloat(revenueForm.other_costs || 0)).toLocaleString()}
                  </p>
                </div>
                <Button onClick={handleSubmitRevenue}>Submit Revenue</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="workers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workers">Workers & Daily Revenue</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="revenue">Revenue History</TabsTrigger>
          </TabsList>

          {/* Workers Tab with Daily Revenue */}
          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Daily Worker Revenue</CardTitle>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-auto"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <p className="text-sm text-muted-foreground">Total Worker Revenue for {new Date(selectedDate).toLocaleDateString()}</p>
                  <p className="text-3xl font-bold text-primary">₹{totalDailyWorkerRevenue.toLocaleString()}</p>
                </div>

                {dailyWorkerRevenue.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No revenue entries for this date. Workers need to log their daily revenue.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dailyWorkerRevenue.map((entry, idx) => (
                      <div key={idx} className="p-4 border rounded-lg hover:bg-accent/50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{entry.worker_name}</p>
                            <p className="text-sm text-muted-foreground">{entry.job}</p>
                            <p className="text-xs text-muted-foreground">ID: {entry.worker_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-600">₹{parseFloat(entry.revenue).toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Generated</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-3">All Store Workers ({storeWorkers.length})</h3>
                  {storeWorkers.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No workers hired yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {storeWorkers.map(worker => (
                        <div key={worker.worker_id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{worker.name}</p>
                              <p className="text-sm text-muted-foreground">{worker.job}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{worker.payment?.toLocaleString()}/month</p>
                              <Badge variant={worker.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                                {worker.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Store Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Performance Rating</p>
                    <p className="text-3xl font-bold">{storeRating}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-3xl font-bold">{storeWorkers.length}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                    <p className="text-3xl font-bold">₹{totalPayroll.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Salary</p>
                    <p className="text-3xl font-bold">
                      ₹{storeWorkers.length > 0 ? Math.round(totalPayroll / storeWorkers.length).toLocaleString() : 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-3">Performance Insights</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Workers:</span>
                      <span className="font-medium">{storeWorkers.filter(w => w.status === 'active').length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Age:</span>
                      <span className="font-medium">
                        {storeWorkers.length > 0 ? Math.round(storeWorkers.reduce((sum, w) => sum + w.age, 0) / storeWorkers.length) : 0} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Payroll:</span>
                      <span className="font-medium">₹{totalPayroll.toLocaleString()}/month</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue History Tab */}
          <TabsContent value="revenue">
            <Card>
              <CardHeader>
                <CardTitle>Revenue History</CardTitle>
              </CardHeader>
              <CardContent>
                {revenueHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No revenue records yet. Start recording your daily revenue!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {revenueHistory.map((record, idx) => (
                      <div key={idx} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-semibold">
                              {new Date(record.revenue_date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                            {record.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                            )}
                            <div className="mt-2 text-xs text-muted-foreground">
                              Worker Revenue: ₹{parseFloat(record.worker_revenue || 0).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">₹{parseFloat(record.revenue || 0).toLocaleString()}</p>
                            <p className={`text-sm font-semibold ${parseFloat(record.profit_loss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(record.profit_loss) >= 0 ? '+' : ''}₹{parseFloat(record.profit_loss || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">Profit/Loss</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardStoreOwner;