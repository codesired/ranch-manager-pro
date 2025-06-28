import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Database, Settings, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Redirect } from "wouter";
import type { User, Livestock, Transaction, Inventory } from "@shared/schema";

export default function AdminPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  // Check if user has admin access
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'owner';

  // Fetch all data for admin overview
  const { data: users = [] } = useQuery({
    queryKey: ["/api/partners"],
    enabled: isAdmin,
  });

  const { data: livestock = [] } = useQuery({
    queryKey: ["/api/livestock"],
    enabled: isAdmin,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAdmin,
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
    enabled: isAdmin,
  });

  const { data: livestockStats } = useQuery({
    queryKey: ["/api/livestock/stats"],
    enabled: isAdmin,
  });

  const { data: financialSummary } = useQuery({
    queryKey: ["/api/transactions/summary"],
    enabled: isAdmin,
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Success",
        description: "User deactivated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive",
      });
    },
  });

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      case "partner":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const activeUsers = users.filter((u: User) => u.isActive).length;
  const totalRevenue = financialSummary?.totalIncome || 0;
  const totalExpenses = financialSummary?.totalExpenses || 0;
  const netProfit = financialSummary?.netProfit || 0;

  return (
    <div className="flex h-screen bg-ranch-cream">
      <Sidebar />
      <MobileNav />
      
      <div className="flex-1 overflow-hidden">
        <TopHeader title="Admin Dashboard" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 lg:pb-6">
          {/* Admin Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-ranch-green">{users.length}</p>
                    <p className="text-xs text-gray-500">{activeUsers} active</p>
                  </div>
                  <div className="bg-ranch-green/10 p-3 rounded-full">
                    <Users className="h-6 w-6 text-ranch-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Profit</p>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(netProfit)}</p>
                    <p className="text-xs text-gray-500">All time</p>
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
                    <p className="text-sm font-medium text-gray-600">Total Livestock</p>
                    <p className="text-3xl font-bold text-ranch-brown">{livestock.length}</p>
                    <p className="text-xs text-gray-500">{livestockStats?.healthy || 0} healthy</p>
                  </div>
                  <div className="bg-ranch-brown/10 p-3 rounded-full">
                    <Activity className="h-6 w-6 text-ranch-brown" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Status</p>
                    <p className="text-3xl font-bold text-green-600">Healthy</p>
                    <p className="text-xs text-gray-500">All systems operational</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Database className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Admin Tabs */}
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
            </TabsList>

            {/* Users Management Tab */}
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-ranch-green" />
                    User Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                          <th className="pb-3">User</th>
                          <th className="pb-3">Email</th>
                          <th className="pb-3">Role</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Last Active</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map((user: User) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="py-4 text-sm font-medium text-gray-900">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}`
                                : user.email}
                            </td>
                            <td className="py-4 text-sm text-gray-600">{user.email}</td>
                            <td className="py-4">
                              <Badge className={getRoleColor(user.role || "partner")}>
                                {user.role || "partner"}
                              </Badge>
                            </td>
                            <td className="py-4">
                              <Badge 
                                className={
                                  user.isActive 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="py-4 text-sm text-gray-600">
                              {user.lastActiveAt 
                                ? new Date(user.lastActiveAt).toLocaleDateString()
                                : "Never"}
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <Select
                                  defaultValue={user.role || "partner"}
                                  onValueChange={(role) => 
                                    updateRoleMutation.mutate({ userId: user.id, role })
                                  }
                                  disabled={user.id === currentUser?.id}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="partner">Partner</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    {currentUser?.role === 'owner' && (
                                      <SelectItem value="owner">Owner</SelectItem>
                                    )}
                                  </SelectContent>
                                </Select>
                                {user.id !== currentUser?.id && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => deactivateUserMutation.mutate(user.id)}
                                    disabled={deactivateUserMutation.isPending}
                                  >
                                    Deactivate
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Tab */}
            <TabsContent value="system" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-6 w-6 text-ranch-green" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Database Status</p>
                        <p className="text-lg font-semibold text-green-600">Connected</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Environment</p>
                        <p className="text-lg font-semibold">{process.env.NODE_ENV}</p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Default Admin Emails</h4>
                      <div className="space-y-1">
                        {process.env.DEFAULT_ADMIN_EMAILS?.split(',').map((email) => (
                          <p key={email} className="text-sm text-gray-600">{email.trim()}</p>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">System Statistics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Total Records:</span>
                          <span className="ml-2 font-medium">
                            {livestock.length + transactions.length + inventory.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Active Sessions:</span>
                          <span className="ml-2 font-medium">{activeUsers}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Data Management Tab */}
            <TabsContent value="data" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-6 w-6 text-ranch-green" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Livestock Records</h4>
                          <p className="text-2xl font-bold">{livestock.length}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => window.location.href = '/api/export/csv/livestock'}
                          >
                            Export CSV
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Transactions</h4>
                          <p className="text-2xl font-bold">{transactions.length}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => window.location.href = '/api/export/csv/transactions'}
                          >
                            Export CSV
                          </Button>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Inventory Items</h4>
                          <p className="text-2xl font-bold">{inventory.length}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => window.location.href = '/api/export/csv/inventory'}
                          >
                            Export CSV
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="border-t pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <h4 className="font-medium">Danger Zone</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        These actions are irreversible. Please be certain before proceeding.
                      </p>
                      <Button variant="destructive" disabled>
                        Clear All Data (Coming Soon)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}