import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Search, Filter, Plus, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { flightService } from "@/services/flightService";
import { useAuth } from "@/hooks/useAuth";

const Flights = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [flights, setFlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadFlights();
    }
  }, [user, navigate]);

  const loadFlights = async () => {
    setLoading(true);
    try {
      const data = await flightService.getAllFlights();
      setFlights(data);
    } catch (error) {
      console.error("Error loading flights:", error);
      toast({
        title: "Error",
        description: "Failed to load flights from backend",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFlights = flights.filter(
    (flight) =>
      flight.flight_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.departure_airport_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.arrival_airport_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flight.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 50) return "text-warning";
    return "text-muted-foreground";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Flight Management</h1>
              <p className="text-xs text-muted-foreground">Manage and monitor all flights</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-6">
        {/* Search and Filter Bar */}
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by flight number, route, or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
                {(user.role === "Admin" || user.role === "Manager") && (
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Flight
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flights Table */}
        <Card className="animate-slide-in">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>All Flights ({filteredFlights.length})</span>
              <span className="text-sm font-normal text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Flight</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Available Seats</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlights.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No flights found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredFlights.map((flight) => {
                        const occupancyPercent = Math.round(((flight.total_seats - flight.available_seats) / flight.total_seats) * 100);
                        return (
                          <TableRow key={flight.flight_number} className="hover:bg-accent/50 transition-colors">
                            <TableCell>
                              <div>
                                <p className="font-semibold">{flight.flight_number}</p>
                                <p className="text-xs text-muted-foreground">{flight.company || "N/A"}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{flight.departure_airport_id}</span>
                                <span className="text-muted-foreground">→</span>
                                <span className="font-medium">{flight.arrival_airport_id}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{flight.departure_time}</p>
                              <p className="text-xs text-muted-foreground">{flight.departure_date}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={flight.status as any}>
                                {flight.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p className={`text-sm font-semibold ${getOccupancyColor(occupancyPercent)}`}>
                                  {flight.available_seats} / {flight.total_seats}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{occupancyPercent}% full</span>
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-primary transition-all"
                                      style={{ width: `${occupancyPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Flights;
