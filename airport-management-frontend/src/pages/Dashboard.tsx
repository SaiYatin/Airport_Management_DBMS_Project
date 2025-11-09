import { useAuth } from "@/hooks/useAuth";
import DashboardStaff from "./DashboardStaff";
import DashboardPassenger from "./DashboardPassenger";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import DashboardAdmin from "./DashboardAdmin";
import DashboardManager from "./DashboardManager";
import DashboardStoreOwner from "./DashboardStoreOwner";
import DashboardAirportStaff from "./DashboardAirportStaff";
import DashboardStoreWorker from "./DashboardStoreWorker";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  // ✅ normalize role
  const role = user.role?.toLowerCase();
  if (!user || !user.role) return <div>Loading...</div>;
  if (role === "admin") return <DashboardAdmin />;
  if (role === "manager") return <DashboardManager />;
  if (role === "storeowner") return <DashboardStoreOwner />;
  if (role === "airportstaff") return <DashboardAirportStaff />;
  if (role === "storeworker") return <DashboardStoreWorker />;
  if (role === "passenger") return <DashboardPassenger />;
  return <div>No valid dashboard found for role: {user.role}</div>;
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <p className="text-muted-foreground">
        Unknown role. Please contact administrator.
      </p>
    </div>
  );
};

export default Dashboard;
