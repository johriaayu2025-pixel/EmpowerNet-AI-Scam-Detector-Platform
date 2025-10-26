import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageSquare, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface Scan {
  id: string;
  scan_type: string;
  content: string;
  file_type: string | null;
  risk_level: string;
  risk_score: number;
  analysis: string;
  created_at: string;
}

const History = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (data) setScans(data);
      setLoading(false);
    };

    loadHistory();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "safe": return "bg-safe text-white";
      case "suspicious": return "bg-suspicious text-white";
      case "fraudulent": return "bg-fraudulent text-white";
      default: return "bg-muted text-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "safe": return CheckCircle;
      case "suspicious": return AlertTriangle;
      case "fraudulent": return XCircle;
      default: return CheckCircle;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Scan History</h1>
          <p className="text-muted-foreground">
            Review your previous scans and analysis results
          </p>
        </div>

        {scans.length === 0 ? (
          <Card className="glass-card p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No scans yet</h3>
            <p className="text-muted-foreground">
              Start scanning content to see your history here
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {scans.map((scan) => {
              const Icon = getRiskIcon(scan.risk_level);
              return (
                <Card key={scan.id} className="glass-card p-6">
                  <div className="flex items-start gap-4">
                    {scan.scan_type === "file" ? (
                      <FileText className="w-6 h-6 text-primary mt-1" />
                    ) : (
                      <MessageSquare className="w-6 h-6 text-primary mt-1" />
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold truncate max-w-md">
                          {scan.content}
                        </h3>
                        <Badge className={getRiskColor(scan.risk_level)}>
                          <Icon className="w-3 h-3 mr-1" />
                          {scan.risk_level.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Score: {scan.risk_score}/100
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {scan.analysis}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;
