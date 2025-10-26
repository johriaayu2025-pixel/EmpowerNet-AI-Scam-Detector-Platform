import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Scan, Lock, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTQgMTZ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem00IDE2djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 glow-effect mx-auto">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6 text-gradient">EmpowerNet</h1>
          <p className="text-2xl text-foreground mb-4">AI-Powered Scam Detection Platform</p>
          <p className="text-lg text-muted-foreground mb-8">
            Protect yourself from scams, phishing, and fraud with advanced AI technology
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/auth")} size="lg" className="gradient-primary glow-effect">
              Get Started Free
            </Button>
            <Button onClick={() => navigate("/auth")} size="lg" variant="outline">
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="glass-card p-8 text-center">
            <Scan className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-bold mb-2">Instant Scanning</h3>
            <p className="text-muted-foreground">Analyze suspicious messages and files in seconds</p>
          </div>
          <div className="glass-card p-8 text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">Your data is encrypted and never shared</p>
          </div>
          <div className="glass-card p-8 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h3 className="text-xl font-bold mb-2">Real-time Alerts</h3>
            <p className="text-muted-foreground">Stay updated on the latest threats</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
