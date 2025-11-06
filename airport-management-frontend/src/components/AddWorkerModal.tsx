import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface AddWorkerModalProps {
  onClose: () => void;
  onWorkerAdded: () => void; // new callback to notify parent
}

const AddWorkerModal = ({ onClose, onWorkerAdded }: AddWorkerModalProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [job, setJob] = useState("Staff");
  const [payment, setPayment] = useState("");
  const [airportId, setAirportId] = useState("BLR");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const worker_id = `W${Date.now()}`;
    try {
      const res = await fetch("http://localhost:3001/api/workers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_id,
          name,
          age,
          job,
          payment,
          store_id: null,
          airport_id: airportId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Worker added successfully!");
        onWorkerAdded(); // 🔹 tell Dashboard to refresh instantly
        onClose();
      } else {
        toast.error(data.error || "Failed to add worker");
      }
    } catch {
      toast.error("Server error while adding worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Add New Worker</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>Age</Label>
            <Input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
          </div>
          <div>
            <Label>Job Title</Label>
            <Input
              value={job}
              onChange={(e) => setJob(e.target.value)}
              placeholder="Staff / Manager / Shopkeeper"
            />
          </div>
          <div>
            <Label>Monthly Payment (₹)</Label>
            <Input
              type="number"
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Worker"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkerModal;
