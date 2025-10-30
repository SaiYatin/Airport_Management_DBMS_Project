import { useNavigate } from "react-router-dom";
import { Plane, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-sky flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-3xl animate-fade-in">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="p-4 bg-primary-foreground/10 backdrop-blur-sm rounded-2xl">
            <Plane className="h-16 w-16 text-primary-foreground" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-4">
          SkyHub
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-primary-foreground/90">
          Airport Management System
        </h2>
        
        <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
          Streamline your airport operations with comprehensive flight management, 
          ticket booking, workforce coordination, and real-time analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button 
            size="lg" 
            variant="accent"
            className="gap-2 text-lg px-8 py-6"
            onClick={() => navigate("/login")}
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="gap-2 text-lg px-8 py-6 bg-primary-foreground/10 backdrop-blur-sm border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
