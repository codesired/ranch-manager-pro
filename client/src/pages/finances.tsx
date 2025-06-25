import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DollarSign, Plus, TrendingUp, TrendingDown, Receipt } from "lucide-react";
import { TransactionForm } from "@/components/forms/transaction-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Transaction } from "@shared/schema";

export default function FinancesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/transactions/summary"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions/summary"] });
      toast({
        title: "Success",
        description: "Transaction deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (transactionsLoading || summaryLoading) {
    return (
      <div className="flex h-screen bg-ranch-cream">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-ranch-green animate-pulse" />
            <p className="text-lg text-gray-600">Loading financial data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-ranch-cream">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-hidden">
        <TopHeader title="Financial Management" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 lg:pb-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Income</p>
                    <p className="text-3xl font-bold text-green-600">
                      {summary ? formatCurrency(summary.totalIncome) : "$0"}
                    </p>
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
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <p className="text-3xl font-bold text-red-600">
                      {summary ? formatCurrency(summary.totalExpenses) : "$0"}
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-3xl font-bold text-ranch-green">
                      {summary ? formatCurrency(summary.netProfit) : "$0"}
                    </p>
                  </div>
                  <div className="bg-ranch-green/10 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-ranch-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-ranch-brown">
                      {summary ? formatCurrency(summary.monthlyRevenue) : "$0"}
                    </p>
                  </div>
                  <div className="bg-ranch-brown/10 p-3 rounded-full">
                    <Receipt className="h-6 w-6 text-ranch-brown" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>All Transactions ({transactions.length})</CardTitle>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-ranch-green hover:bg-ranch-light-green text-ranch-beige">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <TransactionForm onSuccess={() => setIsFormOpen(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map((transaction: Transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="py-4 text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          <span className="capitalize">
                            {transaction.category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge
                            className={
                              transaction.type === "income"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm font-medium">
                          <span
                            className={
                              transaction.type === "income"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.type === "income" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="py-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(transaction.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {transactions.length === 0 && (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-600 mb-2">No transactions found</p>
                    <p className="text-gray-500">Get started by adding your first transaction</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
