import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Dog, DollarSign, Package, AlertTriangle } from "lucide-react";

export function OverviewCards() {
  const { data: livestockStats } = useQuery({
    queryKey: ["/api/livestock/stats"],
  });

  const { data: financialSummary } = useQuery({
    queryKey: ["/api/transactions/summary"],
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cattle</p>
              <p className="text-3xl font-bold text-ranch-green">
                {livestockStats?.total || 0}
              </p>
            </div>
            <div className="bg-ranch-green/10 p-3 rounded-full">
              <Dog className="text-ranch-green text-xl h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {livestockStats?.healthy || 0} healthy
            </span>
            <span className="text-gray-600 ml-1">animals</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-ranch-brown">
                {financialSummary ? formatCurrency(financialSummary.monthlyRevenue) : "$0"}
              </p>
            </div>
            <div className="bg-ranch-brown/10 p-3 rounded-full">
              <DollarSign className="text-ranch-brown text-xl h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">
              {financialSummary ? formatCurrency(financialSummary.netProfit) : "$0"}
            </span>
            <span className="text-gray-600 ml-1">net profit</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Feed Inventory</p>
              <p className="text-3xl font-bold text-amber-600">Active</p>
              <p className="text-xs text-gray-500">monitoring</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <Package className="text-amber-600 text-xl h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-amber-600 font-medium">
              {lowStockItems.length > 0 ? "Low Stock" : "Well Stocked"}
            </span>
            <span className="text-gray-600 ml-1">
              {lowStockItems.length > 0 ? "needs order" : "items"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Health Alerts</p>
              <p className="text-3xl font-bold text-red-600">
                {livestockStats ? (livestockStats.monitoring + livestockStats.sick) : 0}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="text-red-600 text-xl h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-600 font-medium">
              {livestockStats && (livestockStats.monitoring + livestockStats.sick) > 0 
                ? "Needs Attention" 
                : "All Good"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
