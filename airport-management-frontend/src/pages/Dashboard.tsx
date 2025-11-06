import { useAuth } from "@/hooks/useAuth";
import DashboardStaff from "./DashboardStaff";
import DashboardPassenger from "./DashboardPassenger";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  if (["Admin", "Manager", "Staff", "Shopkeeper"].includes(user.role)) {
    return <DashboardStaff />;
  }

  if (user.role === "Passenger") {
    return <DashboardPassenger />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <p className="text-muted-foreground">Unknown role. Please contact administrator.</p>
    </div>
  );
};

export default Dashboard;
