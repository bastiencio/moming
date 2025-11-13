// Update this page (the content is just a fallback if you fail to update the page)

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import logo from "@/assets/logo.png";
const Index = () => {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);
  return <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md">
        <img src={logo} alt="Logo" className="w-[500px] mb-4 mx-auto" />
        
        <div className="space-y-4">
          <Button onClick={() => navigate('/auth')} className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
            Sign In
          </Button>
          
        </div>
      </div>
    </div>;
};
export default Index;