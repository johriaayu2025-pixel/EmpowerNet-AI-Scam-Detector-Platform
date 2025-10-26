import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Scan, AlertTriangle, History, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    totalScans: 0,
    safeCount: 0,
    suspiciousCount: 0,
    fraudulentCount: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        setUserName(profile?.full_name || user.email?.split("@")[0] || "User");

        const { data: scans } = await supabase
          .from("scans")
          .select("risk_level")
          .eq("user_id", user.id);

        if (scans) {
          setStats({
            totalScans: scans.length,
            safeCount: scans.filter(s => s.risk_level === "safe").length,
            suspiciousCount: scans.filter(s => s.risk_level === "suspicious").length,
            fraudulentCount: scans.filter(s => s.risk_level === "fraudulent").length,
          });
        }
      }
    };

    loadData();
  }, []);

  const statCards = [
    { label: "Total Scans", value: stats.totalScans, icon: Scan, color: "text-primary" },
    { label: "Safe", value: stats.safeCount, icon: Shield, color: "text-safe" },
    { label: "Suspicious", value: stats.suspiciousCount, icon: AlertTriangle, color: "text-suspicious" },
    { label: "Fraudulent", value: stats.fraudulentCount, icon: AlertTriangle, color: "text-fraudulent" },
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, <span className="text-gradient">{userName}</span>!
          </h1>
          <p className="text-muted-foreground">Stay protected with AI-powered scam detection</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <Card key={stat.label} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        <Card className="glass-card p-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Quick Scan</h2>
          <p className="text-muted-foreground mb-6">
            Instantly analyze suspicious messages, emails, or files
          </p>
          <Button
            onClick={() => navigate("/scan")}
            size="lg"
            className="gradient-primary glow-effect"
          >
            <Scan className="w-5 h-5 mr-2" />
            Start Scanning
          </Button>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
