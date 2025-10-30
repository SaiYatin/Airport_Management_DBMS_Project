import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Mail, Lock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import airportHero from "@/assets/airport-hero.jpg";

const testCredentials = [
  { role: "Admin", email: "admin@airport.com", password: "Admin@123" },
  { role: "Manager", email: "manager@airport.com", password: "Manager@123" },
  { role: "Staff", email: "staff@airport.com", password: "Staff@123" },
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const validUser = testCredentials.find(
        (cred) => cred.email === email && cred.password === password
      );

      if (validUser) {
        toast.success(`Welcome back, ${validUser.role}!`);
        localStorage.setItem("user", JSON.stringify(validUser));
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials. Please check test credentials below.");
      }
      setLoading(false);
    }, 1000);
  };

  const fillCredentials = (cred: typeof testCredentials[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90 z-10" />
        <img
          src={airportHero}
          alt="Airport Terminal"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl">
              <Plane className="h-10 w-10" />
            </div>
            <h1 className="text-4xl font-bold">SkyHub</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">Airport Management System</h2>
          <p className="text-lg text-primary-foreground/90 max-w-md">
            Streamline your airport operations with our comprehensive management platform.
            Manage flights, bookings, workers, and more.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-subtle">
        <div className="w-full max-w-md space-y-6 animate-fade-in">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Plane className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">SkyHub</h1>
            </div>
            <p className="text-muted-foreground">Airport Management System</p>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@airport.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Test Credentials */}
          <Card className="border-info/50 bg-info/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-info" />
                <CardTitle className="text-sm font-semibold">Test Credentials</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {testCredentials.map((cred) => (
                <div
                  key={cred.role}
                  className="flex items-center justify-between p-3 rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => fillCredentials(cred)}
                >
                  <div className="text-sm">
                    <p className="font-semibold">{cred.role}</p>
                    <p className="text-xs text-muted-foreground">{cred.email}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      fillCredentials(cred);
                    }}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
