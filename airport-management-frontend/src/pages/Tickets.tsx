import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, ArrowLeft, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ticketService } from "@/services/ticketService";
import { useAuth } from "@/hooks/useAuth";

const Tickets = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    ticket: any;
    reason: string;
  }>({
    open: false,
    ticket: null,
    reason: "",
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketService.getAllTickets();
      setTickets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.flight_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancelTicket = async () => {
    if (!cancelDialog.reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a cancellation reason",
        variant: "destructive",
      });
      return;
    }

    try {
      await ticketService.cancelTicket({
        order_number: cancelDialog.ticket.order_number,
        cancellation_reason: cancelDialog.reason,
      });

      toast({
        title: "Ticket Cancelled",
        description: "Ticket has been cancelled successfully. Refund will be processed.",
      });

      setCancelDialog({ open: false, ticket: null, reason: "" });
      loadTickets();
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.response?.data?.message || "Failed to cancel ticket",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Ticket Management</h1>
              <p className="text-xs text-muted-foreground">View and manage bookings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-6">
        {/* Search and Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by order number, passenger, or flight..."
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
                <Button onClick={() => navigate("/book-ticket")} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Book Ticket
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tickets ({filteredTickets.length})</CardTitle>
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
                      <TableHead>Order #</TableHead>
                      <TableHead>Passenger</TableHead>
                      <TableHead>Flight</TableHead>
                      <TableHead>Seat</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No tickets found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTickets.map((ticket) => (
                        <TableRow key={ticket.order_number}>
                          <TableCell className="font-medium">{ticket.order_number}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{ticket.passenger_name}</p>
                              <p className="text-xs text-muted-foreground">{ticket.passenger_email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{ticket.flight_number}</TableCell>
                          <TableCell>{ticket.seat_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ticket.seat_class}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold">₹{ticket.ticket_price?.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={ticket.booking_status === "Confirmed" ? "default" : "destructive"}>
                              {ticket.booking_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {ticket.booking_status === "Confirmed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCancelDialog({ open: true, ticket, reason: "" })}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog.open} onOpenChange={(open) => !open && setCancelDialog({ open: false, ticket: null, reason: "" })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this ticket? 80% refund will be processed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm"><span className="font-semibold">Order:</span> {cancelDialog.ticket?.order_number}</p>
              <p className="text-sm"><span className="font-semibold">Passenger:</span> {cancelDialog.ticket?.passenger_name}</p>
              <p className="text-sm"><span className="font-semibold">Price:</span> ₹{cancelDialog.ticket?.ticket_price?.toLocaleString()}</p>
              <p className="text-sm"><span className="font-semibold">Refund:</span> ₹{(cancelDialog.ticket?.ticket_price * 0.8)?.toLocaleString()}</p>
            </div>
            <div>
              <Label htmlFor="reason">Cancellation Reason *</Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for cancellation..."
                value={cancelDialog.reason}
                onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ open: false, ticket: null, reason: "" })}>
              Keep Ticket
            </Button>
            <Button variant="destructive" onClick={handleCancelTicket}>
              Cancel Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
