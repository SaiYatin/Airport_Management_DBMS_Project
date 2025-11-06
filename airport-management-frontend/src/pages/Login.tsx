import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane, Mail, Lock, Info, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import airportHero from "@/assets/airport-hero.jpg";

const Login = () => {
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // placeholder only
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupMode, setSignupMode] = useState(false); // toggle between Login / Signup

  // Handle login request
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Login failed. Please check your credentials.");
        return;
      }

      // ✅ Extract and store cleanly
      const extractedUser = {
        ...data.user,
        role: data.role ? data.role.toLowerCase() : "passenger",
      };
      localStorage.setItem("user", JSON.stringify(extractedUser));

      toast.success(`Welcome back, ${data.user.name}!`);

      // ✅ Redirect based on role
      if (extractedUser.role === "passenger") {
        navigate("/dashboard");
      } else if (extractedUser.role === "worker" || extractedUser.role === "manager") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Server error during login. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  // Handle signup request (Passenger only)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!name || !email || !age) {
      toast.error("Please fill all fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, age }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || "Signup failed. Try again.");
        return;
      }

      toast.success("Account created successfully! You can now log in.");
      setSignupMode(false);
      setEmail(email);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error("Server error during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-90 z-10" />
        <img src={airportHero} alt="Airport Terminal" className="object-cover w-full h-full" />
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

      {/* Right Side - Form */}
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
              <CardTitle className="text-2xl font-bold">
                {signupMode ? "Sign Up" : "Sign In"}
              </CardTitle>
              <CardDescription>
                {signupMode
                  ? "Create your passenger account to book and track flights"
                  : "Enter your credentials to access your account"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={signupMode ? handleSignup : handleLogin}
                className="space-y-4"
              >
                {signupMode && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="age"
                          type="number"
                          placeholder="25"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

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

                {/* Password remains as visual placeholder */}
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
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading
                    ? signupMode
                      ? "Creating account..."
                      : "Signing in..."
                    : signupMode
                    ? "Sign Up"
                    : "Sign In"}
                </Button>

                {/* Toggle mode */}
                <p className="text-sm text-center text-muted-foreground pt-2">
                  {signupMode ? (
                    <>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setSignupMode(false)}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>
                      Don’t have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setSignupMode(true)}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign up
                      </button>
                    </>
                  )}
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Optional info card */}
          {!signupMode && (
            <Card className="border-info/50 bg-info/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-info" />
                  <CardTitle className="text-sm font-semibold">Info</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Workers and Managers use credentials provided by their
                  supervisors. Passengers can create new accounts.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
