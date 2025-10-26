import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, TrendingUp, FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

const Reports = () => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  const [userScans, setUserScans] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: scans } = await supabase
        .from("scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (scans) {
        setUserScans(scans);
        const riskCounts = {
          safe: scans.filter(s => s.risk_level === "safe").length,
          suspicious: scans.filter(s => s.risk_level === "suspicious").length,
          fraudulent: scans.filter(s => s.risk_level === "fraudulent").length,
        };

        setPieData([
          { name: "Safe", value: riskCounts.safe, color: "hsl(var(--safe))" },
          { name: "Suspicious", value: riskCounts.suspicious, color: "hsl(var(--suspicious))" },
          { name: "Fraudulent", value: riskCounts.fraudulent, color: "hsl(var(--fraudulent))" },
        ]);

        const monthlyData = scans.reduce((acc: any, scan) => {
          const month = new Date(scan.created_at).toLocaleDateString('en', { month: 'short' });
          if (!acc[month]) acc[month] = 0;
          acc[month]++;
          return acc;
        }, {});

        setChartData(
          Object.entries(monthlyData).map(([month, count]) => ({
            month,
            scans: count,
          }))
        );
      }
    };

    loadData();
  }, []);

  const generatePDFReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.setTextColor(59, 130, 246);
      doc.text("EmpowerNet - Security Report", 105, 20, { align: "center" });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, { align: "center" });
      
      // User Details
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("User Information", 14, 45);
      
      doc.setFontSize(10);
      doc.text(`Name: ${profile?.full_name || "N/A"}`, 14, 55);
      doc.text(`Email: ${user.email}`, 14, 62);
      doc.text(`Total Scans: ${userScans.length}`, 14, 69);
      
      // Risk Distribution
      const riskCounts = {
        safe: userScans.filter(s => s.risk_level === "safe").length,
        suspicious: userScans.filter(s => s.risk_level === "suspicious").length,
        fraudulent: userScans.filter(s => s.risk_level === "fraudulent").length,
      };
      
      doc.setFontSize(14);
      doc.text("Risk Distribution", 14, 85);
      
      doc.setFontSize(10);
      doc.text(`Safe: ${riskCounts.safe}`, 14, 95);
      doc.text(`Suspicious: ${riskCounts.suspicious}`, 14, 102);
      doc.text(`Fraudulent: ${riskCounts.fraudulent}`, 14, 109);
      
      // Recent Scans Table
      if (userScans.length > 0) {
        doc.setFontSize(14);
        doc.text("Recent Scan Details", 14, 125);
        
        const tableData = userScans.slice(0, 5).map(scan => [
          new Date(scan.created_at).toLocaleDateString(),
          scan.scan_type,
          scan.risk_level,
          scan.risk_score?.toString() || "N/A",
          scan.analysis?.substring(0, 50) + "..." || "N/A"
        ]);
        
        autoTable(doc, {
          startY: 130,
          head: [["Date", "Type", "Risk Level", "Score", "Analysis"]],
          body: tableData,
          theme: "grid",
          headStyles: { fillColor: [59, 130, 246] },
        });
      }
      
      // Recommendations
      const finalY = (doc as any).lastAutoTable?.finalY || 130;
      doc.setFontSize(14);
      doc.text("Recommendations", 14, finalY + 15);
      
      doc.setFontSize(10);
      const recommendations = [
        "• Always verify sender identity before sharing personal information",
        "• Enable two-factor authentication on all accounts",
        "• Report suspicious activity immediately",
        "• Keep software and antivirus updated",
        "• Use strong, unique passwords for each account"
      ];
      
      recommendations.forEach((rec, idx) => {
        doc.text(rec, 14, finalY + 25 + (idx * 7));
      });
      
      doc.save(`EmpowerNet_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("PDF report downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  const generateDOCXReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const riskCounts = {
        safe: userScans.filter(s => s.risk_level === "safe").length,
        suspicious: userScans.filter(s => s.risk_level === "suspicious").length,
        fraudulent: userScans.filter(s => s.risk_level === "fraudulent").length,
      };

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: "EmpowerNet - Security Report",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Generated: ${new Date().toLocaleString()}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "User Information",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Name: ", bold: true }),
                new TextRun(profile?.full_name || "N/A"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Email: ", bold: true }),
                new TextRun(user.email || "N/A"),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: "Total Scans: ", bold: true }),
                new TextRun(userScans.length.toString()),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Risk Distribution",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph(`Safe: ${riskCounts.safe}`),
            new Paragraph(`Suspicious: ${riskCounts.suspicious}`),
            new Paragraph(`Fraudulent: ${riskCounts.fraudulent}`),
            new Paragraph({ text: "" }),
            new Paragraph({
              text: "Recommendations",
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph("• Always verify sender identity before sharing personal information"),
            new Paragraph("• Enable two-factor authentication on all accounts"),
            new Paragraph("• Report suspicious activity immediately"),
            new Paragraph("• Keep software and antivirus updated"),
            new Paragraph("• Use strong, unique passwords for each account"),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `EmpowerNet_Report_${new Date().toISOString().split('T')[0]}.docx`);
      toast.success("DOCX report downloaded successfully!");
    } catch (error) {
      console.error("DOCX generation error:", error);
      toast.error("Failed to generate DOCX report");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-gradient">Analytics & Reports</h1>
            <p className="text-muted-foreground">
              Visualize your scanning activity and threat trends
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generatePDFReport} className="gradient-primary glow-effect">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={generateDOCXReport} variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Download DOCX
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Scan Activity
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="scans" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Risk Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
