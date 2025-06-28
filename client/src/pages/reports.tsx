import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReportsPage() {
  const { toast } = useToast();

  const { data: livestock = [] } = useQuery({
    queryKey: ["/api/livestock"],
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: summary } = useQuery({
    queryKey: ["/api/transactions/summary"],
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const generateReport = async (reportType: string) => {
    try {
      let endpoint = '';
      switch (reportType.toLowerCase()) {
        case 'financial summary':
        case 'financial':
          endpoint = '/api/reports/financial';
          break;
        case 'livestock report':
        case 'livestock':
          endpoint = '/api/reports/livestock';
          break;
        case 'inventory report':
        case 'inventory':
          endpoint = '/api/reports/inventory';
          break;
        default:
          endpoint = '/api/reports/livestock';
      }
      
      const response = await fetch(endpoint, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      
      const report = await response.json();
      
      // Convert report to JSON blob and download
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType.toLowerCase().replace(' ', '_')}_report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Generated",
        description: `${reportType} report has been downloaded`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const exportData = async (dataType: string) => {
    try {
      let csvType = '';
      switch (dataType.toLowerCase()) {
        case 'livestock':
          csvType = 'livestock';
          break;
        case 'financial':
          csvType = 'transactions';
          break;
        case 'inventory':
          csvType = 'inventory';
          break;
        default:
          csvType = 'livestock';
      }
      
      const response = await fetch(`/api/export/csv/${csvType}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${csvType}_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data Exported",
        description: `${dataType} data has been exported to CSV`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  // Calculate some basic analytics
  const totalAnimals = livestock.length;
  const totalTransactions = transactions.length;
  const totalInventoryItems = inventory.length;
  
  const healthyAnimals = livestock.filter((animal: any) => animal.healthStatus === "healthy").length;
  const healthPercentage = totalAnimals > 0 ? Math.round((healthyAnimals / totalAnimals) * 100) : 0;
  
  const incomeTransactions = transactions.filter((t: any) => t.type === "income");
  const expenseTransactions = transactions.filter((t: any) => t.type === "expense");
  
  const lowStockItems = inventory.filter((item: any) => {
    const quantity = parseFloat(item.quantity);
    const minStock = parseFloat(item.minStockLevel || "0");
    return quantity <= minStock;
  }).length;

  return (
    <div className="flex h-screen bg-ranch-cream">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-hidden">
        <TopHeader title="Reports & Analytics" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 lg:pb-6">
          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Farm Health Score</p>
                    <p className="text-3xl font-bold text-green-600">{healthPercentage}%</p>
                    <p className="text-xs text-gray-500">{healthyAnimals}/{totalAnimals} healthy</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-ranch-green">
                      {summary ? formatCurrency(summary.totalIncome) : "$0"}
                    </p>
                    <p className="text-xs text-gray-500">{incomeTransactions.length} income transactions</p>
                  </div>
                  <div className="bg-ranch-green/10 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-ranch-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600">
                      {summary ? formatCurrency(summary.totalExpenses) : "$0"}
                    </p>
                    <p className="text-xs text-gray-500">{expenseTransactions.length} expense transactions</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <PieChart className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Inventory Alerts</p>
                    <p className="text-3xl font-bold text-amber-600">{lowStockItems}</p>
                    <p className="text-xs text-gray-500">Items need restocking</p>
                  </div>
                  <div className="bg-amber-100 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Generation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-ranch-green" />
                  Generate Reports
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Report Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Financial Summary</SelectItem>
                      <SelectItem value="livestock">Livestock Report</SelectItem>
                      <SelectItem value="inventory">Inventory Report</SelectItem>
                      <SelectItem value="health">Health Records</SelectItem>
                      <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Time Period</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_week">Last Week</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="last_quarter">Last Quarter</SelectItem>
                      <SelectItem value="last_year">Last Year</SelectItem>
                      <SelectItem value="all_time">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  className="w-full bg-ranch-green hover:bg-ranch-light-green text-ranch-beige"
                  onClick={() => generateReport("Financial Summary")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-6 w-6 text-ranch-brown" />
                  Export Data
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                  Export your farm data for external analysis or backup purposes.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportData("Livestock")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Livestock Data
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportData("Financial")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Financial Data
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportData("Inventory")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Inventory Data
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => exportData("Complete Dataset")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Complete Dataset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Summary */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Activity Summary</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-ranch-green mb-2">{totalAnimals}</div>
                  <div className="text-sm text-gray-600">Total Livestock</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {healthyAnimals} healthy, {totalAnimals - healthyAnimals} need attention
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-ranch-brown mb-2">{totalTransactions}</div>
                  <div className="text-sm text-gray-600">Total Transactions</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {incomeTransactions.length} income, {expenseTransactions.length} expenses
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600 mb-2">{totalInventoryItems}</div>
                  <div className="text-sm text-gray-600">Inventory Items</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lowStockItems} need restocking
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
