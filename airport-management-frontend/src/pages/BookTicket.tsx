import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, ArrowLeft, User, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { flightService } from "@/services/flightService";
import { ticketService } from "@/services/ticketService";
import { useAuth } from "@/hooks/useAuth";

const BookTicket = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [flights, setFlights] = useState<any[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<any>({});
  const [passenger, setPassenger] = useState({
    name: "",
    email: "",
    phone: "",
    age: "",
  });
  const [seatClass, setSeatClass] = useState("");
  const [seatNumber, setSeatNumber] = useState("");

  useEffect(() => {
    loadFlights();
  }, []);

  const loadFlights = async () => {
    try {
      const data = await flightService.getAllFlights({ status: "scheduled,boarding" });
      setFlights(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load flights",
        variant: "destructive",
      });
    }
  };

  const handleFlightSelect = async (flightNumber: string) => {
    const flight = flights.find(f => f.flight_number === flightNumber);
    setSelectedFlight(flight);
    
    // Load dynamic prices for all classes
    try {
      const [economyPrice, businessPrice, firstPrice] = await Promise.all([
        flightService.calculateTicketPrice(flightNumber, "Economy"),
        flightService.calculateTicketPrice(flightNumber, "Business"),
        flightService.calculateTicketPrice(flightNumber, "First"),
      ]);
      
      setPrices({
        Economy: economyPrice.price,
        Business: businessPrice.price,
        First: firstPrice.price,
      });
    } catch (error) {
      console.error("Error loading prices:", error);
    }
  };

  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFlight || !seatClass || !seatNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        passenger_name: passenger.name,
        passenger_email: passenger.email,
        passenger_phone: passenger.phone,
        passenger_age: parseInt(passenger.age),
        flight_number: selectedFlight.flight_number,
        seat_number: seatNumber,
        seat_class: seatClass,
        ticket_price: prices[seatClass],
      };

      const result = await ticketService.bookTicket(bookingData);
      
      toast({
        title: "Booking Successful!",
        description: `Order Number: ${result.order_number}`,
      });
      
      navigate("/tickets");
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.message || "Failed to book ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="p-2 bg-gradient-primary rounded-lg">
            <Plane className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Book Ticket</h1>
            <p className="text-xs text-muted-foreground">Create new flight reservation</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-4xl">
        <form onSubmit={handleBookTicket} className="space-y-6">
          {/* Passenger Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Passenger Information
              </CardTitle>
              <CardDescription>Enter passenger details</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={passenger.name}
                  onChange={(e) => setPassenger({ ...passenger, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={passenger.email}
                  onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={passenger.phone}
                  onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  value={passenger.age}
                  onChange={(e) => setPassenger({ ...passenger, age: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Flight Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-primary" />
                Flight Selection
              </CardTitle>
              <CardDescription>Choose your flight</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="flight">Select Flight *</Label>
                <Select onValueChange={handleFlightSelect} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a flight" />
                  </SelectTrigger>
                  <SelectContent>
                    {flights.map((flight) => (
                      <SelectItem key={flight.flight_number} value={flight.flight_number}>
                        {flight.flight_number} - {flight.departure_airport_id} → {flight.arrival_airport_id} ({flight.departure_time})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFlight && (
                <div className="p-4 rounded-lg border bg-accent/10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Flight</p>
                      <p className="font-semibold">{selectedFlight.flight_number}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Route</p>
                      <p className="font-semibold">{selectedFlight.departure_airport_id} → {selectedFlight.arrival_airport_id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-semibold">{selectedFlight.departure_date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Available Seats</p>
                      <p className="font-semibold">{selectedFlight.available_seats}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seat Selection */}
          {selectedFlight && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Seat & Class Selection
                </CardTitle>
                <CardDescription>Choose your seat and class</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seatClass">Seat Class *</Label>
                  <Select onValueChange={setSeatClass} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose seat class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Economy">
                        Economy - ₹{prices.Economy?.toLocaleString() || "..."}
                      </SelectItem>
                      <SelectItem value="Business">
                        Business - ₹{prices.Business?.toLocaleString() || "..."}
                      </SelectItem>
                      <SelectItem value="First">
                        First Class - ₹{prices.First?.toLocaleString() || "..."}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="seatNumber">Seat Number *</Label>
                  <Input
                    id="seatNumber"
                    placeholder="e.g., 12A"
                    value={seatNumber}
                    onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                {seatClass && (
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Price</p>
                        <p className="text-2xl font-bold text-success">
                          ₹{prices[seatClass]?.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="default">{seatClass}</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Booking..." : "Book Ticket"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default BookTicket;
