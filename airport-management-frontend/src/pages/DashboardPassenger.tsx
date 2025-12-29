import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Plane, Ticket, Award, LogOut, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const DashboardPassenger = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loyalty, setLoyalty] = useState("");
  const [loading, setLoading] = useState(true);

  // Cancel ticket modal state
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    booking: null,
    reason: ""
  });
  const [cancelling, setCancelling] = useState(false);

  // Ticket details modal state
  const [detailsDialog, setDetailsDialog] = useState({
    open: false,
    booking: null
  });

  useEffect(() => {
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
        if (error.name === "AbortError") return;
        console.error("❌ Error loading passenger data:", error);
        toast.error("Failed to load passenger data");
      } finally {
        setLoading(false);
      }
    };

    loadPassengerData();

    return () => {
      controller.abort();
    };
  }, [user?.passenger_id]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleOpenDetails = (booking: any) => {
    setDetailsDialog({ open: true, booking });
  };

  const handleOpenCancelDialog = (booking: any) => {
    setDetailsDialog({ open: false, booking: null });
    setCancelDialog({ open: true, booking, reason: "" });
  };

  const handleCancelTicket = async () => {
    if (!cancelDialog.reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    if (!cancelDialog.booking?.order_number) {
      toast.error("Invalid ticket order number");
      return;
    }

    try {
      setCancelling(true);

      const res = await fetch(`http://localhost:3001/api/tickets/${cancelDialog.booking.order_number}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelDialog.reason })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || data.error || "Failed to cancel ticket");
        return;
      }

      const refundAmount = (cancelDialog.booking.price * 0.80).toLocaleString();
      
      toast.success(
        `✅ Ticket cancelled successfully! Refund of ₹${refundAmount} (80%) will be processed.`,
        { duration: 5000 }
      );

      setCancelDialog({ open: false, booking: null, reason: "" });

      // Reload bookings
      const passengerId = user.passenger_id;
      const bookingRes = await fetch(`http://localhost:3001/api/passengers/${passengerId}/bookings`);
      const bookingData = await bookingRes.json();
      if (bookingData.success) {
        setBookings(bookingData.data);
      }

    } catch (error: any) {
      console.error("❌ Error cancelling ticket:", error);
      toast.error("Server error while cancelling ticket");
    } finally {
      setCancelling(false);
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
                    onClick={() => handleOpenDetails(b)}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
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
      </main>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsDialog.open} onOpenChange={(open) => !open && setDetailsDialog({ open: false, booking: null })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              Order: {detailsDialog.booking?.order_number}
            </DialogDescription>
          </DialogHeader>
          {detailsDialog.booking && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Flight</p>
                  <p className="font-semibold">{detailsDialog.booking.flight_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={detailsDialog.booking.booking_status === "confirmed" ? "default" : "secondary"}>
                    {detailsDialog.booking.booking_status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Route</p>
                  <p className="font-semibold">{detailsDialog.booking.departure_airport} → {detailsDialog.booking.arrival_airport}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{new Date(detailsDialog.booking.flight_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Seat</p>
                  <p className="font-semibold">{detailsDialog.booking.seat_number}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-semibold">{detailsDialog.booking.seat_class}</p>
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Price</p>
                <p className="text-2xl font-bold">₹{detailsDialog.booking.price.toLocaleString()}</p>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-muted-foreground">Booked On</p>
                <p className="font-medium">{new Date(detailsDialog.booking.booking_date).toLocaleString()}</p>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setDetailsDialog({ open: false, booking: null })}>
              Close
            </Button>
            {detailsDialog.booking?.booking_status === "confirmed" && (
              <Button 
                variant="destructive" 
                onClick={() => handleOpenCancelDialog(detailsDialog.booking)}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel Ticket
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Ticket Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, booking: null, reason: "" })}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Cancel Ticket
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this ticket? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {cancelDialog.booking && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Order Number:</span>
                  <span className="font-semibold">{cancelDialog.booking.order_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Flight:</span>
                  <span className="font-semibold">{cancelDialog.booking.flight_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Route:</span>
                  <span className="font-semibold">{cancelDialog.booking.departure_airport} → {cancelDialog.booking.arrival_airport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Seat:</span>
                  <span className="font-semibold">{cancelDialog.booking.seat_number} ({cancelDialog.booking.seat_class})</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Original Amount:</span>
                  <span className="font-bold">₹{cancelDialog.booking.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">Refund Amount (80%):</span>
                  <span className="font-bold text-green-700 dark:text-green-400">
                    ₹{(cancelDialog.booking.price * 0.80).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">
                  Cancellation Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Please provide a reason for cancellation (e.g., Change of plans, Emergency, etc.)"
                  value={cancelDialog.reason}
                  onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCancelDialog({ open: false, booking: null, reason: "" })}
              disabled={cancelling}
            >
              Keep Ticket
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelTicket}
              disabled={cancelling || !cancelDialog.reason.trim()}
              className="gap-2"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Confirm Cancellation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPassenger;