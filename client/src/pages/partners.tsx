import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Clock, Mail, UserCheck, Settings, Shield, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";

export default function PartnersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["/api/partners"],
  });

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
      setIsAdminDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

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

  const isOwner = currentUser?.role === 'owner';
  const isAdmin = currentUser?.role === 'admin' || isOwner;

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

  const formatLastActive = (date: string | Date) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Active now";
    } else if (diffInHours < 24) {
      return `Active ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Active ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const getActivityStatus = (date: string | Date) => {
    const now = new Date();
    const lastActive = new Date(date);
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 2) return "online";
    if (diffInHours < 24) return "recent";
    return "offline";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-400";
      case "recent":
        return "bg-yellow-400";
      default:
        return "bg-gray-400";
    }
  };



  if (isLoading) {
    return (
      <div className="flex h-screen bg-ranch-cream">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-ranch-green animate-pulse" />
            <p className="text-lg text-gray-600">Loading partners...</p>
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
        <TopHeader title="Farm Partners" />
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-20 lg:pb-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Partners</p>
                    <p className="text-3xl font-bold text-ranch-green">{partners.length}</p>
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
                    <p className="text-sm font-medium text-gray-600">Active Partners</p>
                    <p className="text-3xl font-bold text-green-600">
                      {partners.filter((p: User) => p.isActive).length}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <UserCheck className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recently Active</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {partners.filter((p: User) => getActivityStatus(p.lastActiveAt || new Date()) !== "offline").length}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Partners List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-ranch-green" />
                All Partners
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {partners.map((partner: User) => (
                  <Card key={partner.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-ranch-green rounded-full flex items-center justify-center text-ranch-beige font-semibold text-lg">
                            {partner.firstName?.[0] || partner.email?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(getActivityStatus(partner.lastActiveAt || new Date()))}`}></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {partner.firstName && partner.lastName 
                              ? `${partner.firstName} ${partner.lastName}`
                              : partner.email || 'User'}
                          </h3>
                          <p className="text-gray-600 text-sm">{partner.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Role:</span>
                          <Badge className={getRoleColor(partner.role || "partner")}>
                            {partner.role || "partner"}
                          </Badge>
                        </div>
                        
                        {partner.email && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{partner.email}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{formatLastActive(partner.lastActiveAt || new Date())}</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm text-gray-500">Status:</span>
                          <Badge 
                            className={
                              partner.isActive 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {partner.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        {isAdmin && (
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(partner);
                                setIsAdminDialogOpen(true);
                              }}
                            >
                              <Settings className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                            {isOwner && partner.id !== currentUser?.id && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deactivateUserMutation.mutate(partner.id)}
                                disabled={deactivateUserMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Deactivate
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {partners.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg text-gray-600 mb-2">No partners found</p>
                  <p className="text-gray-500">Partners will appear here once they join the farm</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Admin Dialog */}
          {isAdmin && (
            <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Manage User - {selectedUser?.firstName || selectedUser?.email}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Change Role</label>
                    <Select
                      defaultValue={selectedUser?.role || 'partner'}
                      onValueChange={(role) => {
                        if (selectedUser) {
                          updateRoleMutation.mutate({ userId: selectedUser.id, role });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="partner">Partner</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Current Role:</strong> {selectedUser?.role || 'partner'}</p>
                    <p><strong>Status:</strong> {selectedUser?.isActive ? 'Active' : 'Inactive'}</p>
                    <p><strong>Last Active:</strong> {selectedUser?.lastActiveAt ? formatLastActive(selectedUser.lastActiveAt) : 'Never'}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
