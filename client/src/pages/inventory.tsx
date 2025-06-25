import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, AlertTriangle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { InventoryForm } from "@/components/forms/inventory-form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Inventory } from "@shared/schema";

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/inventory/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory/low-stock"] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });

  const filteredInventory = inventory.filter((item: Inventory) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatusColor = (item: Inventory) => {
    const quantity = parseFloat(item.quantity);
    const minStock = parseFloat(item.minStockLevel || "0");
    
    if (quantity <= minStock) {
      return "bg-red-100 text-red-800";
    } else if (quantity <= minStock * 1.5) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-green-100 text-green-800";
  };

  const getStockStatus = (item: Inventory) => {
    const quantity = parseFloat(item.quantity);
    const minStock = parseFloat(item.minStockLevel || "0");
    
    if (quantity <= minStock) {
      return "Low Stock";
    } else if (quantity <= minStock * 1.5) {
      return "Medium Stock";
    }
    return "In Stock";
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(amount));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-ranch-cream">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-ranch-green animate-pulse" />
            <p className="text-lg text-gray-600">Loading inventory...</p>
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
        <TopHeader title="Inventory Management" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 lg:pb-6">
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="mb-6 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    {lowStockItems.length} item(s) are running low on stock
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-6 w-6 text-ranch-green" />
                  Inventory Items ({filteredInventory.length})
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search by name, category, or supplier..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                    />
                  </div>
                  
                  <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-ranch-green hover:bg-ranch-light-green text-ranch-beige">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                      </DialogHeader>
                      <InventoryForm onSuccess={() => setIsFormOpen(false)} />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      <th className="pb-3">Item Name</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Quantity</th>
                      <th className="pb-3">Unit</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Cost/Unit</th>
                      <th className="pb-3">Supplier</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredInventory.map((item: Inventory) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-4 text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          <span className="capitalize">
                            {item.category.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-gray-900">
                          {parseFloat(item.quantity).toLocaleString()}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {item.unit}
                        </td>
                        <td className="py-4">
                          <Badge className={getStockStatusColor(item)}>
                            {getStockStatus(item)}
                          </Badge>
                        </td>
                        <td className="py-4 text-sm text-gray-900">
                          {formatCurrency(item.costPerUnit)}
                        </td>
                        <td className="py-4 text-sm text-gray-600">
                          {item.supplier || "N/A"}
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Edit Feature",
                                  description: "Edit functionality will be implemented soon",
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteMutation.mutate(item.id)}
                              disabled={deleteMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredInventory.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-lg text-gray-600 mb-2">No inventory items found</p>
                    <p className="text-gray-500">
                      {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first inventory item"}
                    </p>
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
