import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Info, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface Alert {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  created_at: string;
}

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingSOS, setSendingSOS] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      const { data } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setAlerts(data);
      setLoading(false);
    };

    loadAlerts();
  }, []);

  const handleSOS = async () => {
    setSendingSOS(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to send SOS alert");
        return;
      }

      // Get user location
      let location = "Location unavailable";
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
      } catch (error) {
        console.log("Location access denied");
      }

      // Get recent scam details
      const { data: recentScans } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const scamDetails = recentScans?.[0] 
        ? `Risk Level: ${recentScans[0].risk_level}, Analysis: ${recentScans[0].analysis?.substring(0, 200)}...`
        : "No recent scans available";

      // Call SOS edge function
      const { error } = await supabase.functions.invoke("send-sos-alert", {
        body: {
          userName: user.email,
          location,
          scamDetails,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      toast.success("SOS Alert Sent! Emergency services have been notified.", {
        duration: 5000,
      });
    } catch (error) {
      console.error("SOS Error:", error);
      toast.error("Failed to send SOS alert. Please contact authorities directly.");
    } finally {
      setSendingSOS(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-fraudulent text-white";
      case "high": return "bg-suspicious text-white";
      case "medium": return "bg-accent text-white";
      case "low": return "bg-muted text-foreground";
      default: return "bg-muted text-foreground";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "phishing":
      case "fraud":
        return AlertTriangle;
      case "malware":
        return Shield;
      default:
        return Info;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading alerts...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">Security Alerts</h1>
            <p className="text-muted-foreground">
              Stay informed about the latest scam threats and security news
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="lg"
                  className="bg-destructive hover:bg-destructive/90 font-bold"
                  disabled={sendingSOS}
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  SOS EMERGENCY
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Emergency SOS Alert</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately send an emergency alert with your location, account details, 
                    and recent scam information to designated authorities and emergency contacts.
                    <br/><br/>
                    Are you sure you want to proceed?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleSOS}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Yes, Send SOS Alert
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground text-right max-w-xs">
              Use this if you believe you are being targeted by an active scam or fraud attempt.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {alerts.map((alert) => {
            const Icon = getCategoryIcon(alert.category);
            return (
              <Card key={alert.id} className="glass-card p-6 hover:glow-effect transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-primary/20">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold">{alert.title}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {alert.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{alert.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Alerts;
