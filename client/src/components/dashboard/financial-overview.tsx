import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function FinancialOverview() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ["/api/transactions/summary"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Financial Overview</CardTitle>
          <div className="flex space-x-2">
            <Select defaultValue="last_30_days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_30_days">Last 30 days</SelectItem>
                <SelectItem value="last_90_days">Last 90 days</SelectItem>
                <SelectItem value="last_6_months">Last 6 months</SelectItem>
                <SelectItem value="last_year">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {summary ? formatCurrency(summary.totalIncome) : "$0"}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Income</div>
            <div className="text-sm text-green-600 mt-1">
              {summary && summary.totalIncome > 0 ? "+15.3% from last period" : "No income recorded"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {summary ? formatCurrency(summary.totalExpenses) : "$0"}
            </div>
            <div className="text-sm text-gray-500 mt-1">Total Expenses</div>
            <div className="text-sm text-red-600 mt-1">
              {summary && summary.totalExpenses > 0 ? "+8.7% from last period" : "No expenses recorded"}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-ranch-green">
              {summary ? formatCurrency(summary.netProfit) : "$0"}
            </div>
            <div className="text-sm text-gray-500 mt-1">Net Profit</div>
            <div className="text-sm text-green-600 mt-1">
              {summary && summary.netProfit > 0 ? "+23.1% from last period" : "Break even"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}