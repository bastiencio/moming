import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Package, 
  Warehouse, 
  Users, 
  FileText, 
  Calendar, 
  BarChart3,
  Droplets,
  Home,
  LogOut,
  Gift,
  TrendingUp,
  Boxes,
  UserCog,
  Building2
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const navigationItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: Warehouse, label: "Inventory", path: "/inventory" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Building2, label: "Venues", path: "/venues" },
  { icon: FileText, label: "Invoices", path: "/invoices" },
  { icon: Calendar, label: "Events", path: "/events" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: TrendingUp, label: "Sales", path: "/sales" },
  { icon: Gift, label: "Merchandizing", path: "/merchandizing" },
  { icon: Boxes, label: "Merch Stock", path: "/merchandizing-stock" },
  { icon: UserCog, label: "User Management", path: "/users" },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
      });
      navigate('/');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: "An unexpected error occurred",
      });
    }
  };

  return (
    <div className="w-64 min-h-screen bg-card border-r border-border p-4">
      {/* Brand Header */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-2">
          <img 
            src="/lovable-uploads/4051c261-2a6f-4fc3-89b8-676e7fb3be4b.png" 
            alt="Morning Kombucha Logo" 
            className="h-48 w-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Button
              key={item.path}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 h-11 ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* User Info & Sign Out */}
      <div className="mt-auto space-y-4">
        <Card className="p-4 bg-secondary">
          <div className="text-sm">
            <p className="text-muted-foreground">Signed in as:</p>
            <p className="font-medium text-secondary-foreground truncate">{user?.email}</p>
          </div>
        </Card>
        
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </div>

      {/* Quick Stats Card */}
      <Card className="mt-8 p-4 bg-secondary">
        <h3 className="text-sm font-medium text-secondary-foreground mb-3">
          Quick Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Low Stock Items</span>
            <span className="font-medium text-warning">3</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pending Invoices</span>
            <span className="font-medium text-foreground">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Active Events</span>
            <span className="font-medium text-success">2</span>
          </div>
        </div>
      </Card>
    </div>
  );
};