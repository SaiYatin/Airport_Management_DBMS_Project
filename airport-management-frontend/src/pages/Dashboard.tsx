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

  // ✅ normalize role
  const role = user.role?.toLowerCase();

  if (["admin", "manager", "staff", "shopkeeper"].includes(role)) {
    return <DashboardStaff />;
  }

  if (role === "passenger") {
    return <DashboardPassenger />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <p className="text-muted-foreground">
        Unknown role. Please contact administrator.
      </p>
    </div>
  );
};

export default Dashboard;
