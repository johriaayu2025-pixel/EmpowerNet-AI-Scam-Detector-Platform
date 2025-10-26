import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Shield, Upload, AlertTriangle, CheckCircle, XCircle, Crown } from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

interface ScanResult {
  risk_level: "safe" | "suspicious" | "fraudulent";
  risk_score: number;
  analysis: string;
}

const Scan = () => {
  const navigate = useNavigate();
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const handleScan = async () => {
    if (!textContent && !file) {
      toast.error("Please provide text or upload a file to scan");
      return;
    }

    setScanning(true);
    setProgress(0);
    setResult(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get user profile to check subscription tier
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_tier")
        .eq("id", user.id)
        .single();

      const subscriptionTier = profile?.subscription_tier || "free";

      // Check daily limit for free users
      let limitData: any = null;
      if (subscriptionTier === "free") {
        const { data } = await supabase
          .from("daily_scan_limits")
          .select("scan_count")
          .eq("user_id", user.id)
          .eq("scan_date", new Date().toISOString().split("T")[0])
          .single();

        limitData = data;
        const currentCount = limitData?.scan_count || 0;
        
        if (currentCount >= 10) {
          setScanCount(currentCount);
          setShowLimitDialog(true);
          setScanning(false);
          return;
        }
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke("scan-content", {
        body: {
          content: textContent || file?.name,
          type: file ? "file" : "text",
          fileType: file?.type,
        },
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);

      // Save to database
      await supabase.from("scans").insert({
        user_id: user.id,
        scan_type: file ? "file" : "text",
        content: textContent || file?.name,
        file_type: file?.type,
        risk_level: data.risk_level,
        risk_score: data.risk_score,
        analysis: data.analysis,
      });

      // Increment scan count for free users
      if (profile?.subscription_tier === "free" || !profile?.subscription_tier) {
        const { data: updatedLimit } = await supabase
          .from("daily_scan_limits")
          .upsert({
            user_id: user.id,
            scan_date: new Date().toISOString().split("T")[0],
            scan_count: (limitData?.scan_count || 0) + 1,
          }, {
            onConflict: "user_id,scan_date"
          })
          .select()
          .single();
        
        if (updatedLimit) {
          setScanCount(updatedLimit.scan_count);
        }
      }

      toast.success("Scan completed successfully!");
    } catch (error: any) {
      console.error('Scan error:', error);
      
      // Map errors to user-friendly messages
      let userMessage = 'Failed to scan content. Please try again.';
      if (error.message?.toLowerCase().includes('not authenticated') ||
          error.message?.toLowerCase().includes('unauthorized')) {
        userMessage = 'Please sign in to scan content';
      } else if (error.message?.toLowerCase().includes('rate limit') ||
                 error.message?.toLowerCase().includes('too many requests')) {
        userMessage = 'Too many requests. Please wait a moment and try again';
      } else if (error.message?.toLowerCase().includes('timeout')) {
        userMessage = 'Scan timed out. Please try again';
      } else if (error.message?.toLowerCase().includes('invalid') ||
                 error.message?.toLowerCase().includes('validation')) {
        userMessage = 'Invalid content provided. Please check your input';
      }
      
      toast.error(userMessage);
    } finally {
      setScanning(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "safe": return "text-safe";
      case "suspicious": return "text-suspicious";
      case "fraudulent": return "text-fraudulent";
      default: return "text-muted-foreground";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "safe": return CheckCircle;
      case "suspicious": return AlertTriangle;
      case "fraudulent": return XCircle;
      default: return Shield;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">AI Scam Detection</h1>
          <p className="text-muted-foreground">
            Analyze suspicious content with advanced AI technology
          </p>
        </div>

        <Card className="glass-card p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="text">Paste Text or Message</Label>
            <Textarea
              id="text"
              placeholder="Paste suspicious email, message, or link here..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[200px] bg-input border-border"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.docx,.txt,.jpg,.png,.mp4,.mov,.avi,.zip"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="bg-input border-border"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
          </div>

          {scanning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Scanning...</span>
                <span className="text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button
            onClick={handleScan}
            disabled={scanning || (!textContent && !file)}
            className="w-full gradient-primary glow-effect"
            size="lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            {scanning ? "Analyzing..." : "Scan Now"}
          </Button>
        </Card>

        {result && (
          <Card className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              {(() => {
                const Icon = getRiskIcon(result.risk_level);
                return <Icon className={`w-12 h-12 ${getRiskColor(result.risk_level)}`} />;
              })()}
              <div>
                <h3 className="text-2xl font-bold capitalize">{result.risk_level}</h3>
                <p className="text-muted-foreground">Risk Score: {result.risk_score}/100</p>
              </div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm">{result.analysis}</p>
            </div>
          </Card>
        )}

        <AlertDialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-accent" />
                Daily Limit Reached
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  You have reached your daily limit of <strong>10 free scans</strong>.
                </p>
                <p>
                  Upgrade to <strong>Monthly</strong> or <strong>Annual</strong> for unlimited scans and access to advanced features:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Unlimited scans per month</li>
                  <li>Advanced AI threat detection</li>
                  <li>Professional PDF/DOCX reports</li>
                  <li>Priority support</li>
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowLimitDialog(false);
                  navigate("/premium");
                }}
                className="gradient-primary"
              >
                View Premium Plans
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Scan;
