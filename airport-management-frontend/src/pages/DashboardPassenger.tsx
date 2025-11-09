import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Plane, Ticket, Award, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DashboardPassenger = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loyalty, setLoyalty] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for user to be available
    if (!user?.passenger_id) {
      setLoading(false);
      navigate("/login");
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const loadPassengerData = async () => {
      try {
        setLoading(true);

        const passengerId = user.passenger_id;
        console.log("👤 Loading data for passenger:", passengerId);

        // Loyalty info
        const loyaltyRes = await fetch(`http://localhost:3001/api/passengers/${passengerId}/loyalty`, { signal });
        const loyaltyData = await loyaltyRes.json();
        if (loyaltyData.success) setLoyalty(loyaltyData.loyalty_tier);

        // Bookings
        const bookingRes = await fetch(`http://localhost:3001/api/passengers/${passengerId}/bookings`, { signal });
        const bookingData = await bookingRes.json();
        if (bookingData.success) {
          setBookings(bookingData.data);
          console.log(`✅ Loaded ${bookingData.data.length} bookings`);
        }
      } catch (error: any) {
        if (error.name === "AbortError") return; // prevents stale update
        console.error("❌ Error loading passenger data:", error);
        toast.error("Failed to load passenger data");
      } finally {
        setLoading(false);
      }
    };

    loadPassengerData();

    // Cleanup: cancel fetches if user changes quickly
    return () => {
      controller.abort();
    };
  }, [user?.passenger_id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
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
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SkyHub</h1>
              <p className="text-xs text-muted-foreground">Passenger Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
            <Button onClick={() => navigate("/book-ticket")} className="gap-2">
              Book Ticket
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-8">
        <div>
          <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Passenger ID: {user.passenger_id} | Email: {user.email}
          </p>
          <div className="text-muted-foreground mt-2">
            Your loyalty tier:
            <Badge className="ml-2">{loyalty || "Standard"}</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              My Bookings ({bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You have no bookings yet.</p>
                <Button onClick={() => navigate("/book-ticket")}>
                  Book Your First Flight
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div
                    key={b.order_number}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">
                          Flight {b.flight_number}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {b.departure_airport} → {b.arrival_airport}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Date: {new Date(b.flight_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seat: {b.seat_number} ({b.seat_class})
                        </p>
                        <p className="text-sm font-medium mt-2">
                          ₹{b.price.toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={b.booking_status === "confirmed" ? "default" : "secondary"}
                      >
                        {b.booking_status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Order: {b.order_number}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Loyalty & Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              As a {loyalty || "Standard"} member, you earn discounts on frequent bookings.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">No purchases found.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((b: any) => (
                  <div
                    key={b.order_number}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">
                          Flight {b.flight_number} • {b.company_name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {b.departure_airport} → {b.arrival_airport}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Purchased on: {b.purchased_on}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Seat: {b.seat_class} | ₹{b.price.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {b.booked_via || "Direct"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DashboardPassenger;