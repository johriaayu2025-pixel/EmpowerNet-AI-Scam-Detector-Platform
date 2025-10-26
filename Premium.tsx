import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

const Premium = () => {
  const handleUpgrade = (plan: string) => {
    toast.success(`${plan} plan selected! Redirecting to checkout...`);
    // Stripe integration would be implemented here
  };

  const freeFeatures = [
    "10 scans per day",
    "Basic AI threat detection",
    "Simple summary reports",
    "Critical threat alerts only",
    "Basic online help",
  ];

  const premiumFeatures = [
    "Unlimited scans per month",
    "Advanced AI threat detection",
    "Detailed risk analysis reports",
    "Real-time threat alerts",
    "Priority customer support",
    "API access for integrations",
    "Custom security policies",
    "Team collaboration tools",
  ];

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto">
          <Crown className="w-16 h-16 mx-auto mb-4 text-accent" />
          <h1 className="text-4xl font-bold mb-4 text-gradient">Upgrade to Premium</h1>
          <p className="text-lg text-muted-foreground">
            Unlock advanced protection features and stay ahead of evolving threats
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-muted to-transparent opacity-10 blur-3xl"></div>
            <div className="relative z-10">
              <Shield className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">/forever</span>
              </div>
              <ul className="space-y-3 mb-8">
                {freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-safe" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => toast.info("You're already on the Free plan!")}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Current Plan
              </Button>
            </div>
          </Card>

          <Card className="glass-card p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 gradient-primary opacity-20 blur-3xl"></div>
            <div className="relative z-10">
              <Zap className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {premiumFeatures.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-safe" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleUpgrade("Monthly")}
                className="w-full gradient-primary glow-effect"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </Card>

          <Card className="glass-card p-8 relative overflow-hidden border-2 border-primary">
            <div className="absolute top-4 right-4">
              <Badge className="bg-accent text-white">BEST VALUE</Badge>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 gradient-cyber opacity-20 blur-3xl"></div>
            <div className="relative z-10">
              <Crown className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold mb-2">Annual</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">$290</span>
                <span className="text-muted-foreground">/year</span>
                <div className="text-safe text-sm mt-1">Save $58 (17% off)</div>
              </div>
              <ul className="space-y-3 mb-8">
                {premiumFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-safe" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handleUpgrade("Annual")}
                className="w-full gradient-cyber glow-effect"
                size="lg"
              >
                Get Started
              </Button>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="glass-card p-6 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h4 className="font-bold mb-2">Advanced Protection</h4>
            <p className="text-sm text-muted-foreground">
              State-of-the-art AI algorithms detect even the most sophisticated threats
            </p>
          </Card>
          <Card className="glass-card p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-secondary" />
            <h4 className="font-bold mb-2">Detailed Analytics</h4>
            <p className="text-sm text-muted-foreground">
              Comprehensive insights into your security posture and threat landscape
            </p>
          </Card>
          <Card className="glass-card p-6 text-center">
            <Zap className="w-12 h-12 mx-auto mb-4 text-accent" />
            <h4 className="font-bold mb-2">Lightning Fast</h4>
            <p className="text-sm text-muted-foreground">
              Real-time scanning with instant results and notifications
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${className}`}>
    {children}
  </span>
);

export default Premium;
