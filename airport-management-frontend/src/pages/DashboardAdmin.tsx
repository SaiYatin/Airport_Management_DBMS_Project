import React, { useState, useEffect } from 'react';
import { Plane, LogOut, Users, Calendar, DollarSign, BarChart3, Store, Plus, Edit, Eye, UserPlus, Shield, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const DashboardAdmin = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [airports, setAirports] = useState([]);
  const [stores, setStores] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [flightDialog, setFlightDialog] = useState(false);
  const [storeDialog, setStoreDialog] = useState(false);
  const [workerDialog, setWorkerDialog] = useState(false);
  const [updateJobDialog, setUpdateJobDialog] = useState(false);
  const [viewWorkerDialog, setViewWorkerDialog] = useState(false);
  const [adminDialog, setAdminDialog] = useState(false);
  const [managerDialog, setManagerDialog] = useState(false);

  // Selected Worker
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Flight Form
  const [flightForm, setFlightForm] = useState({
    flight_number: '',
    departure_airport: '',
    arrival_airport: '',
    flight_date: '',
    departure_hour: '',
    arrival_hour: '',
    total_seats: 180,
    flight_company_id: ''
  });

  // Store Form with Owner
  const [storeForm, setStoreForm] = useState({
    store_id: '',
    name: '',
    place: '',
    store_type: 'retail',
    product_type: '',
    airport_id: '',
    owner_name: '',
    owner_email: '',
    owner_age: '',
    owner_payment: ''
  });

  // Worker Form
  const [workerForm, setWorkerForm] = useState({
    worker_id: '',
    name: '',
    email: '',
    age: '',
    job: '',
    payment: '',
    store_id: '',
    airport_id: '',
    worker_type: 'airport'
  });

  // Update Job Form
  const [updateJobForm, setUpdateJobForm] = useState({
    job: '',
    payment: ''
  });

  // Admin Form
  const [adminForm, setAdminForm] = useState({
    worker_id: '',
    name: '',
    email: '',
    age: '',
    payment: '',
    airport_id: ''
  });

  // Manager Form
  const [managerForm, setManagerForm] = useState({
    worker_id: '',
    name: '',
    email: '',
    age: '',
    payment: '',
    airport_id: '',
    store_id: ''
  });

  const [complexStats, setComplexStats] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, airportsRes, storesRes, workersRes, companiesRes, flightsRes] = await Promise.all([
        fetch('http://localhost:3001/api/dashboard/stats'),
        fetch('http://localhost:3001/api/airports'),
        fetch('http://localhost:3001/api/stores'),
        fetch('http://localhost:3001/api/workers'),
        fetch('http://localhost:3001/api/flight-companies'),
        fetch('http://localhost:3001/api/flights')
      ]);

      const [statsData, airportsData, storesData, workersData, companiesData, flightsData] = await Promise.all([
        statsRes.json(),
        airportsRes.json(),
        storesRes.json(),
        workersRes.json(),
        companiesRes.json(),
        flightsRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (airportsData.success) setAirports(airportsData.data);
      if (storesData.success) setStores(storesData.data);
      if (workersData.success) setWorkers(workersData.data);
      if (companiesData.success) setCompanies(companiesData.data);
      if (flightsData.success) setFlights(flightsData.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Add Flight with Company
  const handleAddFlight = async () => {
    if (!flightForm.flight_company_id) {
      toast.error('Please select a flight company');
      return;
    }
    try {
      const res = await fetch('http://localhost:3001/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(flightForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Flight scheduled successfully');
        setFlightDialog(false);
        setFlightForm({ 
          flight_number: '', 
          departure_airport: '', 
          arrival_airport: '', 
          flight_date: '', 
          departure_hour: '', 
          arrival_hour: '', 
          total_seats: 180,
          flight_company_id: ''
        });
        loadData();
      } else {
        toast.error(data.error || 'Failed to schedule flight');
      }
    } catch (error) {
      toast.error('Error scheduling flight');
    }
  };

  // Add Store with Owner
  const handleAddStore = async () => {
    try {
      const storeRes = await fetch('http://localhost:3001/api/admin/stores', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'Admin',
          'x-user-id': user?.worker_id || ''
        },
        body: JSON.stringify({
          store_id: storeForm.store_id,
          name: storeForm.name,
          place: storeForm.place,
          store_type: storeForm.store_type,
          product_type: storeForm.product_type,
          airport_id: storeForm.airport_id
        })
      });
      const storeData = await storeRes.json();
      
      if (storeData.success) {
        if (storeForm.owner_name && storeForm.owner_email) {
          const ownerWorkerId = 'W_OWNER_' + Date.now();
          const ownerRes = await fetch('http://localhost:3001/api/workers/hire', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'x-user-role': 'Admin',
              'x-user-id': user?.worker_id || ''
            },
            body: JSON.stringify({
              worker_id: ownerWorkerId,
              name: storeForm.owner_name,
              email: storeForm.owner_email,
              age: parseInt(storeForm.owner_age),
              job: 'Store Owner',
              payment: parseFloat(storeForm.owner_payment),
              store_id: storeForm.store_id,
              airport_id: storeForm.airport_id
            })
          });
          const ownerData = await ownerRes.json();
          if (!ownerData.success) {
            toast.warning('Store added but owner creation failed: ' + ownerData.error);
          } else {
            toast.success('Store and owner added successfully');
          }
        } else {
          toast.success('Store added successfully');
        }
        
        setStoreDialog(false);
        setStoreForm({ 
          store_id: '', 
          name: '', 
          place: '', 
          store_type: 'retail', 
          product_type: '', 
          airport_id: '',
          owner_name: '',
          owner_email: '',
          owner_age: '',
          owner_payment: ''
        });
        loadData();
      } else {
        toast.error(storeData.error || 'Failed to add store');
      }
    } catch (error) {
      toast.error('Error adding store');
    }
  };

  // Hire Worker
  const handleHireWorker = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/workers/hire', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'Admin',
          'x-user-id': user?.worker_id || ''
        },
        body: JSON.stringify({
          worker_id: workerForm.worker_id,
          name: workerForm.name,
          email: workerForm.email,
          age: parseInt(workerForm.age),
          job: workerForm.job,
          payment: parseFloat(workerForm.payment),
          store_id: workerForm.worker_type === 'store' ? workerForm.store_id : null,
          airport_id: workerForm.airport_id
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Worker hired successfully');
        setWorkerDialog(false);
        setWorkerForm({ 
          worker_id: '', 
          name: '', 
          email: '', 
          age: '', 
          job: '', 
          payment: '', 
          store_id: '', 
          airport_id: '', 
          worker_type: 'airport' 
        });
        loadData();
      } else {
        toast.error(data.error || 'Failed to hire worker');
      }
    } catch (error) {
      toast.error('Error hiring worker');
    }
  };

  // Update Worker Job
  const handleUpdateJob = async () => {
    if (!selectedWorker) return;
    try {
      const res = await fetch(`http://localhost:3001/api/workers/${selectedWorker.worker_id}/job`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'Admin',
          'x-user-id': user?.worker_id || ''
        },
        body: JSON.stringify(updateJobForm)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Job updated successfully');
        setUpdateJobDialog(false);
        setSelectedWorker(null);
        setUpdateJobForm({ job: '', payment: '' });
        loadData();
      } else {
        toast.error(data.error || 'Failed to update job');
      }
    } catch (error) {
      toast.error('Error updating job');
    }
  };

  // View Worker Details
  const handleViewWorker = async (workerId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/workers/${workerId}/details`);
      const data = await res.json();
      if (data.success) {
        setSelectedWorker(data.data);
        setViewWorkerDialog(true);
      } else {
        toast.error('Failed to load worker details');
      }
    } catch (error) {
      toast.error('Error loading worker details');
    }
  };

  // Add Admin
  const handleAddAdmin = async () => {
    try {
      const adminWorkerId = adminForm.worker_id || 'W_ADMIN_' + Date.now();
      const res = await fetch('http://localhost:3001/api/workers/hire', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'Admin',
          'x-user-id': user?.worker_id || ''
        },
        body: JSON.stringify({
          worker_id: adminWorkerId,
          name: adminForm.name,
          email: adminForm.email,
          age: parseInt(adminForm.age),
          job: 'Admin',
          payment: parseFloat(adminForm.payment),
          store_id: null,
          airport_id: adminForm.airport_id
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Admin added successfully');
        setAdminDialog(false);
        setAdminForm({ worker_id: '', name: '', email: '', age: '', payment: '', airport_id: '' });
        loadData();
      } else {
        toast.error(data.error || 'Failed to add admin');
      }
    } catch (error) {
      toast.error('Error adding admin');
    }
  };

  // Add Manager
  const handleAddManager = async () => {
    try {
      const managerWorkerId = managerForm.worker_id || 'W_MGR_' + Date.now();
      const res = await fetch('http://localhost:3001/api/workers/hire', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': 'Admin',
          'x-user-id': user?.worker_id || ''
        },
        body: JSON.stringify({
          worker_id: managerWorkerId,
          name: managerForm.name,
          email: managerForm.email,
          age: parseInt(managerForm.age),
          job: 'Manager',
          payment: parseFloat(managerForm.payment),
          store_id: managerForm.store_id || null,
          airport_id: managerForm.airport_id
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Manager added successfully');
        setManagerDialog(false);
        setManagerForm({ worker_id: '', name: '', email: '', age: '', payment: '', airport_id: '', store_id: '' });
        loadData();
      } else {
        toast.error(data.error || 'Failed to add manager');
      }
    } catch (error) {
      toast.error('Error adding manager');
    }
  };

  // Load Complex Stats
  const loadComplexStats = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/admin/complex-stats', {
        headers: {
          'x-user-role': 'Admin',
          'x-user-id': user?.worker_id || ''
        }
      });
      const data = await res.json();
      if (data.success) {
        setComplexStats(data.data);
        toast.success('Complex stats loaded');
      } else {
        toast.error('Failed to load complex stats');
      }
    } catch (error) {
      toast.error('Error loading complex stats');
    }
  };

  // Filter flights
  const today = new Date().toISOString().split('T')[0];
  const upcomingFlights = flights.filter(f => f.flight_date >= today);
  const pastFlights = flights.filter(f => f.flight_date < today);

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
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
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
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flights Today</CardTitle>
              <Plane className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_flights_today || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Passengers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.active_passengers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue This Week</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.revenue_this_week?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_workers || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="operations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="flights">Flights</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="admins">Admin Mgmt</TabsTrigger>
            <TabsTrigger value="managers">Manager Mgmt</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Add Store */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Store Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Dialog open={storeDialog} onOpenChange={setStoreDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Store
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Store with Owner</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="font-semibold text-sm border-b pb-2">Store Details</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Store ID</Label>
                            <Input
                              value={storeForm.store_id}
                              onChange={(e) => setStoreForm({...storeForm, store_id: e.target.value})}
                              placeholder="e.g., ST012"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Store Name</Label>
                            <Input
                              value={storeForm.name}
                              onChange={(e) => setStoreForm({...storeForm, name: e.target.value})}
                              placeholder="Store name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Location/Place</Label>
                          <Input
                            value={storeForm.place}
                            onChange={(e) => setStoreForm({...storeForm, place: e.target.value})}
                            placeholder="e.g., Terminal 1"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Store Type</Label>
                            <Select value={storeForm.store_type} onValueChange={(val) => setStoreForm({...storeForm, store_type: val})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="retail">Retail</SelectItem>
                                <SelectItem value="food">Food</SelectItem>
                                <SelectItem value="duty-free">Duty-Free</SelectItem>
                                <SelectItem value="service">Service</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Product Type</Label>
                            <Input
                              value={storeForm.product_type}
                              onChange={(e) => setStoreForm({...storeForm, product_type: e.target.value})}
                              placeholder="e.g., Electronics"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Airport</Label>
                          <Select value={storeForm.airport_id} onValueChange={(val) => setStoreForm({...storeForm, airport_id: val})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select airport" />
                            </SelectTrigger>
                            <SelectContent>
                              {airports.map(a => (
                                <SelectItem key={a.airport_id} value={a.airport_id}>{a.name} ({a.airport_id})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="font-semibold text-sm border-b pb-2 mt-4">Store Owner Details (Optional)</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Owner Name</Label>
                            <Input
                              value={storeForm.owner_name}
                              onChange={(e) => setStoreForm({...storeForm, owner_name: e.target.value})}
                              placeholder="Full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Owner Email</Label>
                            <Input
                              type="email"
                              value={storeForm.owner_email}
                              onChange={(e) => setStoreForm({...storeForm, owner_email: e.target.value})}
                              placeholder="email@example.com"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Owner Age</Label>
                            <Input
                              type="number"
                              value={storeForm.owner_age}
                              onChange={(e) => setStoreForm({...storeForm, owner_age: e.target.value})}
                              placeholder="30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Monthly Salary (₹)</Label>
                            <Input
                              type="number"
                              value={storeForm.owner_payment}
                              onChange={(e) => setStoreForm({...storeForm, owner_payment: e.target.value})}
                              placeholder="50000"
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddStore} className="w-full">Add Store & Owner</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Stores List */}
              <Card>
                <CardHeader>
                  <CardTitle>All Stores ({stores.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-auto">
                    {stores.map(store => (
                      <div key={store.store_id} className="p-3 border rounded-lg hover:bg-accent/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{store.name}</p>
                            <p className="text-sm text-muted-foreground">{store.store_id} • {store.store_type}</p>
                            <p className="text-xs text-muted-foreground mt-1">{store.airport_name} • {store.employee_count} employees</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Flights Tab */}
          <TabsContent value="flights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plane className="h-5 w-5" />
                    Flight Management
                  </span>
                  <Dialog open={flightDialog} onOpenChange={setFlightDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Schedule New Flight
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Schedule New Flight</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Flight Number</Label>
                            <Input
                              value={flightForm.flight_number}
                              onChange={(e) => setFlightForm({...flightForm, flight_number: e.target.value})}
                              placeholder="e.g., AI101"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total Seats</Label>
                            <Input
                              type="number"
                              value={flightForm.total_seats}
                              onChange={(e) => setFlightForm({...flightForm, total_seats: parseInt(e.target.value)})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Flight Company *</Label>
                          <Select value={flightForm.flight_company_id} onValueChange={(val) => setFlightForm({...flightForm, flight_company_id: val})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select flight company" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map(c => (
                                <SelectItem key={c.flight_company_id} value={c.flight_company_id.toString()}>
                                  {c.flight_company_name} ({c.country})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Departure Airport</Label>
                            <Select value={flightForm.departure_airport} onValueChange={(val) => setFlightForm({...flightForm, departure_airport: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select airport" />
                              </SelectTrigger>
                              <SelectContent>
                                {airports.map(a => (
                                  <SelectItem key={a.airport_id} value={a.airport_id}>{a.name} ({a.airport_id})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Arrival Airport</Label>
                            <Select value={flightForm.arrival_airport} onValueChange={(val) => setFlightForm({...flightForm, arrival_airport: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select airport" />
                              </SelectTrigger>
                              <SelectContent>
                                {airports.map(a => (
                                  <SelectItem key={a.airport_id} value={a.airport_id}>{a.name} ({a.airport_id})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Flight Date</Label>
                          <Input
                            type="date"
                            value={flightForm.flight_date}
                            onChange={(e) => setFlightForm({...flightForm, flight_date: e.target.value})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Departure Time</Label>
                            <Input
                              type="time"
                              value={flightForm.departure_hour}
                              onChange={(e) => setFlightForm({...flightForm, departure_hour: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Arrival Time</Label>
                            <Input
                              type="time"
                              value={flightForm.arrival_hour}
                              onChange={(e) => setFlightForm({...flightForm, arrival_hour: e.target.value})}
                            />
                          </div>
                        </div>
                        <Button onClick={handleAddFlight} className="w-full">Schedule Flight</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upcoming">Upcoming Flights</TabsTrigger>
                    <TabsTrigger value="past">Past Flights</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="space-y-2 max-h-[500px] overflow-auto">
                    {upcomingFlights.length > 0 ? upcomingFlights.map(flight => (
                      <div key={flight.flight_number} className="p-4 border rounded-lg hover:bg-accent/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg">{flight.flight_number}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {flight.departure_airport} → {flight.arrival_airport}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(flight.flight_date).toLocaleDateString()} • {flight.departure_hour} - {flight.arrival_hour}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{flight.status}</p>
                            <p className="text-xs text-muted-foreground mt-1">{flight.available_seats} seats available</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">No upcoming flights</div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past" className="space-y-2 max-h-[500px] overflow-auto">
                    {pastFlights.length > 0 ? pastFlights.map(flight => (
                      <div key={flight.flight_number} className="p-4 border rounded-lg hover:bg-accent/50 opacity-70">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-lg">{flight.flight_number}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {flight.departure_airport} → {flight.arrival_airport}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(flight.flight_date).toLocaleDateString()} • {flight.departure_hour} - {flight.arrival_hour}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">{flight.status}</p>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">No past flights</div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Flight Companies */}
            <Card>
              <CardHeader>
                <CardTitle>Flight Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {companies.map(company => (
                    <div key={company.flight_company_id} className="p-3 border rounded-lg flex justify-between items-center hover:bg-accent/50">
                      <div>
                        <p className="font-semibold">{company.flight_company_name}</p>
                        <p className="text-sm text-muted-foreground">{company.country}</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          const res = await fetch(`http://localhost:3001/api/flight-companies/${company.flight_company_id}/revenue`);
                          const data = await res.json();
                          if (data.success) {
                            toast.success(`${company.flight_company_name} Revenue: ₹${data.total_revenue.toLocaleString()}`);
                          }
                        } catch (error) {
                          toast.error('Failed to fetch revenue');
                        }
                      }}>
                        View Revenue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Worker Management</span>
                  <Dialog open={workerDialog} onOpenChange={setWorkerDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Hire Worker
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Hire New Worker</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Worker ID</Label>
                            <Input
                              value={workerForm.worker_id}
                              onChange={(e) => setWorkerForm({...workerForm, worker_id: e.target.value})}
                              placeholder="e.g., W030"
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
                          <Label>Email *</Label>
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
                              placeholder="30000"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Worker Type</Label>
                          <Select value={workerForm.worker_type} onValueChange={(val) => setWorkerForm({...workerForm, worker_type: val})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="airport">Airport Staff</SelectItem>
                              <SelectItem value="store">Store Worker</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Job Title</Label>
                          <Input
                            value={workerForm.job}
                            onChange={(e) => setWorkerForm({...workerForm, job: e.target.value})}
                            placeholder="e.g., Security Guard, Barista, Technician"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Airport</Label>
                          <Select value={workerForm.airport_id} onValueChange={(val) => setWorkerForm({...workerForm, airport_id: val})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select airport" />
                            </SelectTrigger>
                            <SelectContent>
                              {airports.map(a => (
                                <SelectItem key={a.airport_id} value={a.airport_id}>{a.name} ({a.airport_id})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {workerForm.worker_type === 'store' && (
                          <div className="space-y-2">
                            <Label>Store</Label>
                            <Select value={workerForm.store_id} onValueChange={(val) => setWorkerForm({...workerForm, store_id: val})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select store" />
                              </SelectTrigger>
                              <SelectContent>
                                {stores.filter(s => s.airport_id === workerForm.airport_id).map(s => (
                                  <SelectItem key={s.store_id} value={s.store_id}>{s.name} ({s.store_id})</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        <Button onClick={handleHireWorker} className="w-full">Hire Worker</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-auto">
                  {workers.filter(w => !['Admin', 'Manager'].includes(w.role)).map(worker => (
                    <div key={worker.worker_id} className="p-3 border rounded-lg hover:bg-accent/50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-semibold">{worker.name}</p>
                          <p className="text-sm text-muted-foreground">{worker.worker_id} • {worker.job}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {worker.email} • {worker.airport_name} • ₹{worker.payment?.toLocaleString()}/month
                          </p>
                          {worker.store_name && (
                            <p className="text-xs text-muted-foreground">Store: {worker.store_name}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedWorker(worker);
                            setUpdateJobForm({ job: worker.job, payment: worker.payment });
                            setUpdateJobDialog(true);
                          }}>
                            <Edit className="h-3 w-3 mr-1" /> Update Job
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewWorker(worker.worker_id)}>
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Management Tab */}
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Admin Management
                  </span>
                  <Dialog open={adminDialog} onOpenChange={setAdminDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Admin
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Add New Admin</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Worker ID (optional)</Label>
                          <Input
                            value={adminForm.worker_id}
                            onChange={(e) => setAdminForm({...adminForm, worker_id: e.target.value})}
                            placeholder="Leave blank for auto-generate"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <Input
                            value={adminForm.name}
                            onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                            placeholder="Admin name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                            placeholder="admin@example.com"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Age</Label>
                            <Input
                              type="number"
                              value={adminForm.age}
                              onChange={(e) => setAdminForm({...adminForm, age: e.target.value})}
                              placeholder="30"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Monthly Salary (₹)</Label>
                            <Input
                              type="number"
                              value={adminForm.payment}
                              onChange={(e) => setAdminForm({...adminForm, payment: e.target.value})}
                              placeholder="80000"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Airport</Label>
                          <Select value={adminForm.airport_id} onValueChange={(val) => setAdminForm({...adminForm, airport_id: val})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select airport" />
                            </SelectTrigger>
                            <SelectContent>
                              {airports.map(a => (
                                <SelectItem key={a.airport_id} value={a.airport_id}>{a.name} ({a.airport_id})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddAdmin} className="w-full">Add Admin</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-auto">
                  {workers.filter(w => w.role === 'Admin').map(admin => (
                    <div key={admin.worker_id} className="p-4 border rounded-lg hover:bg-accent/50 bg-blue-50 dark:bg-blue-950/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-blue-600" />
                            <p className="font-bold">{admin.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{admin.worker_id} • {admin.job}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {admin.email} • {admin.airport_name}
                          </p>
                          <p className="text-sm font-semibold mt-2">₹{admin.payment?.toLocaleString()}/month</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedWorker(admin);
                            setUpdateJobForm({ job: admin.job, payment: admin.payment });
                            setUpdateJobDialog(true);
                          }}>
                            <Edit className="h-3 w-3 mr-1" /> Update
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewWorker(admin.worker_id)}>
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {workers.filter(w => w.role === 'Admin').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No admins found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manager Management Tab */}
          <TabsContent value="managers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Manager Management
                  </span>
                  <Dialog open={managerDialog} onOpenChange={setManagerDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Manager
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Add New Manager</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label>Worker ID (optional)</Label>
                          <Input
                            value={managerForm.worker_id}
                            onChange={(e) => setManagerForm({...managerForm, worker_id: e.target.value})}
                            placeholder="Leave blank for auto-generate"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Full Name *</Label>
                          <Input
                            value={managerForm.name}
                            onChange={(e) => setManagerForm({...managerForm, name: e.target.value})}
                            placeholder="Manager name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={managerForm.email}
                            onChange={(e) => setManagerForm({...managerForm, email: e.target.value})}
                            placeholder="manager@example.com"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Age</Label>
                            <Input
                              type="number"
                              value={managerForm.age}
                              onChange={(e) => setManagerForm({...managerForm, age: e.target.value})}
                              placeholder="35"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Monthly Salary (₹)</Label>
                            <Input
                              type="number"
                              value={managerForm.payment}
                              onChange={(e) => setManagerForm({...managerForm, payment: e.target.value})}
                              placeholder="60000"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Airport</Label>
                          <Select value={managerForm.airport_id} onValueChange={(val) => setManagerForm({...managerForm, airport_id: val})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select airport" />
                            </SelectTrigger>
                            <SelectContent>
                              {airports.map(a => (
                                <SelectItem key={a.airport_id} value={a.airport_id}>{a.name} ({a.airport_id})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Assigned Store (optional)</Label>
                          <Select value={managerForm.store_id} onValueChange={(val) => setManagerForm({...managerForm, store_id: val})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select store (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="">None</SelectItem>
                              {stores.filter(s => s.airport_id === managerForm.airport_id).map(s => (
                                <SelectItem key={s.store_id} value={s.store_id}>{s.name} ({s.store_id})</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button onClick={handleAddManager} className="w-full">Add Manager</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-auto">
                  {workers.filter(w => w.role === 'Manager').map(manager => (
                    <div key={manager.worker_id} className="p-4 border rounded-lg hover:bg-accent/50 bg-purple-50 dark:bg-purple-950/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-purple-600" />
                            <p className="font-bold">{manager.name}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{manager.worker_id} • {manager.job}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {manager.email} • {manager.airport_name}
                          </p>
                          {manager.store_name && (
                            <p className="text-xs text-muted-foreground">Managing: {manager.store_name}</p>
                          )}
                          <p className="text-sm font-semibold mt-2">₹{manager.payment?.toLocaleString()}/month</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => {
                            setSelectedWorker(manager);
                            setUpdateJobForm({ job: manager.job, payment: manager.payment });
                            setUpdateJobDialog(true);
                          }}>
                            <Edit className="h-3 w-3 mr-1" /> Update
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleViewWorker(manager.worker_id)}>
                            <Eye className="h-3 w-3 mr-1" /> View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {workers.filter(w => w.role === 'Manager').length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">No managers found</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Complex Analytics Dashboard
                  </span>
                  <Button onClick={loadComplexStats}>
                    Load Complex Stats
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {complexStats.length > 0 ? (
                  <div className="space-y-2 max-h-[600px] overflow-auto">
                    {complexStats.map((stat, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">{stat.airport_name}</p>
                            <p className="text-sm text-muted-foreground">{stat.airport_id}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">₹{stat.total_revenue?.toLocaleString() || 0}</p>
                            <p className="text-xs text-muted-foreground">Total Revenue</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Flights</p>
                            <p className="text-lg font-semibold">{stat.total_flights || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Workers</p>
                            <p className="text-lg font-semibold">{stat.total_workers || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Avg Salary</p>
                            <p className="text-lg font-semibold">₹{stat.avg_salary?.toLocaleString() || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Store Rating</p>
                            <p className="text-lg font-semibold">{stat.latest_store_rating || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Click "Load Complex Stats" to view analytics
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Airport Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Airport Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-auto">
                  {airports.map(airport => (
                    <div key={airport.airport_id} className="p-3 border rounded-lg hover:bg-accent/50">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{airport.name}</p>
                          <p className="text-sm text-muted-foreground">{airport.city}, {airport.country}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={async () => {
                          try {
                            const res = await fetch(`http://localhost:3001/api/airports/${airport.airport_id}/workers/count`);
                            const data = await res.json();
                            if (data.success) {
                              toast.success(`${airport.name}: ${data.worker_count} workers`);
                            }
                          } catch (error) {
                            toast.error('Failed to fetch worker count');
                          }
                        }}>
                          Worker Count
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Update Job Dialog */}
      <Dialog open={updateJobDialog} onOpenChange={setUpdateJobDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job - {selectedWorker?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={updateJobForm.job}
                onChange={(e) => setUpdateJobForm({...updateJobForm, job: e.target.value})}
                placeholder="New job title"
              />
            </div>
            <div className="space-y-2">
              <Label>Monthly Payment (₹)</Label>
              <Input
                type="number"
                value={updateJobForm.payment}
                onChange={(e) => setUpdateJobForm({...updateJobForm, payment: e.target.value})}
                placeholder="New payment"
              />
            </div>
            <Button onClick={handleUpdateJob}>Update Job</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Worker Dialog */}
      <Dialog open={viewWorkerDialog} onOpenChange={setViewWorkerDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Worker Details</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Worker ID</p>
                  <p className="font-semibold">{selectedWorker.worker_id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-semibold">{selectedWorker.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{selectedWorker.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age</p>
                  <p className="font-semibold">{selectedWorker.age}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Job</p>
                  <p className="font-semibold">{selectedWorker.job}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-semibold">{selectedWorker.role || 'Worker'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Payment</p>
                  <p className="font-semibold text-lg text-green-600">₹{selectedWorker.payment?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold">{selectedWorker.status}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Airport</p>
                  <p className="font-semibold">{selectedWorker.airport_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Store</p>
                  <p className="font-semibold">{selectedWorker.store_name || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Hire Date</p>
                  <p className="font-semibold">{selectedWorker.hire_date ? new Date(selectedWorker.hire_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-semibold">{selectedWorker.updated_at ? new Date(selectedWorker.updated_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardAdmin;