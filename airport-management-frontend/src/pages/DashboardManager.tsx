import React, { useState, useEffect } from 'react';
import { Plane, LogOut, Users, DollarSign, TrendingUp, Award, Plus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const DashboardManager = () => {
  const [user, setUser] = useState(null);
  const [storeWorkers, setStoreWorkers] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
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

  // Daily Revenue Entry
  const [revenueDialog, setRevenueDialog] = useState(false);
  const [dailyRevenue, setDailyRevenue] = useState('');
  const [profitLoss, setProfitLoss] = useState('');
  const [revenueNotes, setRevenueNotes] = useState('');

  // Store Stats
  const [storeRating, setStoreRating] = useState('');
  const [totalPayroll, setTotalPayroll] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      loadManagerData(parsed);
    }
  }, []);

  const loadManagerData = async (userData) => {
    try {
      setLoading(true);
      
      // NOTE: This endpoint needs to be added - GET /api/stores/:store_id/workers
      const workersRes = await fetch(`http://localhost:3001/api/stores/${userData.store_id}/workers`);
      if (workersRes.ok) {
        const workersData = await workersRes.json();
        if (workersData.success) setStoreWorkers(workersData.data);
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

      // Calculate total payroll
      const allWorkersRes = await fetch('http://localhost:3001/api/workers');
      const allWorkersData = await allWorkersRes.json();
      if (allWorkersData.success) {
        const myWorkers = allWorkersData.data.filter(w => w.store_id === userData.store_id && w.status === 'active');
        setStoreWorkers(myWorkers);
        const total = myWorkers.reduce((sum, w) => sum + parseFloat(w.payment || 0), 0);
        setTotalPayroll(total);
      }

    } catch (error) {
      console.error('Error loading manager data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Hire Store Worker
  const handleHireWorker = async () => {
    if (!user?.store_id) {
      toast.error('Store information not found');
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
        loadManagerData(user);
      } else {
        toast.error(data.error || 'Failed to hire worker');
      }
    } catch (error) {
      toast.error('Error hiring worker');
    }
  };

  // Generate Store Payroll Report
  const handlePayrollReport = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/reports/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ airport_id: user.airport_id })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Payroll report generated');
        console.log('Payroll data:', data.data);
      }
    } catch (error) {
      toast.error('Error generating payroll report');
    }
  };

  // Submit Daily Revenue
  const handleSubmitRevenue = async () => {
    if (!dailyRevenue) {
      toast.error('Please enter daily revenue');
      return;
    }

    try {
      // NOTE: This endpoint needs to be added - POST /api/stores/:store_id/revenue
      const res = await fetch(`http://localhost:3001/api/stores/${user.store_id}/revenue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          revenue: parseFloat(dailyRevenue),
          profit_loss: parseFloat(profitLoss || 0),
          notes: revenueNotes,
          date: new Date().toISOString().split('T')[0]
        })
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Daily revenue recorded');
        setRevenueDialog(false);
        setDailyRevenue('');
        setProfitLoss('');
        setRevenueNotes('');
      } else {
        toast.error('Failed to record revenue');
      }
    } catch (error) {
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
              <p className="text-xs text-muted-foreground">Manager Dashboard</p>
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
        {/* Store Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Store Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Store Name</p>
                <p className="text-lg font-semibold">{storeInfo?.name || 'N/A'}</p>
              </div>
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
              <div>
                <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                <p className="text-lg font-semibold">₹{totalPayroll.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hire Worker</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Dialog open={workerDialog} onOpenChange={setWorkerDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store Worker
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Hire Store Worker</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Worker ID</Label>
                        <Input
                          value={workerForm.worker_id}
                          onChange={(e) => setWorkerForm({...workerForm, worker_id: e.target.value})}
                          placeholder="W_200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
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
                        <Label>Age</Label>
                        <Input
                          type="number"
                          value={workerForm.age}
                          onChange={(e) => setWorkerForm({...workerForm, age: e.target.value})}
                          placeholder="25"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Monthly Payment (₹)</Label>
                        <Input
                          type="number"
                          value={workerForm.payment}
                          onChange={(e) => setWorkerForm({...workerForm, payment: e.target.value})}
                          placeholder="25000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        value={workerForm.job}
                        onChange={(e) => setWorkerForm({...workerForm, job: e.target.value})}
                        placeholder="e.g., Barista, Cashier, Sales Associate"
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Dialog open={revenueDialog} onOpenChange={setRevenueDialog}>
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Record Revenue
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record Daily Revenue</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Total Revenue (₹)</Label>
                      <Input
                        type="number"
                        value={dailyRevenue}
                        onChange={(e) => setDailyRevenue(e.target.value)}
                        placeholder="50000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Profit/Loss (₹)</Label>
                      <Input
                        type="number"
                        value={profitLoss}
                        onChange={(e) => setProfitLoss(e.target.value)}
                        placeholder="5000"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter positive for profit, negative for loss
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (Optional)</Label>
                      <Input
                        value={revenueNotes}
                        onChange={(e) => setRevenueNotes(e.target.value)}
                        placeholder="Any additional notes"
                      />
                    </div>
                    <Button onClick={handleSubmitRevenue}>Submit Revenue</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payroll Report</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button onClick={handlePayrollReport} className="w-full">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="workers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workers">Store Workers</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          {/* Workers Tab */}
          <TabsContent value="workers">
            <Card>
              <CardHeader>
                <CardTitle>Store Workers ({storeWorkers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {storeWorkers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No workers found. Hire your first worker!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {storeWorkers.map(worker => (
                      <div key={worker.worker_id} className="p-4 border rounded-lg hover:bg-accent/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{worker.name}</p>
                            <p className="text-sm text-muted-foreground">{worker.job}</p>
                            <p className="text-sm text-muted-foreground">
                              Age: {worker.age} | Hired: {new Date(worker.hire_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">₹{worker.payment?.toLocaleString()}/month</p>
                            <Badge variant={worker.status === 'active' ? 'default' : 'secondary'}>
                              {worker.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              const res = await fetch(`http://localhost:3001/api/workers/${worker.worker_id}/earnings?months=12&bonus=10`);
                              const data = await res.json();
                              if (data.success) {
                                toast.success(`Annual Earnings (with 10% bonus): ₹${data.total_earnings.toLocaleString()}`);
                              }
                            } catch (error) {
                              toast.error('Failed to calculate earnings');
                            }
                          }}>
                            Calculate Earnings
                          </Button>
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              const res = await fetch(`http://localhost:3001/api/workers/${worker.worker_id}/promotion`);
                              const data = await res.json();
                              if (data.success) {
                                toast.success(data.eligible ? 'Eligible for Promotion!' : 'Not eligible yet');
                              }
                            } catch (error) {
                              toast.error('Failed to check eligibility');
                            }
                          }}>
                            Check Promotion
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Store Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Performance Rating</p>
                    <p className="text-2xl font-bold">{storeRating}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold">{storeWorkers.length}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                    <p className="text-2xl font-bold">₹{totalPayroll.toLocaleString()}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Average Salary</p>
                    <p className="text-2xl font-bold">
                      ₹{storeWorkers.length > 0 ? Math.round(totalPayroll / storeWorkers.length).toLocaleString() : 0}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="font-semibold mb-2">Performance Insights</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• {storeWorkers.filter(w => w.status === 'active').length} active workers</li>
                    <li>• Average age: {storeWorkers.length > 0 ? Math.round(storeWorkers.reduce((sum, w) => sum + w.age, 0) / storeWorkers.length) : 0} years</li>
                    <li>• Total monthly payroll: ₹{totalPayroll.toLocaleString()}</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Worker Earnings & Eligibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {storeWorkers.map(worker => (
                    <div key={worker.worker_id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{worker.name}</p>
                          <p className="text-sm text-muted-foreground">{worker.job}</p>
                        </div>
                        <div className="text-right space-y-2">
                          <p className="text-sm font-medium">Monthly: ₹{worker.payment?.toLocaleString()}</p>
                          <div className="flex gap-2">
                            <Button size="xs" variant="outline" onClick={async () => {
                              try {
                                const res = await fetch(`http://localhost:3001/api/workers/${worker.worker_id}/earnings?months=12&bonus=15`);
                                const data = await res.json();
                                if (data.success) {
                                  alert(`Annual Earnings:\nBase: ₹${(worker.payment * 12).toLocaleString()}\nWith 15% Bonus: ₹${data.total_earnings.toLocaleString()}`);
                                }
                              } catch (error) {
                                toast.error('Failed to calculate');
                              }
                            }}>
                              Calculate Annual
                            </Button>
                            <Button size="xs" variant="outline" onClick={async () => {
                              try {
                                const res = await fetch(`http://localhost:3001/api/workers/${worker.worker_id}/promotion`);
                                const data = await res.json();
                                if (data.success) {
                                  const eligible = data.eligible;
                                  alert(eligible ? '✅ Eligible for Promotion!' : '❌ Not eligible for promotion yet');
                                }
                              } catch (error) {
                                toast.error('Failed to check');
                              }
                            }}>
                              Promotion Check
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardManager;